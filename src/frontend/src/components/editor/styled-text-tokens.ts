import type { CSSProperties } from "react";
import type { TextFormatType, TextNode } from "lexical";

const SUPPORTED_TEXT_FORMATS = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "code",
  "subscript",
  "superscript",
] as const satisfies readonly TextFormatType[];

export type SupportedStyledTextFormat = (typeof SUPPORTED_TEXT_FORMATS)[number];

export const STYLE_TOKEN_REGEX =
  /\[\[style(?:\s+([^\]]+))?\]\]([\s\S]*?)\[\[\/style\]\]/g;
export const STYLE_TOKEN_IMPORT_REGEX =
  /\[\[style(?:\s+([^\]]+))?\]\]([\s\S]*?)\[\[\/style\]\]/;
const EMPTY_STYLE_TOKEN_REGEX = /\[\[style(?:\s+[^\]]+)?\]\]\[\[\/style\]\]/g;

function normalizeCssColor(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function parseStyleAttributes(rawAttributes: string | undefined): {
  formats: SupportedStyledTextFormat[];
  style: Record<string, string>;
} {
  const style: Record<string, string> = {};
  const formats: SupportedStyledTextFormat[] = [];

  if (!rawAttributes) {
    return { formats, style };
  }

  const backgroundMatch = /(?:^|\s)bg=("[^"]+"|'[^']+'|[^\s]+)/.exec(
    rawAttributes,
  );
  const colorMatch = /(?:^|\s)color=("[^"]+"|'[^']+'|[^\s]+)/.exec(
    rawAttributes,
  );
  const formatMatch = /(?:^|\s)fmt=("[^"]+"|'[^']+'|[^\s]+)/.exec(
    rawAttributes,
  );

  if (backgroundMatch?.[1]) {
    style["background-color"] = normalizeCssColor(backgroundMatch[1]);
  }

  if (colorMatch?.[1]) {
    style.color = normalizeCssColor(colorMatch[1]);
  }

  if (formatMatch?.[1]) {
    const rawValue = normalizeCssColor(formatMatch[1]);

    for (const format of rawValue.split(",")) {
      const normalizedFormat = format.trim() as SupportedStyledTextFormat;
      if (
        normalizedFormat &&
        SUPPORTED_TEXT_FORMATS.includes(normalizedFormat)
      ) {
        formats.push(normalizedFormat);
      }
    }
  }

  return { formats, style };
}

export function getStyledTextTokenData(rawAttributes: string | undefined): {
  formats: SupportedStyledTextFormat[];
  style: CSSProperties;
} {
  const { formats, style } = parseStyleAttributes(rawAttributes);
  return { formats, style };
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
  formats: SupportedStyledTextFormat[] = [],
): string | null {
  if (text.length === 0) {
    return null;
  }

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

  if (formats.length > 0) {
    attributes.push(`fmt="${formats.join(",")}"`);
  }

  return `[[style ${attributes.join(" ")}]]${text}[[/style]]`;
}

export function extractSupportedTextFormats(
  node: TextNode,
): SupportedStyledTextFormat[] {
  return SUPPORTED_TEXT_FORMATS.filter((format) => node.hasFormat(format));
}

export function splitStyledTextTokens(text: string) {
  const parts: Array<
    | { text: string; type: "text" }
    | {
        formats: SupportedStyledTextFormat[];
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
      ...getStyledTextTokenData(match[1]),
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

export function cleanupStyledTextTokens(text: string): string {
  return text.replace(EMPTY_STYLE_TOKEN_REGEX, "");
}
