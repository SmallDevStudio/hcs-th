"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { FiMonitor, FiMoon, FiSun } from "react-icons/fi";

const themeSequence = ["system", "light", "dark"];

const themeIcons = {
  light: FiSun,
  dark: FiMoon,
  system: FiMonitor,
};

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle({ className = "" }) {
  const { t } = useTranslation("public");
  const { theme, setTheme } = useTheme();

  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex size-10 shrink-0 ${className}`}
      />
    );
  }

  const currentTheme = theme || "system";
  const ThemeIcon = themeIcons[currentTheme] || FiMonitor;

  function handleThemeChange() {
    const currentIndex = themeSequence.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeSequence.length;

    setTheme(themeSequence[nextIndex]);
  }

  const themeLabel = t(`theme.${currentTheme}`);

  return (
    <button
      type="button"
      onClick={handleThemeChange}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:border-primary hover:text-primary ${className}`}
      aria-label={`${t("common.changeTheme")}: ${themeLabel}`}
      title={`${t("common.changeTheme")}: ${themeLabel}`}
    >
      <ThemeIcon aria-hidden="true" className="size-[18px]" />
    </button>
  );
}
