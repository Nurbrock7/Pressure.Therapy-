"use client";

import { useState, useEffect } from "react";
import { SERVICE_LIST, ServiceName } from "@/lib/services";

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

export function QuickBookCard() {
  const [selectedService, setSelectedService] = useState<ServiceName>(
    SERVICE_LIST[0].name
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setLoading(true);
    setSelectedTime(null);
    fetch(`/api/bookings/slots?date=${today}`)
      .then((res) => res.json())
      .then((data) => {
        setSlots(data);
        setLoading(false);
      })
      .catch(() => {
        setSlots(null);
        setLoading(false);
      });
  }, [today]);

  const handleContinue = () => {
    if (!selectedService || !selectedTime) return;

    // Scroll to booking section and prefill
    const bookingSection = document.getElementById("booking");
    bookingSection?.scrollIntoView({ behavior: "smooth" });

    // Dispatch custom event to prefill booking form
    window.dispatchEvent(
      new CustomEvent("quickbook", {
        detail: { service: selectedService, time: selectedTime, date: today },
      })
    );
  };

  return (
    <div className="bg-surface border border-[var(--border)] rounded-xl p-6">
      <div className="text-[11px] text-text-dim tracking-wide uppercase mb-4">
        Quick book
      </div>
      <div className="text-[15px] font-medium mb-1">Choose a service</div>
      <div className="text-[12px] text-accent mb-5">Select treatment type</div>

      <div className="flex gap-2 flex-wrap mb-2">
        {SERVICE_LIST.map((svc) => (
          <button
            key={svc.name}
            onClick={() => {
              setSelectedService(svc.name);
              setSelectedTime(null);
            }}
            className={`bg-surface-alt border border-[var(--border)] rounded-full px-3 py-1.5 text-[12px] cursor-pointer transition-all ${
              selectedService === svc.name
                ? "bg-accent-muted border-accent text-accent"
                : "text-[#ccc] hover:border-accent hover:text-accent"
            }`}
          >
            {svc.name.replace(" massage", "").replace("Initial ", "")}
          </button>
        ))}
      </div>

      <hr className="border-none border-t border-[var(--border)] my-4" />

      <div className="text-[15px] font-medium mb-4">
        Pick a time · {formatDate(today)}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center py-10 text-text-dim text-[13px]">
            <div className="w-4 h-4 border-2 border-[var(--border)] border-t-accent rounded-full animate-spin mr-2" />
            Loading...
          </div>
        ) : !slots ? (
          <div className="col-span-3 text-red-500 text-[12px]">
            Could not load time slots. Is the server running?
          </div>
        ) : (
          slots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => slot.available && !slot.blocked && setSelectedTime(slot.time)}
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

      <button
        onClick={handleContinue}
        disabled={!selectedService || !selectedTime}
        className="w-full bg-accent text-white text-[13px] py-2.5 rounded-md border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue to booking →
      </button>
    </div>
  );
}
