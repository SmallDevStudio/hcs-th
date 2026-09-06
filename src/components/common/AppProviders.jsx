"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { HcsI18nProvider } from "@/i18n/I18nProvider";

export function AppProviders({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="hcs-theme"
    >
      <HcsI18nProvider>
        {children}

        <Toaster position="top-right" richColors closeButton duration={4000} />
      </HcsI18nProvider>
    </ThemeProvider>
  );
}
