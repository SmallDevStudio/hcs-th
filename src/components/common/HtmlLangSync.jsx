"use client";

import { useEffect } from "react";

export function HtmlLangSync({ locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;

    return () => {
      document.documentElement.lang = "en";
    };
  }, [locale]);

  return null;
}
