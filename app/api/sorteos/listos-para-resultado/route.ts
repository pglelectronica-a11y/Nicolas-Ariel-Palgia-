import { NextResponse } from "next/server";
import { ResultadoService } from "@/lib/services/resultado-service";

/** GET /api/sorteos/listos-para-resultado — A7, sorteos cerrados sin resultado todavía. */
export async function GET() {
  const sorteos = await ResultadoService.obtenerSorteosListosParaResultado();
  return NextResponse.json({ sorteos });
}
