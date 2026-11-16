import { console } from "inspector";
import type {
    ConversionResult,
    Currency,
    RatesResponse,
    WatchedPair,
    WatchedPairCreate,
    WatchedPairUpdate,
    WatchedPairWithRate,
} from "@/types";

export class ApiClientError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiClientError";
        this.status = status;
    }
}

async function request(url:string, init?: RequestInit): Promise<Response> {
    let response: Response;
    try {
        response = await fetch(url, init);
    } catch (err) {
      if (isAbortError(err)) {
        throw err;
      }
      throw new ApiClientError(0, "Não foi possível conectar ao servidor. Tente novamente.");
    }

    if (!response.ok) {
        let message = `Erro inesperado (código ${response.status}).`;
        try {
            const body: unknown = await response.json();
            if (typeof body === "object" && body !== null && "error" in body && typeof body.error === "string") {
                message = body.error;
            }
        } catch {

        }
        throw new ApiClientError(response.status, message);
    }
    return response;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await request(url, init);
    return (await response.json()) as T;
}

function jsonInit(method: string, body: unknown): RequestInit {
    return {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    };
}

export async function fetchCurrencies(signal?: AbortSignal): Promise<Currency[]> {
    const data = await requestJson<{ currencies: Currency[] }>("/api/currencies", {signal });
    return data.currencies;
}

export function convert(
  from: string,
  to: string,
  amount: number,
  signal?: AbortSignal,
): Promise<ConversionResult> {
  const params = new URLSearchParams({ from, to, amount: String(amount) });
  return requestJson<ConversionResult>(`/api/convert?${params}`, { signal });
}

export function fetchRates(
  base: string,
  quote: string,
  start: string,
  end: string,
  signal?: AbortSignal,
): Promise<RatesResponse> {
  const params = new URLSearchParams({ start, end });
  const path = `/api/rates/${encodeURIComponent(base)}/${encodeURIComponent(quote)}`;
  return requestJson<RatesResponse>(`${path}?${params}`, { signal });
}

export async function listWatchedPairs(signal?: AbortSignal): Promise<WatchedPairWithRate[]> {
  const data = await requestJson<{ watched_pairs: WatchedPairWithRate[] }>(
    "/api/watched-pairs",
    { signal },
  );
  return data.watched_pairs;
}

export function createWatchedPair(
  input: WatchedPairCreate,
  signal?: AbortSignal,
): Promise<WatchedPair> {
  return requestJson<WatchedPair>("/api/watched-pairs", { ...jsonInit("POST", input), signal });
}

export function updateWatchedPair(
  id: number,
  changes: WatchedPairUpdate,
  signal?: AbortSignal,
): Promise<WatchedPair> {
  return requestJson<WatchedPair>(`/api/watched-pairs/${id}`, {
    ...jsonInit("PATCH", changes),
    signal,
  });
}

// DELETE responde 204 sem corpo.
export async function deleteWatchedPair(id: number, signal?: AbortSignal): Promise<void> {
  await request(`/api/watched-pairs/${id}`, { method: "DELETE", signal });
}

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}
