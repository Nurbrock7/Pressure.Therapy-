import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ALL_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const [blockedResult, bookedResult] = await Promise.all([
    supabase.from("blocked_slots").select("time").eq("date", date),
    supabase
      .from("bookings")
      .select("time")
      .eq("date", date)
      .in("status", ["confirmed", "pending"]),
  ]);

  const blockedTimes = new Set(
    (blockedResult.data || []).map((s) => s.time)
  );
  const bookedTimes = new Set((bookedResult.data || []).map((b) => b.time));

  const slots = ALL_SLOTS.map((time) => ({
    time,
    available: !blockedTimes.has(time) && !bookedTimes.has(time),
    blocked: blockedTimes.has(time),
  }));

  return NextResponse.json(slots);
}
