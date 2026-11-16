"use client";

import { useState, type FormEvent } from "react";
import CurrencySelect from "@/components/CurrencySelect";
import type { Currency } from "@/types";
import { parsePositiveNumber, SAME_CURRENCY_MESSAGE } from "@/lib/form-validation";

export interface ConvertValues {
    from: string;
    to: string;
    amount: number;
}

interface ConvertFormProps {
  currencies: Currency[];
  loading: boolean;
  onConvert: (values: ConvertValues) => void;
}

export default function ConvertForm({ currencies, loading, onConvert }: ConvertFormProps) {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("BRL");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = parsePositiveNumber(amount);

    if (value === null) {
      setError("Informe um valor maior que zero.");
      return;
    }
    if (from === to) {
      setError(SAME_CURRENCY_MESSAGE);
      return;
    }
    setError(null);
    onConvert({ from, to, amount: value });
  }

  function swapCurrencies() {
    setFrom(to);
    setTo(from);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="amount" className="font-medium">
          Valor
        </label>
        <input
          id="amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          aria-invalid={error !== null}
          aria-describedby={error ? "convert-error" : undefined}
          className="w-full rounded-md border border-slate-400 px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <CurrencySelect id="from" label="De" value={from} currencies={currencies} onChange={setFrom} />
        <button
          type="button"
          onClick={swapCurrencies}
          aria-label="Inverter moedas de origem e destino"
          className="rounded-md border border-slate-400 px-3 py-2 hover:bg-slate-100"
        >
          <span aria-hidden="true">⇄</span>
        </button>
        <CurrencySelect id="to" label="Para" value={to} currencies={currencies} onChange={setTo} />
      </div>

      {error && (
        <p id="convert-error" role="alert" className="text-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-500"
      >
        {loading ? "Convertendo..." : "Converter"}
      </button>
    </form>
  );
}
