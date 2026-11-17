import { NextResponse } from "next/server";
import { getCurrencyCodes } from "@/lib/frankfurter";
import { handleRouteError, readJsonBody } from "@/lib/http";
import { parseWatchedPairInput } from "@/lib/validation";
import { createWatchedPair, listWatchedPairsWithRates } from "@/lib/watched-pairs";


export async function GET() {
  try {
    const watched_pairs = await listWatchedPairsWithRates();
    return NextResponse.json({ watched_pairs });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const input = parseWatchedPairInput(body, await getCurrencyCodes());
    const pair = createWatchedPair(input);
    return NextResponse.json(pair, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
