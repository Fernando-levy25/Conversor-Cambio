"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import NoteField from "@/components/NoteField";
import TargetBadge from "@/components/TargetBadge";
import { formatDate, formatRate } from "@/lib/format";
import { checkNote, parseTargetRateInput } from "@/lib/form-validation";
import type { WatchedPairUpdate, WatchedPairWithRate } from "@/types";

interface WatchedPairItemProps {
  pair: WatchedPairWithRate;
  onUpdate: (id: number, changes: WatchedPairUpdate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

// Um par monitorado: exibição, edição (cotação-alvo e observação) e remoção.
export default function WatchedPairItem({ pair, onUpdate, onDelete }: WatchedPairItemProps) {
  const [editing, setEditing] = useState(false);
  const [targetRate, setTargetRate] = useState(String(pair.target_rate));
  const [note, setNote] = useState(pair.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = `${pair.base}/${pair.quote}`;
  const idPrefix = `pair-${pair.id}`;

  function startEditing() {
    setTargetRate(String(pair.target_rate));
    setNote(pair.note ?? "");
    setError(null);
    setEditing(true);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = parseTargetRateInput(targetRate);
    if ("error" in target) {
      setError(target.error);
      return;
    }
    const noteError = checkNote(note);
    if (noteError) {
      setError(noteError);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await onUpdate(pair.id, { target_rate: target.value, note: note.trim() || null });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar as alterações.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Remover o par ${label} dos monitorados?`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onDelete(pair.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível remover o par.");
      setBusy(false);
    }
  }

  return (
    <article aria-labelledby={`${idPrefix}-title`} className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 id={`${idPrefix}-title`} className="text-lg font-semibold">
          <Link href={`/rates/${pair.base}/${pair.quote}`} className="text-blue-800 underline underline-offset-4">
            {label}
          </Link>
        </h3>
        <TargetBadge reached={pair.target_reached} />
      </div>

      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-slate-700">Cotação atual</dt>
          <dd className="font-semibold tabular-nums">
            {pair.current_rate === null ? "Indisponível" : `${formatRate(pair.current_rate)} ${pair.quote}`}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-700">Cotação-alvo</dt>
          <dd className="font-semibold tabular-nums">
            {formatRate(pair.target_rate)} {pair.quote}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-slate-700">Incluído em</dt>
          <dd>{formatDate(pair.created_at)}</dd>
        </div>
      </dl>

      {!editing && (
        <p className="break-words text-slate-800">
          <span className="font-medium">Observação: </span>
          {pair.note ?? <span className="text-slate-600">sem observação</span>}
        </p>
      )}

      {editing ? (
        <form onSubmit={handleSave} noValidate className="flex flex-col gap-3 border-t border-slate-200 pt-3">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${idPrefix}-target`} className="font-medium">
              Cotação-alvo (1 {pair.base} em {pair.quote})
            </label>
            <input
              id={`${idPrefix}-target`}
              type="text"
              inputMode="decimal"
              value={targetRate}
              autoFocus
              onChange={(event) => setTargetRate(event.target.value)}
              aria-invalid={error !== null}
              aria-describedby={error ? `${idPrefix}-error` : undefined}
              className="w-full rounded-md border border-slate-400 px-3 py-2"
            />
          </div>
          <NoteField id={`${idPrefix}-note`} value={note} onChange={setNote} />
          {error && (
            <p id={`${idPrefix}-error`} role="alert" className="text-red-800">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-500"
            >
              {busy ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={busy}
              className="rounded-md border border-slate-400 px-4 py-2 hover:bg-slate-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          {error && (
            <p role="alert" className="text-red-800">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startEditing}
              disabled={busy}
              aria-label={`Editar ${label}`}
              className="rounded-md border border-slate-400 px-4 py-2 hover:bg-slate-100"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              aria-label={`Remover ${label}`}
              className="rounded-md border border-red-700 px-4 py-2 text-red-800 hover:bg-red-50"
            >
              {busy ? "Removendo..." : "Remover"}
            </button>
          </div>
        </>
      )}
    </article>
  );
}
