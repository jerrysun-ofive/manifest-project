/**
 * The menu ui doesn't contain hardcoded field information
 * and allow search keywords to grow wothout changing the components
 */

import type { FieldType } from "./builder-types";

export type SlashCommand = {
  type: FieldType;
  label: string;
  description: string;
  symbol: string;
  keywords: string[];
};

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    type: "short-text",
    label: "Short text",
    description: "A single-line text answer",
    symbol: "T",
    keywords: ["text", "input", "name", "email"],
  },
  {
    type: "long-text",
    label: "Long text",
    description: "A multi-line written answer",
    symbol: "LT",
    keywords: ["textarea", "paragraph", "message"],
  },
  {
    type: "number",
    label: "Number",
    description: "A numeric answer",
    symbol: "#",
    keywords: ["number", "quantity", "age", "amount"],
  },
  {
    type: "date",
    label: "Date",
    description: "A calendar date",
    symbol: "D",
    keywords: ["date", "calendar", "birthday"],
  },
  {
    type: "dropdown",
    label: "Dropdown",
    description: "Select one answer from a list",
    symbol: "⌄",
    keywords: ["select", "choice", "options", "list"],
  },
];