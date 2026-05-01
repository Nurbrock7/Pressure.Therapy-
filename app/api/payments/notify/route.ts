import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateITN } from "@/lib/payfast";
import { sendBookingConfirmation } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const body: Record<string, string> = {};
  formData.forEach((value, key) => {
    body[key] = value.toString();
  });

  console.log("[PayFast ITN] Received:", body);

  const isValid = validateITN(body);
  if (!isValid) {
    console.error("[PayFast ITN] Invalid signature");
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const bookingId = body.m_payment_id;
  const paymentStatus = body.payment_status;

  if (paymentStatus === "COMPLETE") {
    const { data: booking, error } = await supabase
      .from("bookings")
      .update({
        deposit_paid: true,
        status: "confirmed",
        pf_payment_id: body.pf_payment_id,
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) {
      console.error("[PayFast ITN] Update error:", error);
      return new NextResponse("DB error", { status: 500 });
    }

    console.log("[PayFast ITN] Booking confirmed:", bookingId);

    sendBookingConfirmation(booking).catch((err) => {
      console.error("[Notifications] Error sending confirmation:", err);
    });
  }

  return new NextResponse("OK", { status: 200 });
}
