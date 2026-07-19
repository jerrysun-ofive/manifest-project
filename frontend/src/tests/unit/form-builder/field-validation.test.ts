import { describe, expect, it } from "vitest";

import type {
  DateField,
  DropdownField,
  NumberField,
  ShortTextField,
} from "../../../features/form-builder/builder-types";

import {
  validateFieldValue,
  validateFormAnswers,
} from "../../../features/form-builder/field-validation";

function createTextField(
  changes: Partial<ShortTextField> = {},
): ShortTextField {
  return {
    id: "text-1",
    type: "short-text",
    label: "Name",
    required: false,
    ...changes,
  };
}

function createNumberField(
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

function createDateField(
  changes: Partial<DateField> = {},
): DateField {
  return {
    id: "date-1",
    type: "date",
    label: "Birthday",
    required: false,
    ...changes,
  };
}

function createDropdownField(
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

describe("validateFieldValue", () => {
  it("rejects an empty required field", () => {
    const field = createTextField({
      required: true,
    });

    expect(validateFieldValue(field, "")).toEqual({
      ok: false,
      message: "This field is required",
    });
  });

  it("accepts an empty optional field", () => {
    const field = createTextField();

    expect(validateFieldValue(field, "")).toEqual({
      ok: true,
    });
  });

  it("rejects a non-string text value", () => {
    const field = createTextField();

    expect(validateFieldValue(field, 123)).toEqual({
      ok: false,
      message: "Enter only text",
    });
  });

  it("rejects text shorter than minimum", () => {
    const field = createTextField({
      minLength: 5,
    });

    expect(validateFieldValue(field, "abc")).toEqual({
      ok: false,
      message: "Text must be at least 5 characters.",
    });
  });

  it("accepts text exactly at the minimum", () => {
    const field = createTextField({
      minLength: 5,
    });

    expect(validateFieldValue(field, "abcde")).toEqual({
      ok: true,
    });
  });

  it("rejects text longer than maximum", () => {
    const field = createTextField({
      maxLength: 5,
    });

    expect(
      validateFieldValue(field, "abcdef"),
    ).toEqual({
      ok: false,
      message: "Text cannot exceed 5 characters.",
    });
  });

  it("accepts a number", () => {
    const field = createNumberField();

    expect(validateFieldValue(field, 20)).toEqual({
      ok: true,
    });
  });

  it("accepts a numeric string", () => {
    const field = createNumberField();

    expect(validateFieldValue(field, "20")).toEqual({
      ok: true,
    });
  });

  it.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    true,
    [],
    {},
  ])("rejects invalid numeric input %#", (value) => {
    const field = createNumberField();

    expect(validateFieldValue(field, value)).toEqual({
      ok: false,
      message: "Enter a valid number.",
    });
  });

  it("rejects a number below minimum", () => {
    const field = createNumberField({
      min: 10,
    });

    expect(validateFieldValue(field, 5)).toEqual({
      ok: false,
      message: "Must be at least 10.",
    });
  });

  it("rejects a number above maximum", () => {
    const field = createNumberField({
      max: 10,
    });

    expect(validateFieldValue(field, 20)).toEqual({
      ok: false,
      message: "Must be at most 10.",
    });
  });

  it("accepts a valid ISO date", () => {
    const field = createDateField();

    expect(
      validateFieldValue(field, "2026-07-19"),
    ).toEqual({
      ok: true,
    });
  });

  it.each([
    "19/07/2026",
    "July 19, 2026",
    "2026-02-31",
    "in-valid-date",
  ])("rejects invalid date %s", (value) => {
    const field = createDateField();

    expect(validateFieldValue(field, value)).toEqual({
      ok: false,
      message: "Enter a valid date.",
    });
  });

  it("accepts a valid dropdown option", () => {
    const field = createDropdownField();

    expect(
      validateFieldValue(field, "business"),
    ).toEqual({
      ok: true,
    });
  });

  it("rejects an unknown dropdown option", () => {
    const field = createDropdownField();

    expect(
      validateFieldValue(field, "unknown"),
    ).toEqual({
      ok: false,
      message: "Select a valid option.",
    });
  });
});

describe("validateFormAnswers", () => {
  it("returns errors indexed by field ID", () => {
    const textField = createTextField({
      id: "name",
      required: true,
    });

    const numberField = createNumberField({
      id: "age",
      min: 18,
    });

    const errors = validateFormAnswers(
      [textField, numberField],
      {
        name: "",
        age: 10,
      },
    );

    expect(errors).toEqual({
      name: "This field is required",
      age: "Must be at least 18.",
    });
  });

  it("returns an empty object for valid answers", () => {
    const textField = createTextField({
      id: "name",
      required: true,
    });

    const numberField = createNumberField({
      id: "age",
      min: 18,
    });

    const errors = validateFormAnswers(
      [textField, numberField],
      {
        name: "Jamie",
        age: 25,
      },
    );

    expect(errors).toEqual({});
  });
});