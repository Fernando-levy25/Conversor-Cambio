import { NextResponse, type NextRequest } from "next/server";
import { getCurrencyCodes, getRate } from "@/lib/frankfurter";
import { handleRouteError } from "@/lib/http";
import { roundValue } from "@/lib/stats";
import { ensureDifferentCurrencies, normalizeCurrency, parseAmount } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const amount = parseAmount(params.get("amount"));
    const codes = await getCurrencyCodes();
    const from = normalizeCurrency(params.get("from"), "from", codes);
    const to = normalizeCurrency(params.get("to"), "to", codes);
    ensureDifferentCurrencies(from, to);

    const { rate, date } = await getRate(from, to);
    const result = roundValue(amount * rate);

    return NextResponse.json({ from, to, amount, rate, result, date });
  } catch (err) {
    return handleRouteError(err);
  }
}
