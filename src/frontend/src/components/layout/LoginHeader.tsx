/*
 * Eclipse Public License - v 2.0
 *
 *   THE ACCOMPANYING PROGRAM IS PROVIDED UNDER THE TERMS OF THIS ECLIPSE
 *   PUBLIC LICENSE ("AGREEMENT"). ANY USE, REPRODUCTION OR DISTRIBUTION
 *   OF THE PROGRAM CONSTITUTES RECIPIENT'S ACCEPTANCE OF THIS AGREEMENT.
 */

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useDarkModeToggle } from "../../hooks/useDarkModeToggle";

interface LoginHeaderProps {
  brandName: string;
  logoSrc?: string;
}

export default function LoginHeader({ brandName, logoSrc }: LoginHeaderProps) {
  const [now, setNow] = useState(() => new Date());
  const { darkModeToggleRef, toggleDarkMode } = useDarkModeToggle();

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  return (
    <header className="bg-header-bg text-header-text px-5 py-3 flex items-center justify-between gap-4">
      <a
        className="flex items-center gap-2.5 text-header-text no-underline text-xl font-bold"
        href="/"
      >
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={`${brandName} logo`}
            className="h-7 w-7 shrink-0 object-contain"
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="w-6 h-6 fill-none stroke-current stroke-2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M7 8h10M7 12h10M7 16h6" />
            <path d="M6 8l1 1 2-2" />
          </svg>
        )}
        {brandName}
      </a>
      <div className="flex items-center gap-3">
        <button
          ref={darkModeToggleRef}
          type="button"
          onClick={toggleDarkMode}
          aria-pressed="false"
          className="group relative inline-flex h-8 w-16 items-center rounded-full border border-white/35 bg-white/12 p-1 text-header-text transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-header-bg)]"
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
        >
          <SunIcon className="absolute left-2 size-3.5 opacity-90" />
          <MoonIcon className="absolute right-2 size-3.5 opacity-90" />
          <span className="pointer-events-none inline-block h-6 w-6 translate-x-0 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out group-aria-[pressed=true]:translate-x-8" />
        </button>
        <span className="font-semibold tabular-nums">
          {now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </header>
  );
}
