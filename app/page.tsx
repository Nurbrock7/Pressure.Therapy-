"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ServicesSection } from "@/components/services-section";
import { BookingForm } from "@/components/booking-form";
import { Footer } from "@/components/footer";
import { ToastProvider, useToast } from "@/components/toast";

function HomeContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    if (searchParams.get("cancelled")) {
      showToast("Payment was cancelled. You can try again.", true);
      // Clean up URL
      window.history.replaceState(null, "", "/");
    }
  }, [searchParams, showToast]);

  return (
    <>
      <Navbar />
      <Hero />
      <ServicesSection />
      <BookingForm />
      <Footer />
    </>
  );
}

export default function HomePage() {
  return (
    <ToastProvider>
      <HomeContent />
    </ToastProvider>
  );
}
