import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SERVICES, ServiceName } from "@/lib/services";
import { generatePayfastForm } from "@/lib/payfast";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, phone, email, service, date, time } = body;

  if (!name || !phone || !email || !service || !date || !time) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  const svcInfo = SERVICES[service as ServiceName];
  if (!svcInfo) {
    return NextResponse.json({ error: "Invalid service" }, { status: 400 });
  }

  if (service === "Initial assessment") {
    return NextResponse.json({
      type: "whatsapp",
      message:
        "Initial assessments are booked via WhatsApp. Please message us directly.",
      whatsapp_url:
        "https://wa.me/27000000000?text=Hi%2C%20I%27d%20like%20to%20book%20a%20free%20assessment",
    });
  }

  // Check if slot is already booked
  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("date", date)
    .eq("time", time)
    .in("status", ["confirmed", "pending"])
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "This time slot is already booked" },
      { status: 409 }
    );
  }

  // Check if slot is blocked
  const { data: blocked } = await supabase
    .from("blocked_slots")
    .select("id")
    .eq("date", date)
    .eq("time", time)
    .limit(1);

  if (blocked && blocked.length > 0) {
    return NextResponse.json(
      { error: "This time slot is blocked" },
      { status: 409 }
    );
  }

  // Create booking
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      name,
      phone,
      email,
      service,
      date,
      time,
      deposit_amount: svcInfo.deposit,
      deposit_paid: false,
      status: "pending",
      reminder_sent: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Booking insert error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }

  const payfast = generatePayfastForm(booking, svcInfo.deposit);

  return NextResponse.json({
    type: "payment",
    booking,
    payfast,
  });
}
