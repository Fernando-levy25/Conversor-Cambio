import { NextResponse } from "next/server";
import { handleRouteError, readJsonBody } from "@/lib/http";
import { parseId, parseWatchedPairChanges } from "@/lib/validation";
import { editWatchedPair, removeWatchedPair } from "@/lib/watched-pairs";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Context) {
  try {
    const id = parseId((await ctx.params).id);
    const changes = parseWatchedPairChanges(await readJsonBody(request));
    const pair = editWatchedPair(id, changes);
    return NextResponse.json(pair);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(_request: Request, ctx: Context) {
  try {
    const id = parseId((await ctx.params).id);
    removeWatchedPair(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleRouteError(err);
  }
}
