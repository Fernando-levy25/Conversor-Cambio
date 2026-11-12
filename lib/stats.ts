import type { RatePoint, RatesStats } from "@/types";

export function roundValue(value: number): number {
  return Number(value.toPrecision(10));
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeStats(points: RatePoint[]): RatesStats | null {
  if (points.length === 0) {
    return null;
  }

  const rates = points.map((point) => point.rate);
  const first = rates[0];
  const last = rates[rates.length - 1];
  const sum = rates.reduce((total, rate) => total + rate, 0);

  return {
    min: Math.min(...rates),
    max: Math.max(...rates),
    average: roundValue(sum / rates.length),
    change_percent: roundPercent(((last - first) / first) * 100),
  };
}
