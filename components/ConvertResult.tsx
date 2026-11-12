import Link from "next/link";
import { formatDate, formatMoney, formatRate } from "@/lib/format";
import type { ConversionResult } from "@/types";

interface ConvertResultProps {
    result: ConversionResult;
}

export default function ConvertResult({ result }: ConvertResultProps) {
    return (
        <section aria-labelledby="result-title" className="rounded-lg border border-blue-200 bg-blue-50 p-4 sm:p-6">
            <h2 id="result-title" className="text-lg font-semibold">
                Resultado
            </h2>
            <p className="mt-2 break-words text-2xl font-bold sm:text-3xl">
                {formatMoney(result.amount, result.from)} = {formatMoney(result.result, result.to)}
            </p>
            <p className="mt-2 text-slate-700">
                Cotação: 1 {result.from} = {formatRate(result.rate)} {result.to} em {formatDate(result.date)}
            </p>
            <link
            href={`/rates/${result.from}/${result.to}`}
            className="mt-3 inline-block font-medium text-blue-800 underline underline-offset-4"
            >
                Ver histórico de {result.from}/{result.to}
            </link>
        </section>
    );
}