/**
 * validate the structure of a the form builders config
 * according the the predefined limits
 */

import { z } from "zod";
import type { FormDocument, FormField } from "./builder-types";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_DROPDOWN_OPTIONS,
  MAX_FIELDS,
  MAX_LABEL_LENGTH,
  MAX_OPTION_LABEL_LENGTH,
  MAX_OPTION_VALUE_LENGTH,
  MAX_PLACEHOLDER_LENGTH,
  MAX_TEXT_VALUE_LENGTH
} from "./limits";

/** properties shared by every field type */
const baseFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(MAX_LABEL_LENGTH),
  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH)
    .optional(),
  required: z.boolean(),
});

/** 
 * shared properties for short and long text fields 
 * 
 * object shape rather than zod schema. spreading it into
 * each text schema keeps those schemas as normal zod objects
 * */
const textFieldShape = {
  placeholder: z
    .string()
    .max(MAX_PLACEHOLDER_LENGTH)
    .optional(),
  defaultValue: z
    .string()
    .max(MAX_TEXT_VALUE_LENGTH)
    .optional(),
  minLength: z
    .number()
    .int()
    .nonnegative()
    .max(MAX_TEXT_VALUE_LENGTH)
    .optional(),
  maxLength: z
    .number()
    .int()
    .nonnegative()
    .max(MAX_TEXT_VALUE_LENGTH)
    .optional(),

};

const shortTextSchema = baseFieldSchema.extend({
  type: z.literal("short-text"),
  ...textFieldShape,
});

const longTextSchema = baseFieldSchema.extend({
  type: z.literal("long-text"),
  ...textFieldShape,
});

const numberSchema = baseFieldSchema.extend({
  type: z.literal("number"),
  placeholder: z
    .string()
    .max(MAX_PLACEHOLDER_LENGTH)
    .optional(),
  defaultValue: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

/** YYYY-MM-DD format */
const dateSchema = baseFieldSchema.extend({
  type: z.literal("date"),
  defaultValue: z.iso.date().optional(),
});

const dropdownOptionSchema = z.object({
  id: z.string().min(1),
  label: z
    .string()
    .min(1)
    .max(MAX_OPTION_LABEL_LENGTH),
  value: z
    .string()
    .min(1)
    .max(MAX_OPTION_VALUE_LENGTH),
});

const dropdownSchema = baseFieldSchema.extend({
  type: z.literal("dropdown"),
  placeholder: z
    .string()
    .max(MAX_PLACEHOLDER_LENGTH)
    .optional(),
  defaultValue: z.string().optional(),
  options: z
    .array(dropdownOptionSchema)
    .min(1)
    .max(MAX_DROPDOWN_OPTIONS),
});

/**
 * zod will look at the type property to choose the correct schema
 * 
 * docs used: 
 *  - https://zod.dev/api#superrefine
 *  - https://zod.dev/api#exclusive-unions-xor 
 */
export const formFieldSchema: z.ZodType<FormField> = z
  .discriminatedUnion("type", [
    shortTextSchema,
    longTextSchema,
    numberSchema,
    dateSchema,
    dropdownSchema,
  ])
  .superRefine((field, context) => {
    // validate settings shared by the long and short text field types
    if (field.type === "short-text" || field.type === "long-text") {
      // min length must be < max length
      if (
        field.minLength !== undefined &&
        field.maxLength !== undefined &&
        field.minLength > field.maxLength
      ) {
        context.addIssue({
          code: "custom",
          path: ["minLength"],
          message: "Min length can't be larger than max length."
        });
      }
      
      // default value cannt be below minimum
      if (
        field.defaultValue !== undefined &&
        field.minLength !== undefined &&
        field.defaultValue.length < field.minLength
      ) {
        context.addIssue({
          code: "custom",
          path: ["defaultValue"],
          message: "Default value is shorter than min length."
        });
      }
      
      // default value can't be greater than max length
      if (
        field.defaultValue !== undefined &&
        field.maxLength !== undefined &&
        field.defaultValue.length > field.maxLength
      ) {
        context.addIssue({
          code: "custom",
          path: ["defaultValue"],
          message:
            "Default value exceeds the max length",
        });
      }
    }

    // validate relationships between number setting
    if (field.type === "number") {
      // min value cannot be > max value
      if (
        field.min !== undefined &&
        field.max !== undefined &&
        field.min > field.max
      ) {
        context.addIssue({
          code: "custom",
          path: ["min"],
          message:
            "Min value cannot exceed max value.",
        });
      }

      // default value can't be below minimum
      if (
        field.defaultValue !== undefined &&
        field.min !== undefined &&
        field.defaultValue < field.min
      ) {
        context.addIssue({
          code: "custom",
          path: ["defaultValue"],
          message: "Default value is less than the min value.",
        });
      }

      // default value cannot be greater than max value
      if (
        field.defaultValue !== undefined &&
        field.max !== undefined &&
        field.defaultValue > field.max
      ) {
        context.addIssue({
          code: "custom",
          path: ["defaultValue"],
          message: "Default value exceeds the max value.",
        });
      }
    }

    // validate dropdown settings
    if (field.type === "dropdown") {
      const optionIds = field.options.map(
        (option) => option.id,
      );
      const optionValues = field.options.map(
        (option) => option.value,
      );

      // check for duplicates
      const hasDuplicateIds = new Set(optionIds).size !== optionIds.length;
      if (hasDuplicateIds) {
        context.addIssue({
          code: "custom",
          path: ["options"],
          message: "Dropdown option IDs must be unique",
        });
      }

      const hasDuplicateValues = new Set(optionValues).size !== optionValues.length;
      if (hasDuplicateValues) {
        context.addIssue({
          code: "custom",
          path: ["options"],
          message:"Dropdown option values must be unique",
        });
      }

      // check default value match a dropdown option
      if (
        field.defaultValue !== undefined &&
        !field.options.some(
          (option) =>
            option.value === field.defaultValue,
        )
      ) {
        context.addIssue({
          code: "custom",
          path: ["defaultValue"],
          message: "Default value must match an existing dropdown option",
        });
      }
    }
  });


/**
 * Valudate the compete form
 * 
 * ZodType<FormDocument> uses this runtime schema and connects to the manual defined FormDocument type
 */
export const formDocumentSchema: z.ZodType<FormDocument> = z
  .object({
    title: z
      .string()
      .max(MAX_LABEL_LENGTH),
    description: z
      .string()
      .max(MAX_DESCRIPTION_LENGTH),
    fields: z
      .array(formFieldSchema)
      .max(MAX_FIELDS),
  })
  .superRefine((form, context) => {
    const fieldIds = form.fields.map(
      (field) => field.id,
    );
    const hasDuplicateFieldIds =
      new Set(fieldIds).size !== fieldIds.length;
    if (hasDuplicateFieldIds) {
      context.addIssue({
        code: "custom",
        path: ["fields"],
        message: "Field IDs must be unique",
      });
    }
  });
