import { describe, expect, it } from "vitest";

import type {
  DropdownField,
  FormDocument,
  NumberField,
  ShortTextField,
} from "../../../features/form-builder/builder-types";

import { createField } from "../../../features/form-builder/field-defaults";

import {
  formDocumentSchema,
  formFieldSchema,
} from "../../../features/form-builder/field-schema";

import {
  MAX_DESCRIPTION_LENGTH,
  MAX_FIELDS,
  MAX_LABEL_LENGTH,
} from "../../../features/form-builder/limits";

// helper functions
function createShortText(
  changes: Partial<ShortTextField> = {},
): ShortTextField {
  return {
    id: "short-text-1",
    type: "short-text",
    label: "Name",
    required: false,
    ...changes,
  };
}

function createNumber(
  changes: Partial<NumberField> = {},
): NumberField {
  return {
    id: "number-1",
    type: "number",
    label: "Age",
    required: false,
    ...changes,
  };
}

function createDropdown(
  changes: Partial<DropdownField> = {},
): DropdownField {
  return {
    id: "dropdown-1",
    type: "dropdown",
    label: "Account type",
    required: false,
    options: [
      {
        id: "option-1",
        label: "Personal",
        value: "personal",
      },
      {
        id: "option-2",
        label: "Business",
        value: "business",
      },
    ],
    ...changes,
  };
}

describe("formFieldSchema", () => {
  it.each([
    "short-text",
    "long-text",
    "number",
    "date",
    "dropdown",
  ] as const)("accepts a valid %s field", (type) => {
    const field = createField(type);

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(true);
  });

  it("rejects a missing field ID", () => {
    const field = {
      type: "short-text",
      label: "Name",
      required: false,
    };

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(false);
  });

  it("rejects an empty label", () => {
    const field = createShortText({
      label: "",
    });

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(false);
  });

  it("rejects a label exceeding the limit", () => {
    const field = createShortText({
      label: "a".repeat(MAX_LABEL_LENGTH + 1),
    });

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(false);
  });

  it("rejects a description exceeding the limit", () => {
    const field = createShortText({
      description: "a".repeat(
        MAX_DESCRIPTION_LENGTH + 1,
      ),
    });

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(false);
  });

  it("rejects minimum text length above maximum", () => {
    const field = createShortText({
      minLength: 20,
      maxLength: 10,
    });

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(false);
  });

  it("rejects a default text shorter than minimum", () => {
    const field = createShortText({
      defaultValue: "abc",
      minLength: 5,
    });

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(false);
  });

  it("rejects a default text longer than maximum", () => {
    const field = createShortText({
      defaultValue: "abcdef",
      maxLength: 5,
    });

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(false);
  });

  it("rejects a number minimum above maximum", () => {
    const field = createNumber({
      min: 100,
      max: 10,
    });

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(false);
  });

  it("rejects a numeric default below minimum", () => {
    const field = createNumber({
      defaultValue: 5,
      min: 10,
    });

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(false);
  });

  it("rejects a numeric default above maximum", () => {
    const field = createNumber({
      defaultValue: 20,
      max: 10,
    });

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(false);
  });

  it("accepts a valid ISO date", () => {
    const field = createField("date");
    field.defaultValue = "2026-07-19";

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(true);
  });

  it("rejects an impossible ISO date", () => {
    const field = createField("date");
    field.defaultValue = "2026-02-31";

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(false);
  });

  it("rejects duplicate dropdown option IDs", () => {
    const field = createDropdown({
      options: [
        {
          id: "duplicate",
          label: "Personal",
          value: "personal",
        },
        {
          id: "duplicate",
          label: "Business",
          value: "business",
        },
      ],
    });

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(false);
  });

  it("rejects duplicate dropdown option values", () => {
    const field = createDropdown({
      options: [
        {
          id: "option-1",
          label: "Personal",
          value: "duplicate",
        },
        {
          id: "option-2",
          label: "Business",
          value: "duplicate",
        },
      ],
    });

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(false);
  });

  it("rejects a dropdown default that does not exist", () => {
    const field = createDropdown({
      defaultValue: "unknown",
    });

    expect(
      formFieldSchema.safeParse(field).success,
    ).toBe(false);
  });
});

describe("formDocumentSchema", () => {
  it("accepts a valid form document", () => {
    const form: FormDocument = {
      title: "Contact form",
      description: "Contact details",
      fields: [
        createShortText(),
        createNumber(),
        createDropdown(),
      ],
    };

    expect(
      formDocumentSchema.safeParse(form).success,
    ).toBe(true);
  });

  it("rejects duplicate field IDs", () => {
    const form: FormDocument = {
      title: "Contact form",
      description: "",
      fields: [
        createShortText({ id: "duplicate" }),
        createNumber({ id: "duplicate" }),
      ],
    };

    expect(
      formDocumentSchema.safeParse(form).success,
    ).toBe(false);
  });

  it("rejects forms exceeding the field limit", () => {
    const fields = Array.from(
      { length: MAX_FIELDS + 1 },
      (_, index) =>
        createShortText({
          id: `field-${index}`,
        }),
    );

    const form: FormDocument = {
      title: "Large form",
      description: "",
      fields,
    };

    expect(
      formDocumentSchema.safeParse(form).success,
    ).toBe(false);
  });
});