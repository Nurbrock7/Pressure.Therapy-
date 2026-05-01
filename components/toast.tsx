"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  isError?: boolean;
  onClose: () => void;
}

export function Toast({ message, isError, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 bg-surface border border-[var(--border)] rounded-lg px-5 py-3 text-[13px] z-50 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      } ${isError ? "border-red-500 text-red-500" : "text-foreground"}`}
    >
      {message}
    </div>
  );
}

// Toast context for global usage
import { createContext, useContext, useCallback } from "react";

interface ToastContextValue {
  showToast: (message: string, isError?: boolean) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  const showToast = useCallback((message: string, isError?: boolean) => {
    setToast({ message, isError });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          isError={toast.isError}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
