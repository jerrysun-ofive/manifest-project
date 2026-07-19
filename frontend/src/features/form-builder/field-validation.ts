/**
 * given a field config and a user value, return if its valid
 */
import type { FormField } from "./builder-types";
import { z } from "zod";


export type FieldValidationRes = {ok: true} | {ok: false; message: string };
export type FormAnswers = Record<string, unknown>;

export function validateFieldValue(
  field: FormField,
  value: unknown,
): FieldValidationRes {
  const isEmpty = 
    value === undefined || 
    value === null || 
    (typeof value === "string" && value.trim() === "");

  if (field.required && isEmpty) {
    return { ok: false, message: "This field is required" };
  }

  // if optional and empty, its fine and no further check needed
  if (isEmpty) {
    return { ok: true };
  }

  switch (field.type) {
    case "short-text": // can fall through to long text case since they are the same in validation
    case "long-text":{
      // check type is correct
      if (typeof value !== "string") {
        return { ok: false, message: "Enter only text" };
      }

      // check min length is valid
      if (
        field.minLength !== undefined && 
        value.length < field.minLength
      ) {
        return {
          ok: false,
          message: `Text must be at least ${field.minLength} characters.`,
        };
      }

      if (
        field.maxLength !== undefined &&
        value.length > field.maxLength
      ) {
        return {
          ok: false,
          message: `Text cannot exceed ${field.maxLength} characters.`,
        };
      }

      // passes validations
      return { ok: true }
    }
    case "number":{
      // convert input to number if possible
      const num =
        typeof value === "number"
          ? value
          : typeof value === "string"
            ? Number(value)
            : Number.NaN;
      if (!Number.isFinite(num)) {
        return {
          ok: false,
          message: "Enter a valid number.",
        };
      }

      if (field.min !== undefined && num < field.min) {
        return { ok: false, message: `Must be at least ${field.min}.` };
      }
      if (field.max !== undefined && num > field.max) {
        return { ok: false, message: `Must be at most ${field.max}.` };
      }
      return { ok: true };
    }
    case "date": {
      if (
        typeof value !== "string" ||
        !z.iso.date().safeParse(value).success
      ) {
        return { ok: false, message: "Enter a valid date." };
      }
      return { ok: true };
    }
    case "dropdown": {
      if (typeof value !== "string") {
        return { ok: false, message: "Select an option." };
      }
      const allowed = field.options.some((option) => option.value === value);
      if (!allowed) {
        return { ok: false, message: "Select a valid option." };
      }
      return { ok: true };
    }
  }
}

export function validateFormAnswers(
  fields: FormField[],
  answers: FormAnswers,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const result = validateFieldValue(field, answers[field.id]);
    if (result.ok === false) {
      errors[field.id] = result.message;
    }
  }
  return errors;
}