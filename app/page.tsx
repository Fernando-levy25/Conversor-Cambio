"use client";

import { useRef, useState } from "react";
import  ConvertForm, { type ConvertValues } from "@/components/ConvertForm"
import ConvertResult from "@/components/ConvertResult";
import ErrorMessage from "@/components/ErrorMessage";
import Spinner from "@/components/Spinner";
import { convert, isAbortError } from "@/lib/api-client";
import { useCurrencies } from "@/lib/use-currencies";
import type { ConversionResult } from "@/types";

export default function HomePage() {
    const { currencies, loading: loadingCurrencies, error: currenciesError, retry } = useCurrencies();
const [result, setResult] = useState<ConversionResult | null>(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  async function handleConvert({ from, to, amount }: ConvertValues) {
    // Cancela uma conversão anterior ainda em andamento.
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setConverting(true);
    setError(null);
    try {
      setResult(await convert(from, to, amount, controller.signal));
    } catch (err) {
      if (isAbortError(err)) return;
      setResult(null);
      setError(err instanceof Error ? err.message : "Não foi possível converter.");
    } finally {
      if (controllerRef.current === controller) {
        setConverting(false);
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Conversor de moedas</h1>
        <p className="mt-1 text-slate-700">Converta valores usando a cotação mais recente.</p>
      </div>

      {loadingCurrencies && <Spinner label="Carregando moedas..." />}
      {currenciesError && <ErrorMessage message={currenciesError} onRetry={retry} />}
      {!loadingCurrencies && !currenciesError && (
        <ConvertForm currencies={currencies} loading={converting} onConvert={handleConvert} />
      )}

      <div aria-live="polite">
        {converting && <Spinner label="Convertendo..." />}
        {!converting && result && <ConvertResult result={result} />}
      </div>
      {!converting && error && <ErrorMessage message={error} />}
    </div>
  );
}
