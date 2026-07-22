import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../App";

describe("App", () => {
  it("renders the empty builder", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "Untitled form",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("No fields yet"),
    ).toBeInTheDocument();

    expect(screen.getByText("0/50 fields")).toBeInTheDocument();
  });

  it("adds and selects a short text field", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(
      screen.getByRole("button", {
        name: "Add field",
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: "Insert a field",
      }),
    ).toBeInTheDocument();

    await user.keyboard("{Enter}");

    expect(screen.getByText("1/50 fields")).toBeInTheDocument();

    expect(
      screen.queryByText("No fields yet"),
    ).not.toBeInTheDocument();

    const label = screen.getByRole("textbox", {
      name: "Field 1 label",
    });

    expect(label).toHaveValue("Untitled Question");
    expect(label).toHaveFocus();

    expect(label.closest("article")).toHaveAttribute(
      "data-selected",
      "true",
    );

    expect(
      screen.getByLabelText("Untitled Question preview"),
    ).toBeInTheDocument();
  });
});