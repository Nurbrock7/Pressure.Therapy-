import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function checkAuth(request: NextRequest): boolean {
  const password = request.headers.get("x-admin-password");
  return password === process.env.ADMIN_PASSWORD;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
