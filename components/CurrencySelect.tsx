import type { Currency } from "@/types";

interface CurrencySelectProps {
    id: string;
    label: string;
    value: string;
    currencies: Currency[];
    onChange: (code: string) => void;
    disabled?: boolean;
}

export default function CurrencySelect({
    id,
    label,
    value,
    currencies,
    onChange,
    disabled = false,
}: CurrencySelectProps) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <label htmlFor={id} className="font-medium">
                {label}
            </label>
            <select
               id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 rounded-md border border-slate-400 bg-white px-3 py-2 disabled:bg-slate-100"
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} — {currency.name}
          </option>
        ))}
      </select>
    </div>
  );
}
