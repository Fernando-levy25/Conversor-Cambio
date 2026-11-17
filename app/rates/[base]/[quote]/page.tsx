"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import PeriodPicker from "@/components/PeriodPicker";
import RatesTable from "@/components/RatesTable";
import Spinner from "@/components/Spinner";
import StatsCards from "@/components/StatsCards";
import WatchedPairForm from "@/components/WatchedPairForm";
import { createWatchedPair, fetchRates, isAbortError } from "@/lib/api-client";
import { defaultPeriod } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import type { RatesResponse, WatchedPairCreate } from "@/types";

export default function RatesPage({
  params,
}: {
  params: Promise<{ base: string; quote: string }>;
}) {
  const route = use(params);
  const base = route.base.toUpperCase();
  const quote = route.quote.toUpperCase();

  const [period, setPeriod] = useState(defaultPeriod);
  const [data, setData] = useState<RatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [showMonitorForm, setShowMonitorForm] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetchRates(base, quote, period.start, period.end, controller.signal)
      .then((response) => {
        setData(response);
        setError(null);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setData(null);
        setError(err instanceof Error ? err.message : "Não foi possível carregar o histórico.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [base, quote, period, attempt]);

  function changePeriod(start: string, end: string) {
    setLoading(true);
    setPeriod({ start, end });
  }

  function retry() {
    setLoading(true);
    setAttempt((n) => n + 1);
  }

  async function handleMonitor(input: WatchedPairCreate) {
    await createWatchedPair(input);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          Histórico {base}/{quote}
        </h1>
        <p className="mt-1 text-slate-700">
          Quanto vale 1 {base} em {quote} ao longo do período escolhido.
        </p>
      </div>

      <PeriodPicker start={period.start} end={period.end} loading={loading} onApply={changePeriod} />

      <section aria-labelledby="history-title" className="flex flex-col gap-4">
        <h2 id="history-title" className="text-xl font-semibold">
          {formatDate(period.start)} a {formatDate(period.end)}
        </h2>

        <div aria-live="polite">{loading && <Spinner label="Carregando cotações..." />}</div>

        {!loading && error && <ErrorMessage message={error} onRetry={retry} />}

        {!loading && data && data.rates.length === 0 && (
          <EmptyState title="Nenhuma cotação encontrada neste período.">
            Escolha outro período ou outro par de moedas.
          </EmptyState>
        )}

        {!loading && data && data.stats && data.rates.length > 0 && (
          <>
            <StatsCards quote={quote} stats={data.stats} />
            <RatesTable base={base} quote={quote} rates={data.rates} />
          </>
        )}
      </section>

      {!error && (
        <section aria-labelledby="monitor-title" className="flex flex-col gap-3">
          <h2 id="monitor-title" className="text-xl font-semibold">
            Monitorar este par
          </h2>
          {showMonitorForm ? (
            <WatchedPairForm pair={{ base, quote }} onSubmit={handleMonitor} linkOnDuplicate />
          ) : (
            <button
              type="button"
              onClick={() => setShowMonitorForm(true)}
              className="self-start rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
            >
              Monitorar este par
            </button>
          )}
          <Link href="/watched-pairs" className="self-start font-medium text-blue-800 underline underline-offset-4">
            Ver pares monitorados
          </Link>
        </section>
      )}
    </div>
  );
}
