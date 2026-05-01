"use client";

import Link from "next/link";

export function Navbar() {
  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 border-b border-[var(--border)] sticky top-0 bg-[var(--bg)] z-50">
      <Link href="/" className="flex items-center gap-2.5 no-underline text-inherit">
        <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center shrink-0">
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
            <circle cx="10" cy="6" r="3" stroke="#fff" strokeWidth="1.5" />
            <path
              d="M5 17c0-3 2-5 5-5s5 2 5 5"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M3 11h3M14 11h3"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <div className="text-[15px] font-medium tracking-wide">Pressure Therapy</div>
          <div className="text-[10px] text-text-dim tracking-widest uppercase">
            Physical Therapist · Cape Town
          </div>
        </div>
      </Link>

      <div className="hidden md:flex gap-6">
        <Link href="#services" className="text-[13px] text-text-muted hover:text-foreground transition-colors">
          Services
        </Link>
        <Link href="#booking" className="text-[13px] text-text-muted hover:text-foreground transition-colors">
          Book
        </Link>
        <Link href="/admin" className="text-[13px] text-text-muted hover:text-foreground transition-colors">
          Admin
        </Link>
      </div>

      <button
        onClick={scrollToBooking}
        className="bg-accent text-white text-[13px] px-4 py-2 rounded-md border-none cursor-pointer hover:opacity-90 transition-opacity"
      >
        Book now
      </button>
    </nav>
  );
}
