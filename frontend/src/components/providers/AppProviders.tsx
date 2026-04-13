"use client";

import { ToastProvider } from "./ToastProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
