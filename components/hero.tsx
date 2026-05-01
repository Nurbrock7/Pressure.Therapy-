"use client";

import { QuickBookCard } from "./quick-book-card";

export function Hero() {
  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 px-8 max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div>
        <div className="text-[11px] tracking-widest uppercase text-accent mb-3">
          Cape Town · Woodstock &amp; Claremont
        </div>
        <h1 className="text-[32px] md:text-[38px] font-medium leading-tight mb-4">
          Treat injuries.
          <br />
          Restore <span className="text-accent">peak</span> performance.
        </h1>
        <p className="text-[14px] text-text-muted leading-relaxed mb-7">
          Specialist physical therapy for overworked men and athletes. Over 100+
          injuries treated in 2024. Book your session or free consultation today.
        </p>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={scrollToBooking}
            className="bg-accent text-white text-[13px] px-5 py-2.5 rounded-md border-none cursor-pointer hover:opacity-90 transition-opacity"
          >
            Book a session
          </button>
          <a
            href="https://wa.me/27000000000?text=Hi%2C%20I%27d%20like%20to%20book%20a%20free%20assessment"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-transparent text-foreground text-[13px] px-5 py-2.5 rounded-md border border-[#444] cursor-pointer hover:border-text-muted transition-colors no-underline inline-flex items-center"
          >
            Free consult via WhatsApp
          </a>
        </div>
        <div className="flex gap-6 mt-7">
          <div>
            <div className="text-[22px] font-medium">100+</div>
            <div className="text-[11px] text-text-dim mt-0.5">Injuries treated</div>
          </div>
          <div>
            <div className="text-[22px] font-medium">4.9</div>
            <div className="text-[11px] text-text-dim mt-0.5">Avg. rating</div>
          </div>
          <div>
            <div className="text-[22px] font-medium">Free</div>
            <div className="text-[11px] text-text-dim mt-0.5">Consultation</div>
          </div>
        </div>
      </div>

      <QuickBookCard />
    </section>
  );
}
