import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { FormField } from "../../features/form-builder";
import { FieldRenderer } from "../../features/form-builder/components/fields/FieldRenderer";

// forms for testing
const fields: FormField[] = [
  {
    id: "short-1",
    type: "short-text",
    label: "First name",
    required: false,
    placeholder: "Enter your name",
  },
  {
    id: "long-1",
    type: "long-text",
    label: "Introduction",
    required: false,
    placeholder: "Tell us about yourself",
  },
  {
    id: "number-1",
    type: "number",
    label: "Age",
    required: false,
    min: 0,
    max: 120,
  },
  {
    id: "date-1",
    type: "date",
    label: "Birthday",
    required: false,
  },
  {
    id: "dropdown-1",
    type: "dropdown",
    label: "Country",
    required: false,
    placeholder: "Select a country",
    options: [
      {
        id: "option-1",
        label: "Australia",
        value: "australia",
      },
      {
        id: "option-2",
        label: "New Zealand",
        value: "new-zealand",
      },
    ],
  },
];

describe("FieldRenderer", () => {
  it.each(fields)(
    "renders the $type field preview",
    (field) => {
      render(<FieldRenderer field={field} />);

      expect(
        screen.getByLabelText(`${field.label} preview`),
      ).toBeInTheDocument();
    },
  );

  it("passes number limits to the number preview", () => {
    const field = fields[2];

    render(<FieldRenderer field={field} />);

    const input = screen.getByRole("spinbutton", {
      name: "Age preview",
    });

    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "120");
  });

  it("renders the configured text placeholder", () => {
    const field = fields[0];

    render(<FieldRenderer field={field} />);

    expect(
      screen.getByPlaceholderText("Enter your name"),
    ).toBeInTheDocument();
  });
});