import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function checkAuth(request: NextRequest): boolean {
  const password = request.headers.get("x-admin-password");
  return password === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");

  let query = supabase.from("blocked_slots").select("*");

  if (date) {
    query = query.eq("date", date);
  } else {
    query = query.gte("date", new Date().toISOString().split("T")[0]);
  }

  const { data, error } = await query.order("date").order("time");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { date, time } = body;

  if (!date || !time) {
    return NextResponse.json(
      { error: "Date and time are required" },
      { status: 400 }
    );
  }

  // Check if already blocked
  const { data: existing } = await supabase
    .from("blocked_slots")
    .select("id")
    .eq("date", date)
    .eq("time", time)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "Slot already blocked" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("blocked_slots")
    .insert({ date, time })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { date, time } = body;

  if (!date || !time) {
    return NextResponse.json(
      { error: "Date and time are required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("blocked_slots")
    .delete()
    .eq("date", date)
    .eq("time", time);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
