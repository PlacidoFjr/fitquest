"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setItems((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 2800);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] space-y-2">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className={`pointer-events-auto flex min-w-64 items-center gap-2 rounded-xl border px-3 py-2 text-sm shadow-lg ${
                item.type === "success"
                  ? "border-primary/40 bg-slate-900 text-slate-100"
                  : "border-rose-500/40 bg-slate-900 text-rose-200"
              }`}
            >
              {item.type === "success" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              <span>{item.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }
  return context;
}
