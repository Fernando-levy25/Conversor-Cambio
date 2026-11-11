"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export interface WatchedPair {
  id: number;
  base: string;
  quote: string;
  target_rate: number | null;
  note: string | null;
}

export interface WatchedPairUpdate {
  target_rate: number | null;
  note: string | null;
}

interface WatchedPairItemProps {
  pair: WatchedPair;
  onUpdate: (id: number, data: WatchedPairUpdate) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
}

export default function WatchedPairItem({
  pair,
  onUpdate,
  onRemove,
}: WatchedPairItemProps) {
  const [editing, setEditing] = useState(false);
  const [targetRate, setTargetRate] = useState(
    pair.target_rate?.toString() ?? "",
  );
  const [note, setNote] = useState(pair.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setTargetRate(pair.target_rate?.toString() ?? "");
    setNote(pair.note ?? "");
    setError(null);
    setEditing(true);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedRate = targetRate.trim().replace(",", ".");
    let parsedRate: number | null = null;
    if (trimmedRate !== "") {
      parsedRate = Number(trimmedRate);
      if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
        setError("A taxa alvo deve ser um número maior que zero.");
        return;
      }
    }

    setBusy(true);
    setError(null);
    try {
      await onUpdate(pair.id, {
        target_rate: parsedRate,
        note: note.trim() === "" ? null : note.trim(),
      });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!window.confirm(`Remover o par ${pair.base}/${pair.quote}?`)) return;

    setBusy(true);
    setError(null);
    try {
      await onRemove(pair.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover.");
      setBusy(false);
    }
  }

  return (
    <li className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/rates/${pair.base}/${pair.quote}`}
            className="text-lg font-semibold text-blue-700 hover:underline"
          >
            {pair.base}/{pair.quote}
          </Link>

          {!editing && (
            <dl className="mt-1 space-y-0.5 text-sm text-gray-600">
              <div className="flex gap-1">
                <dt className="font-medium">Taxa alvo:</dt>
                <dd>{pair.target_rate ?? "—"}</dd>
              </div>
              {pair.note && (
                <div className="flex gap-1">
                  <dt className="font-medium">Nota:</dt>
                  <dd className="break-words">{pair.note}</dd>
                </div>
              )}
            </dl>
          )}
        </div>

        {!editing && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startEditing}
              disabled={busy}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              {busy ? "Removendo…" : "Remover"}
            </button>
          </div>
        )}
      </div>

      {editing && (
        <form onSubmit={handleSave} className="mt-3 space-y-3">
          <div>
            <label
              htmlFor={`target-rate-${pair.id}`}
              className="block text-sm font-medium text-gray-700"
            >
              Taxa alvo
            </label>
            <input
              id={`target-rate-${pair.id}`}
              type="text"
              inputMode="decimal"
              value={targetRate}
              onChange={(e) => setTargetRate(e.target.value)}
              placeholder="Ex.: 5.25"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label
              htmlFor={`note-${pair.id}`}
              className="block text-sm font-medium text-gray-700"
            >
              Nota
            </label>
            <textarea
              id={`note-${pair.id}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={busy}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </li>
  );
}
