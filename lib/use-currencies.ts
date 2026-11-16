"use client";

import { useEffect, useState } from "react";
import { fetchCurrencies, isAbortError } from "@/lib/api-client";
import type { Currency } from "@/types";

export function useCurrencies() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchCurrencies(controller.signal)
      .then((list) => {
        setCurrencies(list);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isAbortError(err)) {
          setError(err instanceof Error ? err.message : "Erro ao carregar as moedas.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setLoading(true);
    setAttempt((n) => n + 1);
  }

  return { currencies, loading, error, retry };
}
