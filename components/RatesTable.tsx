import { formatDate, formatRate } from "@/lib/format";
import type { RatePoint } from "@/types";

interface RatesTableProps {
    base: string;
    quote: string;
    rates: RatePoint[];
}

export default function RatesTable({ base, quote, rates }: RatesTableProps) {
    return (
        <div
        tabIndex={0}
        role="region"
        aria-label={`Tabela de cotações de ${base}/${quote}`}
        className="max-h-[28rem] overflow-auto rounded-lg bg-white shadow-sm"
        >
            <table className="w-full text-left">
                <caption className="p-3 text-left font-semibold">
                    Cotações diárias de 1 {base} em {quote} ({rates.length} registros)
                </caption>
                <thead className="sticky top-0 bg-slate-100">
                    <tr>
                        <th scope="col" className="px-3 py-2">
                            Data
                        </th>
                        <th scope="col" className="px-3 py-2 text-right">
                            Cotação ({quote})
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rates.map((point) => (
            <tr key={point.date} className="border-t border-slate-200">
              <th scope="row" className="px-3 py-2 font-normal">
                {formatDate(point.date)}
              </th>
              <td className="px-3 py-2 text-right tabular-nums">{formatRate(point.rate)}</td>
            </tr>
          ))}
                </tbody>
            </table>
        </div>
    )
}