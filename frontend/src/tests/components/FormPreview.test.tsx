import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { FormDocument } from "../../features/form-builder";
import { FormPreview } from "../../features/form-builder/components/FormPreview";

const form: FormDocument = {
  title: "Contact form",
  description: "Send us a message",
  fields: [
    {
      id: "name",
      type: "short-text",
      label: "Name",
      required: true,
      placeholder: "Your name",
    },
  ],
};

describe("FormPreview", () => {
  it("validates required fields and accepts a valid response", async () => {
    const user = userEvent.setup();

    render(<FormPreview form={form} />);

    expect(
      screen.getByRole("heading", { name: "Contact form" }),
    ).toBeInTheDocument();

    const nameInput = screen.getByRole("textbox", {
      name: /Name/,
    });

    await user.click(
      screen.getByRole("button", { name: "Check response" }),
    );

    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("This field is required"),
    ).toBeInTheDocument();

    await user.type(nameInput, "Jane Smith");
    await user.click(
      screen.getByRole("button", { name: "Check response" }),
    );

    expect(
      screen.queryByText("This field is required"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("status"),
    ).toHaveTextContent("All answers are valid.");
  });
});