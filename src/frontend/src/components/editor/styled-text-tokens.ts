import type { CSSProperties } from "react";

export const STYLE_TOKEN_REGEX =
  /\[\[style(?:\s+([^\]]+))?\]\]([\s\S]*?)\[\[\/style\]\]/g;
export const STYLE_TOKEN_IMPORT_REGEX =
  /\[\[style(?:\s+([^\]]+))?\]\]([\s\S]*?)\[\[\/style\]\]/;

function normalizeCssColor(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function parseStyleAttributes(
  rawAttributes: string | undefined,
): Record<string, string> {
  const style: Record<string, string> = {};

  if (!rawAttributes) {
    return style;
  }

  const backgroundMatch = /(?:^|\s)bg=("[^"]+"|'[^']+'|[^\s]+)/.exec(
    rawAttributes,
  );
  const colorMatch = /(?:^|\s)color=("[^"]+"|'[^']+'|[^\s]+)/.exec(
    rawAttributes,
  );

  if (backgroundMatch?.[1]) {
    style["background-color"] = normalizeCssColor(backgroundMatch[1]);
  }

  if (colorMatch?.[1]) {
    style.color = normalizeCssColor(colorMatch[1]);
  }

  return style;
}

export function getStyledTextTokenStyle(
  rawAttributes: string | undefined,
): CSSProperties {
  return parseStyleAttributes(rawAttributes);
}

export function extractSupportedInlineStyles(style: string): {
  backgroundColor?: string;
  color?: string;
} {
  const result: { backgroundColor?: string; color?: string } = {};

  for (const declaration of style.split(";")) {
    const [property, rawValue] = declaration.split(":");
    if (!property || !rawValue) {
      continue;
    }

    const normalizedProperty = property.trim().toLowerCase();
    const value = rawValue.trim();

    if (normalizedProperty === "background-color" && value) {
      result.backgroundColor = value;
    }

    if (normalizedProperty === "color" && value) {
      result.color = value;
    }
  }

  return result;
}

export function serializeStyledTextToken(
  text: string,
  style: { backgroundColor?: string; color?: string },
): string | null {
  const attributes: string[] = [];

  if (style.backgroundColor) {
    attributes.push(`bg="${style.backgroundColor}"`);
  }

  if (style.color) {
    attributes.push(`color="${style.color}"`);
  }

  if (attributes.length === 0) {
    return null;
  }

  return `[[style ${attributes.join(" ")}]]${text}[[/style]]`;
}

export function splitStyledTextTokens(text: string) {
  const parts: Array<
    | { text: string; type: "text" }
    | {
        style: CSSProperties;
        text: string;
        type: "styled";
      }
  > = [];

  let lastIndex = 0;

  for (const match of text.matchAll(STYLE_TOKEN_REGEX)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, index), type: "text" });
    }

    parts.push({
      style: getStyledTextTokenStyle(match[1]),
      text: match[2] ?? "",
      type: "styled",
    });

    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), type: "text" });
  }

  return parts;
}
