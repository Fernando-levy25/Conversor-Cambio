import { NextResponse } from "next/server";
import { getCurrencies } from "@/lib/frankfurter";
import { handleRouteError } from "@/lib/http";

export async function GET() {
  try {
    const currencies = await getCurrencies();
    return NextResponse.json({ currencies });
  } catch (err) {
    return handleRouteError(err);
  }
}
