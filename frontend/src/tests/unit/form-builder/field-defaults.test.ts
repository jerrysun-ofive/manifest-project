import { describe, expect, it } from "vitest";
import type {
  FieldType,
  ShortTextField,
} from "../../../features/form-builder/builder-types";

import {
  createDropdownOption,
  createField,
  duplicateField,
} from "../../../features/form-builder/field-defaults";

import { formFieldSchema } from "../../../features/form-builder/field-schema";
import { MAX_LABEL_LENGTH } from "../../../features/form-builder/limits";

describe("createField", () => {
  const fieldTypes: FieldType[] = [
    "short-text",
    "long-text",
    "number",
    "date",
    "dropdown",
  ];


  it.each(fieldTypes)(
    "creates a valid %s field",
    (fieldType) => {
      const field = createField(fieldType);
      const result = formFieldSchema.safeParse(field);
      expect(result.success).toBe(true);
      expect(field.type).toBe(fieldType);
      expect(field.id).not.toBe("");
      expect(field.required).toBe(false);
    },
  );

  it("creates a unique id for each field", () => {
    const first = createField("short-text");
    const second = createField("short-text");
    expect(first.id).not.toBe(second.id);
  });

  it("creates two default dropdown options", () => {
    const field = createField("dropdown");

    expect(field.options).toHaveLength(2);
    expect(field.options[0].label).toBe("Option 1");
    expect(field.options[1].label).toBe("Option 2");
  });

  it("creates unique dropdown option IDs and values", () => {
    const field = createField("dropdown");
    const ids = field.options.map((option) => option.id);
    const values = field.options.map(
      (option) => option.value,
    );
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(values).size).toBe(values.length);
  });
});

// test dropdown 
describe("createDropdownOption", () => {
  it("creates unique ids and fallback values", () => {
    const first = createDropdownOption();
    const second = createDropdownOption();
    expect(first.id).not.toBe(second.id);
    expect(first.value).not.toBe(second.value);
  });

  it("uses the label and value given", () => {
    const option = createDropdownOption(
      "Business",
      "business",
    );
    expect(option.label).toBe("Business");
    expect(option.value).toBe("business");
  });
});

// test duplicates
describe("duplicateField", () => {
  it("creates a new field ID", () => {
    const original = createField("short-text");
    const duplicate = duplicateField(original);
    expect(duplicate.id).not.toBe(original.id);
    expect(duplicate.type).toBe(original.type);
  });

  it("does not change the original field", () => {
    const original = createField("dropdown");
    const snapshot = structuredClone(original);
    duplicateField(original);
    expect(original).toEqual(snapshot);
  });

  it("creates new option ids when duplicating a dropdown", () => {
    const original = createField("dropdown");
    const duplicate = duplicateField(original);

    expect(duplicate.type).toBe("dropdown");
    if (duplicate.type !== "dropdown") {
      throw new Error(
        "Expected the duplicate to be a dropdown",
      );
    }

    const originalIds = original.options.map(
      (option) => option.id,
    );

    const duplicateIds = duplicate.options.map(
      (option) => option.id,
    );

    expect(duplicateIds).not.toEqual(originalIds);
  });

  it("does not create a label longer than the limit", () => {
    const original: ShortTextField = {
      id: "field-1",
      type: "short-text",
      label: "a".repeat(MAX_LABEL_LENGTH), // create a label at max length
      required: false,
    };

    const duplicate = duplicateField(original);
    expect(duplicate.label.length).toBeLessThanOrEqual(
      MAX_LABEL_LENGTH,
    );

    expect(
      duplicate.label.endsWith(" (copy)"),
    ).toBe(true);
  });
});