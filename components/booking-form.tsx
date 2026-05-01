"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SERVICE_LIST, ServiceName, SERVICES } from "@/lib/services";
import { useToast } from "./toast";

interface Slot {
  time: string;
  available: boolean;
  blocked: boolean;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function BookingForm() {
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const payfastFormRef = useRef<HTMLFormElement>(null);

  const [selectedService, setSelectedService] = useState<ServiceName | "">("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const service = selectedService ? SERVICES[selectedService] : null;

  // Fetch slots when date changes
  useEffect(() => {
    if (!date) {
      setSlots(null);
      return;
    }

    setLoadingSlots(true);
    setSelectedTime(null);
    fetch(`/api/bookings/slots?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        setSlots(data);
        setLoadingSlots(false);
      })
      .catch(() => {
        setSlots(null);
        setLoadingSlots(false);
      });
  }, [date]);

  // Listen for quickbook event
  useEffect(() => {
    const handleQuickBook = (e: CustomEvent) => {
      const { service, time, date: quickDate } = e.detail;
      setSelectedService(service);
      setDate(quickDate);
      setTimeout(() => setSelectedTime(time), 100);
      document.getElementById("book-name")?.focus();
    };

    const handleSelectService = (e: CustomEvent) => {
      setSelectedService(e.detail.service);
    };

    window.addEventListener("quickbook", handleQuickBook as EventListener);
    window.addEventListener("selectservice", handleSelectService as EventListener);

    return () => {
      window.removeEventListener("quickbook", handleQuickBook as EventListener);
      window.removeEventListener("selectservice", handleSelectService as EventListener);
    };
  }, []);

  const isValid =
    selectedService && name && phone && email && date && selectedTime;

  const handleSubmit = useCallback(async () => {
    if (!isValid || !service) return;

    if (selectedService === "Initial assessment") {
      window.open(
        "https://wa.me/27000000000?text=Hi%2C%20I%27d%20like%20to%20book%20a%20free%20assessment",
        "_blank"
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          service: selectedService,
          date,
          time: selectedTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Something went wrong", true);
        setSubmitting(false);
        return;
      }

      if (data.type === "whatsapp") {
        window.open(data.whatsapp_url, "_blank");
        setSubmitting(false);
        return;
      }

      // Redirect to PayFast
      if (payfastFormRef.current && data.payfast) {
        payfastFormRef.current.action = data.payfast.payfast_url;
        payfastFormRef.current.innerHTML = "";

        Object.entries(data.payfast.fields).forEach(([key, val]) => {
          if (key === "passphrase") return;
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = val as string;
          payfastFormRef.current?.appendChild(input);
        });

        payfastFormRef.current.submit();
      }
    } catch {
      showToast("Network error — is the server running?", true);
      setSubmitting(false);
    }
  }, [isValid, service, selectedService, name, phone, email, date, selectedTime, showToast]);

  return (
    <section className="py-12 px-8 max-w-[960px] mx-auto" id="booking">
      <div className="text-[11px] tracking-widest uppercase text-accent mb-2">
        Secure your spot
      </div>
      <h2 className="text-[24px] font-medium mb-7">Book a session</h2>

      <div className="bg-surface border border-[var(--border)] rounded-xl p-7 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* Service select */}
          <div className="mb-5">
            <div className="text-[11px] text-text-dim tracking-wide uppercase mb-2.5">
              Service
            </div>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value as ServiceName)}
              className="w-full bg-surface-alt border border-[var(--border)] rounded-md px-3 py-2.5 text-[13px] text-foreground outline-none focus:border-accent transition-colors"
            >
              <option value="">Select a service</option>
              {SERVICE_LIST.map((svc) => (
                <option key={svc.name} value={svc.name}>
                  {svc.name} — {svc.price === 0 ? "Free" : `R${svc.price}`} ({svc.duration} min)
                </option>
              ))}
            </select>
          </div>

          {/* Contact details */}
          <div className="mb-5">
            <div className="text-[11px] text-text-dim tracking-wide uppercase mb-2.5">
              Your details
            </div>
            <input
              id="book-name"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-alt border border-[var(--border)] rounded-md px-3 py-2.5 text-[13px] text-foreground outline-none focus:border-accent transition-colors mb-2 placeholder:text-text-dim"
            />
            <input
              type="text"
              placeholder="WhatsApp number (e.g. 0821234567)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-surface-alt border border-[var(--border)] rounded-md px-3 py-2.5 text-[13px] text-foreground outline-none focus:border-accent transition-colors mb-2 placeholder:text-text-dim"
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-alt border border-[var(--border)] rounded-md px-3 py-2.5 text-[13px] text-foreground outline-none focus:border-accent transition-colors placeholder:text-text-dim"
            />
          </div>

          {/* Date */}
          <div className="mb-5">
            <div className="text-[11px] text-text-dim tracking-wide uppercase mb-2.5">
              Preferred date
            </div>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface-alt border border-[var(--border)] rounded-md px-3 py-2.5 text-[13px] text-foreground outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Time slots */}
          <div className="mb-5">
            <div className="text-[11px] text-text-dim tracking-wide uppercase mb-2.5">
              Available times
            </div>
            <div className="grid grid-cols-3 gap-2">
              {!date ? (
                <div className="col-span-3 text-text-dim text-[12px]">
                  Select a date to see available times
                </div>
              ) : loadingSlots ? (
                <div className="col-span-3 flex items-center justify-center py-6 text-text-dim text-[13px]">
                  <div className="w-4 h-4 border-2 border-[var(--border)] border-t-accent rounded-full animate-spin mr-2" />
                  Loading...
                </div>
              ) : !slots ? (
                <div className="col-span-3 text-red-500 text-[12px]">
                  Could not load time slots
                </div>
              ) : (
                slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() =>
                      slot.available && !slot.blocked && setSelectedTime(slot.time)
                    }
                    disabled={!slot.available || slot.blocked}
                    className={`bg-surface-alt border border-[var(--border)] rounded-md py-2 text-[12px] text-center cursor-pointer transition-all ${
                      selectedTime === slot.time
                        ? "bg-accent-muted border-accent text-accent"
                        : slot.blocked || !slot.available
                        ? "bg-[#111] text-[#444] cursor-not-allowed line-through"
                        : "text-[#ccc] hover:border-accent hover:text-accent"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-[#0f0f0f] border border-[var(--border)] rounded-lg p-5">
            <div className="text-[11px] text-text-dim tracking-wide uppercase mb-4">
              Booking summary
            </div>
            <div className="flex justify-between text-[13px] text-[#ccc] mb-2.5">
              <span>Service</span>
              <span>{service?.duration ? `${selectedService}` : "—"}</span>
            </div>
            <div className="flex justify-between text-[13px] text-[#ccc] mb-2.5">
              <span>Duration</span>
              <span>{service?.duration ? `${service.duration} min` : "—"}</span>
            </div>
            <div className="flex justify-between text-[13px] text-[#ccc] mb-2.5">
              <span>Date</span>
              <span>{date ? formatDate(date) : "—"}</span>
            </div>
            <div className="flex justify-between text-[13px] text-[#ccc] mb-2.5">
              <span>Time</span>
              <span>{selectedTime || "—"}</span>
            </div>
            <div className="flex justify-between text-[13px] text-foreground font-medium pt-2.5 mt-1 border-t border-[var(--border)]">
              <span>Total</span>
              <span>
                {service
                  ? service.price === 0
                    ? "Free"
                    : `R${service.price}`
                  : "—"}
              </span>
            </div>
            <div className="text-[11px] text-accent mt-1">
              {service && service.deposit > 0
                ? `Deposit due now: R${service.deposit} via PayFast`
                : service && service.price === 0
                ? "Free — booked via WhatsApp"
                : ""}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="w-full mt-4 bg-accent text-white text-[13px] py-3 rounded-md border-none cursor-pointer font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Processing..."
              : service && service.deposit > 0
              ? `Pay R${service.deposit} deposit via PayFast`
              : service && service.price === 0
              ? "Book via WhatsApp"
              : "Pay deposit via PayFast"}
          </button>

          <div className="flex items-center gap-2 mt-3 text-[12px] text-text-dim">
            <div className="w-2 h-2 bg-whatsapp rounded-full shrink-0" />
            Confirmation &amp; reminder sent via WhatsApp + email
          </div>
        </div>
      </div>

      {/* Hidden PayFast form */}
      <form ref={payfastFormRef} method="POST" className="hidden" />
    </section>
  );
}
