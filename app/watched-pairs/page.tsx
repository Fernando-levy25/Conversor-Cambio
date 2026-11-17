"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import Spinner from "@/components/Spinner";
import WatchedPairForm from "@/components/WatchedPairForm";
import WatchedPairItem from "@/components/WatchedPairItem";
import {
  createWatchedPair,
  deleteWatchedPair,
  isAbortError,
  listWatchedPairs,
  updateWatchedPair,
} from "@/lib/api-client";
import { useCurrencies } from "@/lib/use-currencies";
import type { WatchedPairCreate, WatchedPairUpdate, WatchedPairWithRate } from "@/types";

// Página de gerenciamento dos pares monitorados (dados persistidos no SQLite).
export default function WatchedPairsPage() {
  const currencies = useCurrencies();
  const [pairs, setPairs] = useState<WatchedPairWithRate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Carrega a lista (com cotações atuais). Recarrega quando reloadKey muda.
  useEffect(() => {
    const controller = new AbortController();

    listWatchedPairs(controller.signal)
      .then((list) => {
        setPairs(list);
        setError(null);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar os pares.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  function reload() {
    setLoading(true);
    setReloadKey((n) => n + 1);
  }

  // Após incluir ou editar, busca a lista de novo para obter cotação e meta atualizadas.
  // Só termina depois da nova lista, para o formulário não exibir dados antigos.
  async function refreshAfterChange(message: string) {
    setStatus(message);
    try {
      setPairs(await listWatchedPairs());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar a lista.");
    }
  }

  async function handleCreate(input: WatchedPairCreate) {
    await createWatchedPair(input);
    await refreshAfterChange(`Par ${input.base}/${input.quote} adicionado.`);
  }

  async function handleUpdate(id: number, changes: WatchedPairUpdate) {
    await updateWatchedPair(id, changes);
    await refreshAfterChange("Alterações salvas.");
  }

  async function handleDelete(id: number) {
    await deleteWatchedPair(id);
    const removed = pairs?.find((pair) => pair.id === id);
    setPairs((current) => current?.filter((pair) => pair.id !== id) ?? null);
    setStatus(removed ? `Par ${removed.base}/${removed.quote} removido.` : "Par removido.");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Pares monitorados</h1>
        <p className="mt-1 text-slate-700">
          Acompanhe a cotação atual e saiba quando ela alcança a sua cotação-alvo.
        </p>
      </div>

      <p aria-live="polite" className="sr-only">
        {status}
      </p>

      <section aria-labelledby="list-title" className="flex flex-col gap-4">
        <h2 id="list-title" className="text-xl font-semibold">
          Seus pares
        </h2>

        <div aria-live="polite">
          {loading && <Spinner label={pairs ? "Atualizando cotações..." : "Carregando pares..."} />}
        </div>

        {error && <ErrorMessage message={error} onRetry={reload} />}

        {pairs && pairs.length === 0 && (
          <EmptyState title="Nenhum par monitorado.">Use o formulário abaixo para adicionar um par.</EmptyState>
        )}

        {pairs && pairs.length > 0 && (
          <ul className="flex flex-col gap-4">
            {pairs.map((pair) => (
              <li key={pair.id}>
                <WatchedPairItem pair={pair} onUpdate={handleUpdate} onDelete={handleDelete} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="add-title" className="flex flex-col gap-3">
        <h2 id="add-title" className="text-xl font-semibold">
          Adicionar par
        </h2>
        {currencies.loading && <Spinner label="Carregando moedas..." />}
        {currencies.error && <ErrorMessage message={currencies.error} onRetry={currencies.retry} />}
        {!currencies.loading && !currencies.error && (
          <WatchedPairForm currencies={currencies.currencies} onSubmit={handleCreate} />
        )}
      </section>
    </div>
  );
}
