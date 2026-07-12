import { NextResponse } from "next/server";
import { destruirSesion } from "@/lib/session";

/** POST /api/auth/logout. */
export async function POST() {
  await destruirSesion();
  return NextResponse.json({ ok: true });
}
