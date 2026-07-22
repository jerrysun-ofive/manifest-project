import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EditableText } from "../../features/form-builder/components/EditableText";

describe("EditableText", () => {
  it("commits changed text when focus leaves", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();

    render(
      <EditableText
        value="Original title"
        onCommit={onCommit}
        ariaLabel="Title"
        placeholder="Enter a title"
        maxLength={200}
      />,
    );

    const input = screen.getByRole("textbox", {
      name: "Title",
    });

    await user.clear(input);
    await user.type(input, "Updated title");

    expect(onCommit).not.toHaveBeenCalled();

    await user.tab();

    expect(onCommit).toHaveBeenCalledOnce();
    expect(onCommit).toHaveBeenCalledWith("Updated title");
  });

  it("commits a single-line edit when Enter is pressed", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();

    render(
      <EditableText
        value="Original"
        onCommit={onCommit}
        ariaLabel="Title"
        placeholder="Enter a title"
        maxLength={200}
      />,
    );

    const input = screen.getByRole("textbox", {
      name: "Title",
    });

    await user.clear(input);
    await user.type(input, "Updated{Enter}");

    expect(onCommit).toHaveBeenCalledWith("Updated");
    expect(input).not.toHaveFocus();
  });

  it("restores the original value when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();

    render(
      <EditableText
        value="Original"
        onCommit={onCommit}
        ariaLabel="Title"
        placeholder="Enter a title"
        maxLength={200}
      />,
    );

    const input = screen.getByRole("textbox", {
      name: "Title",
    });

    await user.clear(input);
    await user.type(input, "Discard this{Escape}");

    expect(input).toHaveValue("Original");
    expect(input).not.toHaveFocus();
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("allows Enter inside a multiline editor", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();

    render(
      <EditableText
        value="First line"
        onCommit={onCommit}
        ariaLabel="Description"
        placeholder="Enter a description"
        maxLength={1000}
        multiline
      />,
    );

    const textarea = screen.getByRole("textbox", {
      name: "Description",
    });

    await user.click(textarea);
    await user.type(textarea, "{Enter}Second line");

    expect(textarea).toHaveValue(
      "First line\nSecond line",
    );
    expect(onCommit).not.toHaveBeenCalled();

    await user.tab();

    expect(onCommit).toHaveBeenCalledWith(
      "First line\nSecond line",
    );
  });

  it("does not commit when the value did not change", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();

    render(
      <EditableText
        value="Unchanged"
        onCommit={onCommit}
        ariaLabel="Title"
        placeholder="Enter a title"
        maxLength={200}
      />,
    );

    const input = screen.getByRole("textbox", {
      name: "Title",
    });

    await user.click(input);
    await user.tab();

    expect(onCommit).not.toHaveBeenCalled();
  });
});