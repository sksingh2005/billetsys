import type { Session } from "../types/app";
import type { OwnerCompany } from "../types/domain";

const BRANDING_STORAGE_KEY = "billetsys.installation-branding";
export const DEFAULT_INSTALLATION_COMPANY_NAME = "mnemosyne systems";
export const DEFAULT_FAVICON_HREF = "/favicon.ico";

export type InstallationBranding = Pick<
  Session,
  | "installationCompanyName"
  | "installationLogoBase64"
  | "installationBackgroundBase64"
  | "installationHeaderFooterColor"
  | "installationHeadersColor"
  | "installationButtonsColor"
  | "installationUse24HourClock"
>;

export function readCachedInstallationBranding(): InstallationBranding {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const cached = window.localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!cached) {
      return {};
    }
    const parsed = JSON.parse(cached) as InstallationBranding | null;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeCachedInstallationBranding(
  branding: InstallationBranding,
) {
  setInstallationFavicon(branding.installationLogoBase64);
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding));
  } catch {
    // Ignore storage failures and fall back to runtime session data.
  }
}

export function pickInstallationBranding(
  session?: Session | null,
): InstallationBranding {
  if (!session) {
    return {};
  }
  const result: InstallationBranding = {};
  if (session.installationCompanyName !== undefined)
    result.installationCompanyName = session.installationCompanyName;
  if (session.installationLogoBase64 !== undefined)
    result.installationLogoBase64 = session.installationLogoBase64;
  if (session.installationBackgroundBase64 !== undefined)
    result.installationBackgroundBase64 = session.installationBackgroundBase64;
  if (session.installationHeaderFooterColor !== undefined)
    result.installationHeaderFooterColor =
      session.installationHeaderFooterColor;
  if (session.installationHeadersColor !== undefined)
    result.installationHeadersColor = session.installationHeadersColor;
  if (session.installationButtonsColor !== undefined)
    result.installationButtonsColor = session.installationButtonsColor;
  if (session.installationUse24HourClock !== undefined)
    result.installationUse24HourClock = session.installationUse24HourClock;
  return result;
}

export function ownerInstallationBranding(
  owner?: OwnerCompany | null,
): InstallationBranding {
  return {
    installationCompanyName: owner?.name,
    installationLogoBase64: owner?.logoBase64,
    installationBackgroundBase64: owner?.backgroundBase64,
    installationHeaderFooterColor: owner?.headerFooterColor,
    installationHeadersColor: owner?.headersColor,
    installationButtonsColor: owner?.buttonsColor,
    installationUse24HourClock: owner?.use24HourClock,
  };
}

export function installationCompanyName(name?: string) {
  return name?.trim() || DEFAULT_INSTALLATION_COMPANY_NAME;
}

function faviconMimeType(href: string) {
  if (href.startsWith("data:")) {
    const match = href.match(/^data:([^;,]+)[;,]/);
    return match?.[1] || "image/png";
  }
  if (href.endsWith(".svg")) {
    return "image/svg+xml";
  }
  if (href.endsWith(".png")) {
    return "image/png";
  }
  return "image/x-icon";
}

export function setInstallationFavicon(logoSrc?: string) {
  if (typeof document === "undefined") {
    return;
  }
  const href = logoSrc?.trim() || DEFAULT_FAVICON_HREF;
  const head = document.head;
  if (!head) {
    return;
  }
  head.querySelectorAll('link[rel~="icon"]').forEach((existing) => {
    existing.remove();
  });
  ["icon", "shortcut icon"].forEach((rel) => {
    const link = document.createElement("link");
    link.setAttribute("rel", rel);
    link.setAttribute("href", href);
    link.setAttribute("type", faviconMimeType(href));
    link.setAttribute("data-installation-favicon", "true");
    if (href === DEFAULT_FAVICON_HREF) {
      link.setAttribute("sizes", "16x16");
    }
    head.appendChild(link);
  });
}
