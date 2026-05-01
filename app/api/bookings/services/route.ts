import { NextResponse } from "next/server";
import { SERVICE_LIST } from "@/lib/services";

export async function GET() {
  return NextResponse.json(SERVICE_LIST);
}
