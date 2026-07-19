/** When users pick (for example) "short text" from /, 
 * we need a complete, valid field object immediately */

import { nanoid } from "nanoid"; // using nanoid since it gives short unique strings
import type {
  DateField,
  DropdownField,
  DropdownOption,
  FieldType,
  FormField,
  LongTextField,
  NumberField,
  ShortTextField,
} from "./builder-types";
import { MAX_LABEL_LENGTH } from "./limits";

export function createDropdownOption(
  label = "Option",
  value?: string,
): DropdownOption {
  const id = nanoid();

  return {
    id,
    label,
    value: value ?? `option_${id}`,
  };
}

export function createField(type: "short-text"): ShortTextField;
export function createField(type: "long-text"): LongTextField;
export function createField(type: "number"): NumberField;
export function createField(type: "date"): DateField;
export function createField(type: "dropdown"): DropdownField;
export function createField(type: FieldType): FormField;
export function createField(type: FieldType): FormField {
  const base = {
    id: nanoid(),
    label: "Untitled Question",
    required: false,
  };

  switch (type) {
    case "short-text":
      return {
        ...base,
        type: "short-text",
        placeholder: "",
      }
    case "long-text":
      return {
        ...base,
        type: "long-text",
        placeholder: "",
      };
    case "number":
      return {
        ...base,
        type: "number",
        placeholder: "",
      };
    case "date":
      return {
        ...base,
        type: "date"
      };
    case "dropdown":
      return {
        ...base,
        type: "dropdown",
        placeholder: "Select an option",
        // default with 2 dropdown options created
        options: [
          createDropdownOption("Option 1", "option_1"),
          createDropdownOption("Option 2", "option_2"),
        ],
      };
  }
}

/** copy a field with a new id and cleanly handles dropdown copies too */
export function duplicateField(field: FormField): FormField {
  const copy = structuredClone(field);
  // get new id for copied field
  copy.id = nanoid();
  // default name with (copy) to avoid duplicates
  const suffix = " (copy)";
  copy.label =
    `${field.label.slice(0, MAX_LABEL_LENGTH - suffix.length)}${suffix}`;

  if (copy.type === "dropdown") {
    copy.options = copy.options.map((opt) => ({
      ...opt,
      id: nanoid(),
    }));
  }

  return copy;
}