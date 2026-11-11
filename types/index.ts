export interface Currency {
    code: string;
    name: string;
}

export interface RatePoint {
    date: string;
    rate: number;
}

export interface RatesStats {
    min: number;
    max: number;
    average: number;
    change_percent: number;
}

export interface WatchedPair {
    id: number;
    base: string;
    quote: string;
    target_rate: number;
    note: string | null;
    created_at: string;
}

export interface WatchedPairWithStats extends WatchedPair {
    current_rate: number | null;
    target_reached: boolean | null;
}

export interface ApiErrorBody {
    error: string;
}

export interface ConversionResult {
    from: string;
    to: string;
    amount: number;
    rate: number;
    result: number;
    date: string;
}

export interface RatesResponse {
    base: string;
    quote: string;
    start: string;
    end: string;
    rates: RatePoint[];
    stats: RatesStats | null;
}

export interface WatchedPairCreate {
    base: string;
    quote: string;
    target_rate: number;
    note: string | null;
}

export interface WatchedPairUpdate {
    target_rate?: number;
    note?: string | null;
}