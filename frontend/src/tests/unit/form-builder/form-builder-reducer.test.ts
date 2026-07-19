import { describe, expect, it } from "vitest";

import type {
  FormDocument,
  ShortTextField,
} from "../../../features/form-builder/builder-types";

import {
  formBuilderReducer,
  initialFormDocument,
} from "../../../features/form-builder/form-builder-reducer";

import { MAX_FIELDS } from "../../../features/form-builder/limits";

function createTestField(
  id: string,
  label = id,
): ShortTextField {
  return {
    id,
    type: "short-text",
    label,
    required: false,
  };
}

function createState(
  fields: ShortTextField[] = [],
): FormDocument {
  return {
    title: "Test form",
    description: "",
    fields,
  };
}

function getIds(form: FormDocument): string[] {
  return form.fields.map((field) => field.id);
}

describe("initialFormDocument", () => {
  it("starts with an empty form", () => {
    expect(initialFormDocument).toEqual({
      title: "Untitled form",
      description: "",
      fields: [],
    });
  });
});

describe("formBuilderReducer", () => {
  it("updates the form title", () => {
    const result = formBuilderReducer(
      initialFormDocument,
      {
        type: "form/setTitle",
        title: "Contact form",
      },
    );

    expect(result.title).toBe("Contact form");
  });

  it("updates the form description", () => {
    const result = formBuilderReducer(
      initialFormDocument,
      {
        type: "form/setDescription",
        description: "Tell us about yourself",
      },
    );

    expect(result.description).toBe(
      "Tell us about yourself",
    );
  });

  it("adds a field at the requested position", () => {
    const state = createState([
      createTestField("a"),
      createTestField("c"),
    ]);

    const result = formBuilderReducer(state, {
      type: "field/add",
      field: createTestField("b"),
      index: 1,
    });

    expect(getIds(result)).toEqual(["a", "b", "c"]);
  });

  it("clamps a negative insertion position to zero", () => {
    const state = createState([
      createTestField("a"),
    ]);

    const result = formBuilderReducer(state, {
      type: "field/add",
      field: createTestField("b"),
      index: -10,
    });

    expect(getIds(result)).toEqual(["b", "a"]);
  });

  it("clamps a large insertion position to the end", () => {
    const state = createState([
      createTestField("a"),
    ]);

    const result = formBuilderReducer(state, {
      type: "field/add",
      field: createTestField("b"),
      index: 100,
    });

    expect(getIds(result)).toEqual(["a", "b"]);
  });

  it("does not add fields above the maximum", () => {
    const fields = Array.from(
      { length: MAX_FIELDS },
      (_, index) =>
        createTestField(`field-${index}`),
    );

    const state = createState(fields);

    const result = formBuilderReducer(state, {
      type: "field/add",
      field: createTestField("extra"),
      index: MAX_FIELDS,
    });

    expect(result).toBe(state);
  });

  it("updates an existing field", () => {
    const original = createTestField(
      "a",
      "Old label",
    );

    const state = createState([original]);

    const updated: ShortTextField = {
      ...original,
      label: "New label",
      required: true,
    };

    const result = formBuilderReducer(state, {
      type: "field/update",
      field: updated,
    });

    expect(result.fields[0]).toEqual(updated);
  });

  it("ignores an update for an unknown field", () => {
    const state = createState([
      createTestField("a"),
    ]);

    const result = formBuilderReducer(state, {
      type: "field/update",
      field: createTestField("unknown"),
    });

    expect(result).toBe(state);
  });

  it("deletes a field", () => {
    const state = createState([
      createTestField("a"),
      createTestField("b"),
    ]);

    const result = formBuilderReducer(state, {
      type: "field/delete",
      fieldId: "a",
    });

    expect(getIds(result)).toEqual(["b"]);
  });

  it("duplicates a field immediately after the original", () => {
    const state = createState([
      createTestField("a", "First"),
      createTestField("b", "Second"),
    ]);

    const result = formBuilderReducer(state, {
      type: "field/duplicate",
      fieldId: "a",
    });

    expect(result.fields).toHaveLength(3);
    expect(result.fields[0].id).toBe("a");
    expect(result.fields[1].id).not.toBe("a");
    expect(result.fields[1].label).toBe("First (copy)");
    expect(result.fields[2].id).toBe("b");
  });

  it("ignores duplication for an unknown field", () => {
    const state = createState([
      createTestField("a"),
    ]);

    const result = formBuilderReducer(state, {
      type: "field/duplicate",
      fieldId: "unknown",
    });

    expect(result).toBe(state);
  });

  it("does not duplicate above the maximum", () => {
    const fields = Array.from(
      { length: MAX_FIELDS },
      (_, index) =>
        createTestField(`field-${index}`),
    );

    const state = createState(fields);

    const result = formBuilderReducer(state, {
      type: "field/duplicate",
      fieldId: "field-0",
    });

    expect(result).toBe(state);
  });

  it("reorders fields", () => {
    const state = createState([
      createTestField("a"),
      createTestField("b"),
      createTestField("c"),
    ]);

    const result = formBuilderReducer(state, {
      type: "field/reorder",
      activeId: "a",
      overId: "c",
    });

    expect(getIds(result)).toEqual(["b", "c", "a"]);
  });

  it("moves a field up", () => {
    const state = createState([
      createTestField("a"),
      createTestField("b"),
    ]);

    const result = formBuilderReducer(state, {
      type: "field/moveUp",
      fieldId: "b",
    });

    expect(getIds(result)).toEqual(["b", "a"]);
  });

  it("moves a field down", () => {
    const state = createState([
      createTestField("a"),
      createTestField("b"),
    ]);

    const result = formBuilderReducer(state, {
      type: "field/moveDown",
      fieldId: "a",
    });

    expect(getIds(result)).toEqual(["b", "a"]);
  });

  it("does not mutate the previous state", () => {
    const state = createState([
      createTestField("a"),
      createTestField("b"),
    ]);

    // get a snapshot of the current state
    const snapshot = structuredClone(state);

    formBuilderReducer(state, {
      type: "field/delete",
      fieldId: "a",
    });

    expect(state).toEqual(snapshot);
  });
});