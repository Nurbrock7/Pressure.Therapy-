"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ToastProvider, useToast } from "@/components/toast";

interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  status: string;
  deposit_amount: number;
  deposit_paid: boolean;
}

interface Slot {
  time: string;
  available: boolean;
  blocked: boolean;
}

const ALL_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

function AdminContent() {
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookings" | "slots">("bookings");

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Slots state
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set());
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        headers: { "x-admin-password": password },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBookings(data);
    } catch {
      showToast("Failed to load bookings", true);
    }
    setLoadingBookings(false);
  }, [password, showToast]);

  const fetchSlots = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const [slotsRes, blockedRes] = await Promise.all([
        fetch(`/api/bookings/slots?date=${slotDate}`),
        fetch(`/api/admin/blocked-slots?date=${slotDate}`, {
          headers: { "x-admin-password": password },
        }),
      ]);

      const slotsData = await slotsRes.json();
      const blockedData = await blockedRes.json();

      setSlots(slotsData);
      setBlockedSlots(new Set(blockedData.map((s: { time: string }) => s.time)));
      setBookedSlots(
        new Set(
          slotsData
            .filter((s: Slot) => !s.available && !s.blocked)
            .map((s: Slot) => s.time)
        )
      );
    } catch {
      showToast("Failed to load slots", true);
    }
    setLoadingSlots(false);
  }, [slotDate, password, showToast]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchBookings();
    }
  }, [isLoggedIn, fetchBookings]);

  useEffect(() => {
    if (isLoggedIn && activeTab === "slots") {
      fetchSlots();
    }
  }, [isLoggedIn, activeTab, slotDate, fetchSlots]);

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/admin/bookings", {
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        setIsLoggedIn(true);
        setLoginError(false);
      } else {
        setLoginError(true);
      }
    } catch {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword("");
    setBookings([]);
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        showToast("Booking cancelled");
        fetchBookings();
      } else {
        showToast("Failed to cancel booking", true);
      }
    } catch {
      showToast("Failed to cancel booking", true);
    }
  };

  const handleToggleSlot = async (time: string) => {
    const isBlocked = blockedSlots.has(time);
    const isBooked = bookedSlots.has(time);

    if (isBooked) return; // Can't toggle booked slots

    try {
      const res = await fetch("/api/admin/blocked-slots", {
        method: isBlocked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ date: slotDate, time }),
      });

      if (res.ok) {
        fetchSlots();
      } else {
        showToast("Failed to update slot", true);
      }
    } catch {
      showToast("Failed to update slot", true);
    }
  };

  if (!isLoggedIn) {
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
              <div className="text-[10px] text-text-dim tracking-widest uppercase">Admin Panel</div>
            </div>
          </Link>
        </nav>

        <div className="max-w-[360px] mx-auto mt-32 text-center">
          <h2 className="text-[20px] font-medium mb-2">Admin Access</h2>
          <p className="text-[13px] text-text-muted mb-6">
            Enter the admin password to manage bookings and time slots.
          </p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-surface-alt border border-[var(--border)] rounded-md px-3 py-2.5 text-[13px] text-foreground outline-none focus:border-accent transition-colors mb-3"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-accent text-white text-[13px] py-2.5 rounded-md border-none cursor-pointer hover:opacity-90 transition-opacity"
          >
            Log in
          </button>
          {loginError && (
            <p className="text-red-500 text-[12px] mt-2">Invalid password</p>
          )}
        </div>
      </div>
    );
  }

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
            <div className="text-[10px] text-text-dim tracking-widest uppercase">Admin Panel</div>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="bg-accent text-white text-[13px] px-4 py-2 rounded-md border-none cursor-pointer hover:opacity-90 transition-opacity"
        >
          Log out
        </button>
      </nav>

      <div className="max-w-[960px] mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[20px] font-medium">Dashboard</h2>
          <span className="text-[12px] text-text-dim">
            {new Date().toLocaleDateString("en-ZA", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 text-[13px] rounded-md border cursor-pointer transition-all ${
              activeTab === "bookings"
                ? "bg-accent-muted border-accent text-accent"
                : "bg-transparent border-[var(--border)] text-text-muted hover:border-accent"
            }`}
          >
            Upcoming Bookings
          </button>
          <button
            onClick={() => setActiveTab("slots")}
            className={`px-4 py-2 text-[13px] rounded-md border cursor-pointer transition-all ${
              activeTab === "slots"
                ? "bg-accent-muted border-accent text-accent"
                : "bg-transparent border-[var(--border)] text-text-muted hover:border-accent"
            }`}
          >
            Manage Time Slots
          </button>
        </div>

        {activeTab === "bookings" && (
          <div>
            {loadingBookings ? (
              <div className="flex items-center justify-center py-10 text-text-dim text-[13px]">
                <div className="w-4 h-4 border-2 border-[var(--border)] border-t-accent rounded-full animate-spin mr-2" />
                Loading...
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-text-dim text-[13px] py-5">No upcoming bookings.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className="text-left p-2.5 text-[11px] text-text-dim tracking-wide uppercase border-b border-[var(--border)] font-normal">Date</th>
                      <th className="text-left p-2.5 text-[11px] text-text-dim tracking-wide uppercase border-b border-[var(--border)] font-normal">Time</th>
                      <th className="text-left p-2.5 text-[11px] text-text-dim tracking-wide uppercase border-b border-[var(--border)] font-normal">Name</th>
                      <th className="text-left p-2.5 text-[11px] text-text-dim tracking-wide uppercase border-b border-[var(--border)] font-normal">Service</th>
                      <th className="text-left p-2.5 text-[11px] text-text-dim tracking-wide uppercase border-b border-[var(--border)] font-normal">Phone</th>
                      <th className="text-left p-2.5 text-[11px] text-text-dim tracking-wide uppercase border-b border-[var(--border)] font-normal">Status</th>
                      <th className="text-left p-2.5 text-[11px] text-text-dim tracking-wide uppercase border-b border-[var(--border)] font-normal">Deposit</th>
                      <th className="text-left p-2.5 text-[11px] text-text-dim tracking-wide uppercase border-b border-[var(--border)] font-normal"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-[#0f0f0f]">
                        <td className="p-2.5 border-b border-[var(--border)] text-[#ccc]">{booking.date}</td>
                        <td className="p-2.5 border-b border-[var(--border)] text-[#ccc]">{booking.time}</td>
                        <td className="p-2.5 border-b border-[var(--border)] text-[#ccc]">{booking.name}</td>
                        <td className="p-2.5 border-b border-[var(--border)] text-[#ccc]">{booking.service}</td>
                        <td className="p-2.5 border-b border-[var(--border)] text-[#ccc]">{booking.phone}</td>
                        <td className="p-2.5 border-b border-[var(--border)]">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                              booking.status === "confirmed"
                                ? "bg-[#25d3661a] text-whatsapp"
                                : booking.status === "pending"
                                ? "bg-[#fbbf241a] text-[#fbbf24]"
                                : "bg-[#ef44441a] text-red-500"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-2.5 border-b border-[var(--border)] text-[#ccc]">
                          {booking.deposit_paid ? `R${booking.deposit_amount}` : "—"}
                        </td>
                        <td className="p-2.5 border-b border-[var(--border)]">
                          {booking.status !== "cancelled" && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="bg-transparent border border-red-500 text-red-500 px-2.5 py-1 rounded text-[11px] cursor-pointer hover:bg-[#ef44441a]"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "slots" && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <label className="text-[12px] text-text-dim">Select date:</label>
              <input
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="bg-surface-alt border border-[var(--border)] rounded-md px-3 py-2 text-[13px] text-foreground outline-none focus:border-accent transition-colors"
              />
            </div>
            <p className="text-[12px] text-text-dim mb-4">
              Click a slot to block/unblock it. Blocked slots appear in red. Booked slots appear in orange.
            </p>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-10 text-text-dim text-[13px]">
                <div className="w-4 h-4 border-2 border-[var(--border)] border-t-accent rounded-full animate-spin mr-2" />
                Loading...
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-w-[500px]">
                {ALL_SLOTS.map((time) => {
                  const isBlocked = blockedSlots.has(time);
                  const isBooked = bookedSlots.has(time);

                  return (
                    <button
                      key={time}
                      onClick={() => handleToggleSlot(time)}
                      disabled={isBooked}
                      className={`p-2.5 text-[12px] text-center rounded-md border cursor-pointer transition-all ${
                        isBooked
                          ? "bg-accent-muted border-accent text-accent cursor-default"
                          : isBlocked
                          ? "bg-[#ef44441a] border-red-500 text-red-500 line-through"
                          : "bg-surface-alt border-[var(--border)] text-[#ccc] hover:border-accent"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ToastProvider>
      <AdminContent />
    </ToastProvider>
  );
}
