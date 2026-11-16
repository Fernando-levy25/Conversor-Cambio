"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import CurrencySelect from "@/components/CurrencySelect";
import NoteField from "@/components/NoteField";
import { ApiClientError } from "@/lib/api-client";
import { checkNote, parseTargetRateInput, SAME_CURRENCY_MESSAGE } from "@/lib/form-validation";
import type { Currency, WatchedPairCreate } from "@/types";

interface WatchedPairFormProps {
  pair?: {
    base: string;
    quote: string;
  };
  currencies?: Currency[];
  onSubmit: (input: WatchedPairCreate) => Promise<void>;
  linkOnDuplicate?: boolean;
}

export default function WatchedPairForm({
  pair,
  currencies = [],
  onSubmit,
  linkOnDuplicate = false,
}: WatchedPairFormProps) {
  const [base, setBase] = useState(pair?.base ?? "USD");
  const [quote, setQuote] = useState(pair?.quote ?? "BRL");
  const [targetRate, setTargetRate] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(null);
    setDuplicate(false);

    const target = parseTargetRateInput(targetRate);
    const noteError = checkNote(note);
    if ("error" in target) {
      setError(target.error);
      return;
    }
    if (noteError) {
      setError(noteError);
      return;
    }
    if (base === quote) {
      setError(SAME_CURRENCY_MESSAGE);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ base, quote, target_rate: target.value, note: note.trim() || null });
      setSuccess(`Par ${base}/${quote} adicionado aos monitorados.`);
      setTargetRate("");
      setNote("");
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409) {
        setDuplicate(true);
        setError(`Par já monitorado: ${base}/${quote}.`);
      } else {
        setError(err instanceof Error ? err.message : "Não foi possível adicionar o par.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const idPrefix = pair ? "monitor" : "new-pair";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm">
      {!pair && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CurrencySelect id={`${idPrefix}-base`} label="Moeda de origem" value={base} currencies={currencies} onChange={setBase} />
          <CurrencySelect id={`${idPrefix}-quote`} label="Moeda de destino" value={quote} currencies={currencies} onChange={setQuote} />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-target`} className="font-medium">
          Cotação-alvo (1 {base} em {quote})
        </label>
        <input
          id={`${idPrefix}-target`}
          type="text"
          inputMode="decimal"
          value={targetRate}
          onChange={(event) => setTargetRate(event.target.value)}
          aria-invalid={error !== null && !duplicate}
          aria-describedby={error ? `${idPrefix}-error` : undefined}
          className="w-full rounded-md border border-slate-400 px-3 py-2"
        />
      </div>

      <NoteField id={`${idPrefix}-note`} value={note} onChange={setNote} />

      {error && (
        <div id={`${idPrefix}-error`} role="alert" className="text-red-800">
          <p>{error}</p>
          {duplicate && linkOnDuplicate && (
            <Link href="/watched-pairs" className="font-medium underline underline-offset-4">
              Ver pares monitorados
            </Link>
          )}
        </div>
      )}
      <p aria-live="polite" className="text-green-800">
        {success}
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-500"
      >
        {submitting ? "Salvando..." : "Monitorar par"}
      </button>
    </form>
  );
}
