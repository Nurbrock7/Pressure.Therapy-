"use client";

import { SERVICE_LIST } from "@/lib/services";

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  "Deep tissue massage": (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2v14M2 9h14" stroke="#d85a30" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  "Sports rehab": (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6" stroke="#d85a30" strokeWidth="1.5" />
      <path d="M9 6v3l2 2" stroke="#d85a30" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  "Initial assessment": (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M3 9h12M9 3l6 6-6 6"
        stroke="#d85a30"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export function ServicesSection() {
  const scrollToBooking = (serviceName: string) => {
    const bookingSection = document.getElementById("booking");
    bookingSection?.scrollIntoView({ behavior: "smooth" });

    window.dispatchEvent(
      new CustomEvent("selectservice", { detail: { service: serviceName } })
    );
  };

  return (
    <section className="py-12 px-8 max-w-[960px] mx-auto" id="services">
      <div className="text-[11px] tracking-widest uppercase text-accent mb-2">
        What we treat
      </div>
      <h2 className="text-[24px] font-medium mb-7">Services &amp; pricing</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SERVICE_LIST.map((svc) => (
          <div
            key={svc.name}
            onClick={() => scrollToBooking(svc.name)}
            className="bg-surface border border-[var(--border)] rounded-xl p-5 cursor-pointer transition-colors hover:border-accent"
          >
            <div className="w-9 h-9 bg-accent-muted rounded-lg flex items-center justify-center mb-3">
              {SERVICE_ICONS[svc.name]}
            </div>
            <div className="text-[14px] font-medium mb-1">{svc.name}</div>
            <div className="text-[12px] text-text-dim mb-3">
              {svc.duration} min session
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-[15px] font-medium text-accent">
                  {svc.price === 0 ? "Free" : `R${svc.price}`}
                </div>
                <div className="text-[11px] text-text-dim">
                  {svc.deposit > 0 ? `R${svc.deposit} deposit` : "via WhatsApp"}
                </div>
              </div>
              <button className="bg-accent text-white text-[12px] px-3.5 py-1.5 rounded-md border-none cursor-pointer hover:opacity-90">
                {svc.deposit > 0 ? "Book" : "DM us"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
