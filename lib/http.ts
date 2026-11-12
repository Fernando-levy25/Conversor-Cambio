import { NextResponse } from "next/server";
import type { ApiErrorBody } from "@/types";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function errorResponse(status: number, message: string) {
  return NextResponse.json<ApiErrorBody>({ error: message }, { status });
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "O corpo da requisição deve ser um JSON válido.");
  }
}

export function handleRouteError(err: unknown) {
  if (err instanceof ApiError) {
    return errorResponse(err.status, err.message);
  }
  console.error(err);
  return errorResponse(500, "Erro interno do servidor.");
}
