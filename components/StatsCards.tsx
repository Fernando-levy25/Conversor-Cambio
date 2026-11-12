import { formatPercent, formatRate } from "@/lib/format";
import type { RatesStats } from "@/types";

interface StatsCardsProps {
    quote: string;
    stats: RatesStats;
}

export default function StatsCards({ quote, stats }: StatsCardsProps) {
    const change = stats.change_percent;
    const trend = change > 0 ? "alta" : change < 0 ? "queda" : "estável";
    const trendColor = change > 0 ? "text-green-800" : change < 0 ? "text-red-800" : "text-slate-800";

    const items = [
        { label: "Mínima", value: `${formatRate(stats.min)} ${quote}` },
        { label: "Máxima", value: `${formatRate(stats.max)} ${quote}` },
        { label: "Média", value: `${formatRate(stats.average)} ${quote}` },
    ];

    return (
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {items.map((item) => (
                <div key={item.label} className="rounded-lg bg-white p-4 shadow-sm">
                    <dt className="text-sm text-slate-700">{item.label}</dt>
                    <dd className="mt-1 break-words text-lg font-semibold tabular-nums">{item.value}</dd>
                </div>
            ))}
            <div className="rounded-lg bg-white p-4 shadow-sm">
                <dt className="text-sm text-slate-700">Variação no período</dt>
                <dd className={`mt-1 text-lg font-semibold tabular-nums ${trendColor}`}>
                    {formatPercent(change)} <span className="text-sm font-normal">({trend})</span>
                </dd>
            </div>
        </dl>
    )
}