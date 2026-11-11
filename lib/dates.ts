export const MAX_PERIOD_DAYS = 366;
export const DEFAULT_PERIOD_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function todayUtc(): string {
    return new Date().toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
    return new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10);
}

export function defaultPeriod(): { start: string; end: string } {
    const end = todayUtc();
    return { start: addDays(end, -DEFAULT_PERIOD_DAYS), end };
}

function checkDate(value: string, label: string): string | null {
    if (!DATE_PATTERN.test(value)) {
        return `A ${label} deve estar no formato YYYY-MM-DD.`;
    }
    const time = Date.parse(value);
    if (Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== value) {
        return `A ${label} (${value}) não existe.`;
    }
    return null;
}

export function checkPeriod(start: string, end: string): string | null {
    const dateError = checkDate(start, "data inicial") ?? checkDate(end, "data final");
    if (dateError) {
        return dateError;
    }

    const startTime = Date.parse(start);
    const endTime = Date.parse(end);

    if (endTime > Date.parse(todayUtc())) {
        return "O período não pode incluir datas futuras.";
    }
    if (startTime > endTime) {
        return "A data inicial não pode ser maior que a data final.";
    }
    if ((endTime - startTime) / DAY_MS > MAX_PERIOD_DAYS) {
        return `O período deve ter no máximo ${MAX_PERIOD_DAYS} dias.`;
    }
    return null;
}   
