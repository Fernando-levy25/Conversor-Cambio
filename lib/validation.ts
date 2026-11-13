import { checkPeriod, defaultPeriod } from "@/lib/dates";
import { NOTE_MAX_LENGTH } from "@/lib/form-validation";
import { ApiError } from "@/lib/http";
import type { WatchedPairCreate, WatchedPairUpdate } from "@/types";


const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireValue(value: string | null | undefined, message: string): string {
  if (value === null || value === undefined || value.trim() === "") {
    throw new ApiError(400, message);
  }
  return value;
}

export function normalizeCurrency(
  value: string | null | undefined,
  field: string,
  validCodes: string[],
): string {
  const code = requireValue(value, `O parâmetro '${field}' é obrigatório.`).trim().toUpperCase();
  if (!CURRENCY_PATTERN.test(code)) {
    throw new ApiError(400, `Código de moeda inválido em '${field}': use 3 letras (ex.: USD).`);
  }
  if (!validCodes.includes(code)) {
    throw new ApiError(400, `A moeda '${code}' não está disponível.`);
  }
  return code;
}

export function ensureDifferentCurrencies(base: string, quote: string): void {
  if (base === quote) {
    throw new ApiError(400, "As moedas de origem e de destino devem ser diferentes.");
  }
}

export function parseAmount(value: string | null | undefined): number {
  const amount = Number(requireValue(value, "O parâmetro 'amount' é obrigatório."));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, "O valor deve ser um número maior que zero.");
  }
  return amount;
}

export function parseId(value: string): number {
  const id = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(400, "O identificador deve ser um número inteiro positivo.");
  }
  return id;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}


function parseObjectBody(body: unknown): Record<string, unknown> {
  if (!isPlainObject(body)) {
    throw new ApiError(400, "O corpo da requisição deve ser um objeto JSON.");
  }
  return body;
}


function ensureAllowedFields(body: Record<string, unknown>, allowed: string[]): void {
  const invalid = Object.keys(body).filter((key) => !allowed.includes(key));
  if (invalid.length > 0) {
    throw new ApiError(
      400,
      `Campo(s) não permitido(s): ${invalid.join(", ")}. Permitidos: ${allowed.join(", ")}.`,
    );
  }
}

function asOptionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || typeof value === "string") {
    return value;
  }
  throw new ApiError(400, `O campo '${field}' deve ser um texto.`);
}

function parseTargetRate(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new ApiError(400, "A cotação-alvo ('target_rate') deve ser um número maior que zero.");
  }
  return value;
}

function parseNote(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== "string") {
    throw new ApiError(400, "A observação ('note') deve ser um texto.");
  }
  const note = value.trim();
  if (note.length > NOTE_MAX_LENGTH) {
    throw new ApiError(400, `A observação deve ter no máximo ${NOTE_MAX_LENGTH} caracteres.`);
  }
  return note === "" ? null : note;
}

export function parseWatchedPairInput(input: unknown, validCodes: string[]): WatchedPairCreate {
  const body = parseObjectBody(input);
  ensureAllowedFields(body, ["base", "quote", "target_rate", "note"]);

  const base = normalizeCurrency(asOptionalString(body.base, "base"), "base", validCodes);
  const quote = normalizeCurrency(asOptionalString(body.quote, "quote"), "quote", validCodes);
  ensureDifferentCurrencies(base, quote);

  if (body.target_rate === undefined) {
    throw new ApiError(400, "O campo 'target_rate' é obrigatório.");
  }
  return { base, quote, target_rate: parseTargetRate(body.target_rate), note: parseNote(body.note) };
}

export function parseWatchedPairChanges(input: unknown): WatchedPairUpdate {
  const body = parseObjectBody(input);
  ensureAllowedFields(body, ["target_rate", "note"]);
  if (Object.keys(body).length === 0) {
    throw new ApiError(400, "Informe ao menos um campo para atualizar: target_rate ou note.");
  }

  const changes: WatchedPairUpdate = {};
  if ("target_rate" in body) {
    changes.target_rate = parseTargetRate(body.target_rate);
  }
  if ("note" in body) {
    changes.note = parseNote(body.note);
  }
  return changes;
}

export function validatePeriod(
  start: string | null | undefined,
  end: string | null | undefined,
): { start: string; end: string } {
  const hasStart = start !== null && start !== undefined && start !== "";
  const hasEnd = end !== null && end !== undefined && end !== "";

  if (!hasStart && !hasEnd) {
    return defaultPeriod();
  }
  if (!hasStart || !hasEnd) {
    throw new ApiError(400, "Informe as duas datas do período ('start' e 'end') ou nenhuma.");
  }

  const error = checkPeriod(start, end);
  if (error) {
    throw new ApiError(400, error);
  }
  return { start, end };
}
