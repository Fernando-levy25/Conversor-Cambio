export const NOTE_MAX_LENGTH = 500;

export const SAME_CURRENCY_MESSAGE = "Escolha moedas de origem e destino diferentes.";

export function parsePositiveNumber(text: string): number | null {
    const value = Number(text.trim().replace(",", "."));
    if (text.trim() === "" ||!Number.isFinite(value) || value <= 0) {
        return null;
    }
    return value;
}

export function parseTargetRateInput(text: string): { value: number } | { error: string } {
    const value = parsePositiveNumber(text);
    return value === null ? { error: "Informe uma cotação-alvo maior que zero." } : { value };
}

export function checkNote(note: string): string | null {
    return note.trim().length > NOTE_MAX_LENGTH
    ? `A observação deve ter no máximo ${NOTE_MAX_LENGTH} caracteres.`
    : null;
}