import Database from "better-sqlite3";
import {
  deleteWatchedPair,
  findWatchedPair,
  getWatchedPairById,
  insertWatchedPair,
  listWatchedPairs,
  updateWatchedPair,
} from "@/lib/db";
import { getLatestRates } from "@/lib/frankfurter";
import { ApiError } from "@/lib/http";
import type {
  WatchedPair,
  WatchedPairCreate,
  WatchedPairUpdate,
  WatchedPairWithRate,
} from "@/types";

export async function listWatchedPairsWithRates(): Promise<WatchedPairWithRate[]> {
  const pairs = listWatchedPairs();

  const quotesByBase = new Map<string, string[]>();
  for (const pair of pairs) {
    quotesByBase.set(pair.base, [...(quotesByBase.get(pair.base) ?? []), pair.quote]);
  }

  const ratesByBase = new Map<string, Map<string, number>>();
  await Promise.all(
    [...quotesByBase].map(async ([base, quotes]) => {
      ratesByBase.set(base, await getLatestRates(base, quotes));
    }),
  );

  return pairs.map((pair) => {

    const currentRate = ratesByBase.get(pair.base)?.get(pair.quote) ?? null;
    return {
      ...pair,
      current_rate: currentRate,
      target_reached: currentRate === null ? null : currentRate >= pair.target_rate,
    };
  });
}

const DUPLICATE_MESSAGE = "Este par de moedas já está sendo monitorado.";

export function createWatchedPair(input: WatchedPairCreate): WatchedPair {
  if (findWatchedPair(input.base, input.quote)) {
    throw new ApiError(409, DUPLICATE_MESSAGE);
  }
  try {
    return insertWatchedPair(input.base, input.quote, input.target_rate, input.note);
  } catch (err) {

    if (err instanceof Database.SqliteError && err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      throw new ApiError(409, DUPLICATE_MESSAGE);
    }
    throw err;
  }
}

const NOT_FOUND_MESSAGE = "Par monitorado não encontrado.";

export function editWatchedPair(id: number, changes: WatchedPairUpdate): WatchedPair {
  const current = getWatchedPairById(id);
  if (!current) {
    throw new ApiError(404, NOT_FOUND_MESSAGE);
  }

  const updated = updateWatchedPair(
    id,
    changes.target_rate ?? current.target_rate,
    changes.note !== undefined ? changes.note : current.note,
  );
  if (!updated) {
    throw new ApiError(404, NOT_FOUND_MESSAGE);
  }
  return updated;
}

export function removeWatchedPair(id: number): void {
  if (!deleteWatchedPair(id)) {
    throw new ApiError(404, NOT_FOUND_MESSAGE);
  }
}
