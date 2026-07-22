import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type {
  FormDocument,
  ShortTextField,
} from "../../features/form-builder";
import { FormEditor } from "../../features/form-builder/components/FormEditor";

const shortTextField: ShortTextField = {
  id: "field-1",
  type: "short-text",
  label: "Name",
  description: "Enter your full name",
  required: true,
  placeholder: "Your name",
};

const emptyForm: FormDocument = {
  title: "Registration",
  description: "Complete this form",
  fields: [],
};

const formWithField: FormDocument = {
  ...emptyForm,
  fields: [shortTextField],
};

describe("FormEditor", () => {
  it("renders the empty state", () => {
    render(
      <FormEditor
        form={emptyForm}
        dispatch={vi.fn()}
        selectedFieldId={null}
        focusFieldId={null}
        onSelectField={vi.fn()}
        onRequestInsert={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("textbox", {
        name: "Form title",
      }),
    ).toHaveValue("Registration");

    expect(
      screen.getByText("No fields yet"),
    ).toBeInTheDocument();
  });

  it("dispatches a title update after editing", async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();

    render(
      <FormEditor
        form={emptyForm}
        dispatch={dispatch}
        selectedFieldId={null}
        focusFieldId={null}
        onSelectField={vi.fn()}
        onRequestInsert={vi.fn()}
      />,
    );

    const title = screen.getByRole("textbox", {
      name: "Form title",
    });

    await user.clear(title);
    await user.type(title, "Contact form");
    await user.tab();

    expect(dispatch).toHaveBeenCalledWith({
      type: "form/setTitle",
      title: "Contact form",
    });
  });

  it("notifies the parent when a field is selected", async () => {
    const user = userEvent.setup();
    const onSelectField = vi.fn();

    render(
      <FormEditor
        form={formWithField}
        dispatch={vi.fn()}
        selectedFieldId={null}
        focusFieldId={null}
        onSelectField={onSelectField}
        onRequestInsert={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("textbox", {
        name: "Field 1 label",
      }),
    );

    expect(onSelectField).toHaveBeenCalledWith("field-1");
  });

  it("dispatches the complete field after editing its label", async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();

    render(
      <FormEditor
        form={formWithField}
        dispatch={dispatch}
        selectedFieldId="field-1"
        focusFieldId={null}
        onSelectField={vi.fn()}
        onRequestInsert={vi.fn()}
      />,
    );

    const label = screen.getByRole("textbox", {
      name: "Field 1 label",
    });

    await user.clear(label);
    await user.type(label, "Full name");
    await user.tab();

    expect(dispatch).toHaveBeenCalledWith({
      type: "field/update",
      field: {
        ...shortTextField,
        label: "Full name",
      },
    });
  });

  it("marks the selected field block", () => {
    render(
      <FormEditor
        form={formWithField}
        dispatch={vi.fn()}
        selectedFieldId="field-1"
        focusFieldId={null}
        onSelectField={vi.fn()}
        onRequestInsert={vi.fn()}
      />,
    );

    const label = screen.getByRole("textbox", {
      name: "Field 1 label",
    });

    expect(label.closest("article")).toHaveAttribute(
      "data-selected",
      "true",
    );
  });

  it("shows the required marker", () => {
    render(
      <FormEditor
        form={formWithField}
        dispatch={vi.fn()}
        selectedFieldId={null}
        focusFieldId={null}
        onSelectField={vi.fn()}
        onRequestInsert={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText("Required"),
    ).toBeInTheDocument();
  });
});