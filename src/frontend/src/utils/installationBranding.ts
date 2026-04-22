import type { Session } from "../types/app";
import type { OwnerCompany } from "../types/domain";

const BRANDING_STORAGE_KEY = "billetsys.installation-branding";

export type InstallationBranding = Pick<
  Session,
  | "installationCompanyName"
  | "installationLogoBase64"
  | "installationBackgroundBase64"
  | "installationHeaderFooterColor"
  | "installationHeadersColor"
  | "installationButtonsColor"
>;

export function readCachedInstallationBranding(): InstallationBranding {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const cached = window.sessionStorage.getItem(BRANDING_STORAGE_KEY);
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
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.sessionStorage.setItem(
      BRANDING_STORAGE_KEY,
      JSON.stringify(branding),
    );
  } catch {
    // Ignore storage failures and fall back to runtime session data.
  }
}

export function pickInstallationBranding(
  session?: Session | null,
): InstallationBranding {
  return {
    installationCompanyName: session?.installationCompanyName,
    installationLogoBase64: session?.installationLogoBase64,
    installationBackgroundBase64: session?.installationBackgroundBase64,
    installationHeaderFooterColor: session?.installationHeaderFooterColor,
    installationHeadersColor: session?.installationHeadersColor,
    installationButtonsColor: session?.installationButtonsColor,
  };
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
  };
}
