/*
 * Eclipse Public License - v 2.0
 *
 *   THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
 *   PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
 *   OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
 */

import { useCallback, useEffect, useRef } from "react";

export function useDarkModeToggle() {
  const darkModeToggleRef = useRef<HTMLButtonElement | null>(null);

  function syncDarkModeToggleState() {
    if (!darkModeToggleRef.current) {
      return;
    }
    const darkModeEnabled = document.documentElement.classList.contains("dark");
    darkModeToggleRef.current.setAttribute(
      "aria-pressed",
      darkModeEnabled ? "true" : "false",
    );
  }

  const toggleDarkMode = useCallback(() => {
    const root = document.documentElement;
    const nextDarkMode = !root.classList.contains("dark");
    root.classList.toggle("dark", nextDarkMode);
    window.localStorage.setItem("theme", nextDarkMode ? "dark" : "light");
    syncDarkModeToggleState();
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    const root = document.documentElement;
    const storedTheme = window.localStorage.getItem("theme");

    if (storedTheme === "dark") {
      root.classList.add("dark");
    } else if (storedTheme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      root.classList.toggle("dark", prefersDark);
    }

    syncDarkModeToggleState();
  }, []);

  return { darkModeToggleRef, toggleDarkMode, syncDarkModeToggleState };
}
