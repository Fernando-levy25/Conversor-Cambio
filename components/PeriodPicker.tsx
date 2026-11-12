"use client";

import { useState, type FormEvent } from "react";
import { addDays, checkPeriod, todayUtc } from "@/lib/dates";

interface PeriodPickerProps {
  start: string;
  end: string;
  loading: boolean;
  onApply: (start: string, end: string) => void;
}

const SHORTCUTS = [
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
  { label: "1 ano", days: 365 },
];

// Seleção do período do histórico, com as mesmas regras do backend.
export default function PeriodPicker({ start, end, loading, onApply }: PeriodPickerProps) {
  const [draftStart, setDraftStart] = useState(start);
  const [draftEnd, setDraftEnd] = useState(end);
  const [error, setError] = useState<string | null>(null);
  const today = todayUtc();

  function apply(newStart: string, newEnd: string) {
    const message = checkPeriod(newStart, newEnd);
    setError(message);
    if (!message) {
      onApply(newStart, newEnd);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    apply(draftStart, draftEnd);
  }

  function applyShortcut(days: number) {
    const newStart = addDays(today, -days);
    setDraftStart(newStart);
    setDraftEnd(today);
    apply(newStart, today);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-semibold">Período</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="start">Data inicial</label>
            <input
              id="start"
              type="date"
              value={draftStart}
              max={today}
              onChange={(event) => setDraftStart(event.target.value)}
              aria-invalid={error !== null}
              aria-describedby={error ? "period-error" : undefined}
              className="w-full rounded-md border border-slate-400 px-3 py-2"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="end">Data final</label>
            <input
              id="end"
              type="date"
              value={draftEnd}
              max={today}
              onChange={(event) => setDraftEnd(event.target.value)}
              aria-invalid={error !== null}
              aria-describedby={error ? "period-error" : undefined}
              className="w-full rounded-md border border-slate-400 px-3 py-2"
            />
          </div>
        </div>
      </fieldset>

      {error && (
        <p id="period-error" role="alert" className="text-red-800">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-500"
        >
          Aplicar período
        </button>
        <span className="text-slate-700">ou últimos:</span>
        {SHORTCUTS.map((shortcut) => (
          <button
            key={shortcut.days}
            type="button"
            disabled={loading}
            onClick={() => applyShortcut(shortcut.days)}
            className="rounded-md border border-slate-400 px-3 py-2 hover:bg-slate-100 disabled:text-slate-500"
          >
            {shortcut.label}
          </button>
        ))}
      </div>
    </form>
  );
}
