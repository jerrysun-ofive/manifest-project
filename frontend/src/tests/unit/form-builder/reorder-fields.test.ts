import { describe, expect, it } from "vitest";

import type {
  ShortTextField,
} from "../../../features/form-builder/builder-types";

import {
  moveFieldDown,
  moveFieldUp,
  reorderFields,
} from "../../../features/form-builder/reorder-fields";

// helper functions to create a short text field to be used in testing
function createTestField(id: string): ShortTextField {
  return {
    id,
    type: "short-text",
    label: id,
    required: false,
  };
}

function createFields(): ShortTextField[] {
  return [
    createTestField("a"),
    createTestField("b"),
    createTestField("c"),
  ];
}

// helper to get id of a field
function getIds(fields: { id: string }[]): string[] {
  return fields.map((field) => field.id);
}

describe("reorderFields", () => {
  it("moves a field forward", () => {
    const fields = createFields();
    const result = reorderFields(fields, "a", "c");

    expect(getIds(result)).toEqual(["b", "c", "a"]);
  });

  it("moves a field backward", () => {
    const fields = createFields();
    const result = reorderFields(fields, "c", "a");

    expect(getIds(result)).toEqual(["c", "a", "b"]);
  });

  it("returns the original array when IDs match", () => {
    const fields = createFields();
    const result = reorderFields(fields, "b", "b");

    expect(result).toBe(fields);
  });

  it("returns the original array for an unknown active ID", () => {
    const fields = createFields();

    const result = reorderFields(
      fields,
      "unknown",
      "b",
    );

    expect(result).toBe(fields);
  });

  it("returns the original array for an unknown target ID", () => {
    const fields = createFields();

    const result = reorderFields(
      fields,
      "a",
      "unknown",
    );

    expect(result).toBe(fields);
  });

  it("does not mutate/change the original array", () => {
    const fields = createFields();
    const originalOrder = getIds(fields);

    reorderFields(fields, "a", "c");

    expect(getIds(fields)).toEqual(originalOrder);
  });
});

describe("moveFieldUp", () => {
  it("moves a field up by one position", () => {
    const fields = createFields();
    const result = moveFieldUp(fields, "c");

    expect(getIds(result)).toEqual(["a", "c", "b"]);
  });

  it("does not move the first field", () => {
    const fields = createFields();
    const result = moveFieldUp(fields, "a");

    expect(result).toBe(fields);
  });

  it("does not move an unknown field", () => {
    const fields = createFields();
    const result = moveFieldUp(fields, "unknown");

    expect(result).toBe(fields);
  });

  it("does not mutate the original array", () => {
    const fields = createFields();
    const originalOrder = getIds(fields);

    moveFieldUp(fields, "c");

    expect(getIds(fields)).toEqual(originalOrder);
  });
});

describe("moveFieldDown", () => {
  it("moves a field down by one position", () => {
    const fields = createFields();
    const result = moveFieldDown(fields, "a");

    expect(getIds(result)).toEqual(["b", "a", "c"]);
  });

  it("does not move the final field", () => {
    const fields = createFields();
    const result = moveFieldDown(fields, "c");

    expect(result).toBe(fields);
  });

  it("does not move an unknown field", () => {
    const fields = createFields();
    const result = moveFieldDown(
      fields,
      "unknown",
    );

    expect(result).toBe(fields);
  });

  it("does not mutate the original array", () => {
    const fields = createFields();
    const originalOrder = getIds(fields);

    moveFieldDown(fields, "a");

    expect(getIds(fields)).toEqual(originalOrder);
  });
});