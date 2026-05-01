import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pressure Therapy — Physical Therapy · Cape Town",
  description:
    "Specialist physical therapy for overworked men and athletes in Woodstock & Claremont, Cape Town. Book online today.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[var(--bg)]">
      <body>{children}</body>
    </html>
  );
}
