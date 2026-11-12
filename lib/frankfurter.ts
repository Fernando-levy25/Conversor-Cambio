import { ApiError } from "@/lib/http";
import type { Currency, RatePoint } from "@/types";


const BASE_URL = "https://api.frankfurter.dev/v2";
const TIMEOUT_MS = 8000;
const CURRENCIES_CACHE_MS = 10 * 60 * 1000;

const UPSTREAM_ERROR = "Falha ao consultar a API de câmbio.";

interface FrankfurterCurrency {
  iso_code: string;
  name: string;
  type: string;
}

interface FrankfurterRate {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

async function fetchJson(path: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {

    console.error("Frankfurter indisponível:", err);
    throw new ApiError(502, UPSTREAM_ERROR);
  }

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    
    console.error(`Frankfurter respondeu ${response.status} para ${path}`);
    throw new ApiError(502, UPSTREAM_ERROR);
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError(502, UPSTREAM_ERROR);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCurrency(value: unknown): value is FrankfurterCurrency {
  return (
    isRecord(value) &&
    typeof value.iso_code === "string" &&
    typeof value.name === "string" &&
    typeof value.type === "string"
  );
}

function isRate(value: unknown): value is FrankfurterRate {
  return (
    isRecord(value) &&
    typeof value.date === "string" &&
    typeof value.base === "string" &&
    typeof value.quote === "string" &&
    typeof value.rate === "number"
  );
}

function parseRateList(json: unknown): FrankfurterRate[] {
  if (!Array.isArray(json) || !json.every(isRate)) {
    throw new ApiError(502, UPSTREAM_ERROR);
  }
  return json;
}

let currenciesCache: { data: Currency[]; expiresAt: number } | null = null;

export async function getCurrencies(): Promise<Currency[]> {
  if (currenciesCache && currenciesCache.expiresAt > Date.now()) {
    return currenciesCache.data;
  }

  const json = await fetchJson("/currencies");
  if (!Array.isArray(json) || !json.every(isCurrency)) {
    throw new ApiError(502, UPSTREAM_ERROR);
  }

  const data = json
    .filter((item) => item.type === "currency")
    .map((item) => ({ code: item.iso_code, name: item.name }));

  currenciesCache = { data, expiresAt: Date.now() + CURRENCIES_CACHE_MS };
  return data;
}

export async function getCurrencyCodes(): Promise<string[]> {
  const currencies = await getCurrencies();
  return currencies.map((currency) => currency.code);
}

export async function getRate(base: string, quote: string, date?: string): Promise<RatePoint> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  const json = await fetchJson(
    `/rate/${encodeURIComponent(base)}/${encodeURIComponent(quote)}${query}`,
  );

  if (json === null) {
    throw new ApiError(404, `Cotação não encontrada para o par ${base}/${quote}.`);
  }
  if (!isRate(json)) {
    throw new ApiError(502, UPSTREAM_ERROR);
  }
  return { date: json.date, rate: json.rate };
}

export async function getLatestRates(base: string, quotes: string[]): Promise<Map<string, number>> {
  const params = new URLSearchParams({ base, quotes: quotes.join(",") });
  const json = await fetchJson(`/rates?${params}`);

  if (json === null) {
    return new Map();
  }
  return new Map(parseRateList(json).map((item) => [item.quote, item.rate]));
}

export async function getRateSeries(
  base: string,
  quote: string,
  start: string,
  end: string,
): Promise<RatePoint[]> {
  const params = new URLSearchParams({ base, quotes: quote, from: start, to: end });
  const json = await fetchJson(`/rates?${params}`);

  if (json === null) {
    return [];
  }
  return parseRateList(json)
    .filter((item) => item.quote === quote)
    .map((item) => ({ date: item.date, rate: item.rate }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
