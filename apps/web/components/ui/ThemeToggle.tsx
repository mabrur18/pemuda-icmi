"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { clsx } from "clsx";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark" | "system") || "system";
    setTheme(savedTheme);
  }, []);

  const changeTheme = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    let resolved = newTheme;
    if (newTheme === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    document.documentElement.setAttribute("data-theme", resolved);
    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-control bg-surface border border-border animate-pulse" />
    );
  }

  return (
    <div className="inline-flex items-center p-1 bg-surface border border-border rounded-control shadow-sm">
      <button
        type="button"
        onClick={() => changeTheme("light")}
        title="Mode Terang"
        className={clsx(
          "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
          theme === "light"
            ? "bg-brand-soft text-brand font-semibold shadow-xs"
            : "text-muted hover:text-ink"
        )}
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => changeTheme("dark")}
        title="Mode Gelap"
        className={clsx(
          "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
          theme === "dark"
            ? "bg-brand-soft text-brand font-semibold shadow-xs"
            : "text-muted hover:text-ink"
        )}
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => changeTheme("system")}
        title="Ikuti Tema Sistem"
        className={clsx(
          "w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
          theme === "system"
            ? "bg-brand-soft text-brand font-semibold shadow-xs"
            : "text-muted hover:text-ink"
        )}
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}

export const themePreRenderScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme') || 'system';
    var resolved = theme;
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', resolved);
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;
