"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Booking {
  id: string;
  name: string;
  service: string;
  date: string;
  time: string;
  status: string;
  deposit_amount: number;
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      setError(true);
      return;
    }

    fetch(`/api/bookings/${bookingId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setBooking(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <nav className="flex justify-between items-center px-8 py-4 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2.5 no-underline text-inherit">
          <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <circle cx="10" cy="6" r="3" stroke="#fff" strokeWidth="1.5" />
              <path d="M5 17c0-3 2-5 5-5s5 2 5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M3 11h3M14 11h3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="text-[15px] font-medium tracking-wide">Pressure Therapy</div>
            <div className="text-[10px] text-text-dim tracking-widest uppercase">
              Physical Therapist · Cape Town
            </div>
          </div>
        </Link>
        <Link
          href="/"
          className="bg-accent text-white text-[13px] px-4 py-2 rounded-md border-none cursor-pointer hover:opacity-90 transition-opacity no-underline"
        >
          Book another
        </Link>
      </nav>

      <div className="max-w-[500px] mx-auto mt-20 px-8 text-center">
        <div className="w-16 h-16 bg-accent-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d85a30"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-[24px] font-medium mb-2">Booking Confirmed</h1>
        <p className="text-[14px] text-text-muted leading-relaxed mb-8">
          Your deposit has been received. You&apos;ll get a confirmation via WhatsApp
          and email shortly. We&apos;ll also send a reminder 24 hours before your
          appointment.
        </p>

        <div className="bg-surface border border-[var(--border)] rounded-xl p-6 text-left mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-text-dim text-[13px]">
              <div className="w-4 h-4 border-2 border-[var(--border)] border-t-accent rounded-full animate-spin mr-2" />
              Loading booking details...
            </div>
          ) : error || !booking ? (
            <p className="text-text-dim text-[13px]">
              {!bookingId
                ? "No booking ID found."
                : "Could not load booking details. You'll still receive confirmation via WhatsApp and email."}
            </p>
          ) : (
            <>
              <div className="flex justify-between text-[13px] py-2 text-[#ccc]">
                <span className="text-text-dim">Name</span>
                <span>{booking.name}</span>
              </div>
              <div className="flex justify-between text-[13px] py-2 text-[#ccc] border-t border-[var(--border)]">
                <span className="text-text-dim">Service</span>
                <span>{booking.service}</span>
              </div>
              <div className="flex justify-between text-[13px] py-2 text-[#ccc] border-t border-[var(--border)]">
                <span className="text-text-dim">Date</span>
                <span>{booking.date}</span>
              </div>
              <div className="flex justify-between text-[13px] py-2 text-[#ccc] border-t border-[var(--border)]">
                <span className="text-text-dim">Time</span>
                <span>{booking.time}</span>
              </div>
              <div className="flex justify-between text-[13px] py-2 text-[#ccc] border-t border-[var(--border)]">
                <span className="text-text-dim">Status</span>
                <span className="text-whatsapp">{booking.status}</span>
              </div>
              <div className="flex justify-between text-[13px] py-2 text-[#ccc] border-t border-[var(--border)]">
                <span className="text-text-dim">Deposit</span>
                <span className="text-accent">R{booking.deposit_amount} paid</span>
              </div>
            </>
          )}
        </div>

        <div className="inline-flex items-center gap-2 bg-[#25d3661a] border border-[#25d36640] rounded-full px-4 py-2 text-[12px] text-whatsapp">
          <div className="w-2 h-2 bg-whatsapp rounded-full" />
          Confirmation sent via WhatsApp &amp; email
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="bg-transparent text-foreground text-[13px] px-5 py-2.5 rounded-md border border-[#444] cursor-pointer hover:border-text-muted transition-colors no-underline inline-block"
          >
            ← Back to home
          </Link>
        </div>
      </div>

      <div className="border-t border-surface-alt max-w-[960px] mx-auto px-8 mt-20">
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-[12px] text-text-faint">
            © 2025 Pressure Therapy · Woodstock &amp; Claremont, Cape Town
          </div>
          <a
            href="https://wa.me/27000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25d3661a] border border-[#25d36640] rounded-full px-3.5 py-1.5 text-[12px] text-whatsapp hover:opacity-85 transition-opacity no-underline"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#25d366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-[var(--border)] border-t-accent rounded-full animate-spin" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
