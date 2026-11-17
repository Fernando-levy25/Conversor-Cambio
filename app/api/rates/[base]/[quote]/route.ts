import { NextResponse, type NextRequest } from "next/server";
import { getCurrencyCodes, getRateSeries } from "@/lib/frankfurter";
import { handleRouteError } from "@/lib/http";
import { computeStats } from "@/lib/stats";
import { ensureDifferentCurrencies, normalizeCurrency, validatePeriod } from "@/lib/validation";

type Context = { params: Promise<{ base: string; quote: string }> };

export async function GET(request: NextRequest, ctx: Context) {
  try {
    const params = request.nextUrl.searchParams;
    const { start, end } = validatePeriod(params.get("start"), params.get("end"));
    const route = await ctx.params;
    const codes = await getCurrencyCodes();
    const base = normalizeCurrency(route.base, "base", codes);
    const quote = normalizeCurrency(route.quote, "quote", codes);
    ensureDifferentCurrencies(base, quote);

    const rates = await getRateSeries(base, quote, start, end);
    const stats = computeStats(rates);

    return NextResponse.json({ base, quote, start, end, rates, stats });
  } catch (err) {
    return handleRouteError(err);
  }
}
