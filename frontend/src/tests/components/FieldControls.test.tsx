import {
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type {
  FormDocument,
  ShortTextField,
  BuilderAction,
} from "../../features/form-builder";
import {
  MAX_FIELDS,
} from "../../features/form-builder";
import { FormEditor } from "../../features/form-builder/components/FormEditor";

const firstField: ShortTextField = {
  id: "field-1",
  type: "short-text",
  label: "First name",
  required: true,
  placeholder: "Enter your first name",
};

const secondField: ShortTextField = {
  id: "field-2",
  type: "short-text",
  label: "Last name",
  required: false,
  placeholder: "Enter your last name",
};

const form: FormDocument = {
  title: "Contact form",
  description: "Enter your details",
  fields: [
    firstField,
    secondField,
  ],
};

type RenderEditorOptions = {
  currentForm?: FormDocument;
  selectedFieldId?: string | null;
  dispatch?: ReturnType<
    typeof vi.fn<(action: BuilderAction) => void>
  >;
};

function renderEditor({
  currentForm = form,
  selectedFieldId = "field-1",
  dispatch = vi.fn(),
}: RenderEditorOptions = {}) {
  render(
    <FormEditor
      form={currentForm}
      dispatch={dispatch}
      selectedFieldId={selectedFieldId}
      focusFieldId={null}
      onSelectField={vi.fn()}
      onRequestInsert={vi.fn()}
    />,
  );

  return { dispatch };
}

describe("Field controls", () => {
  it("only shows the toolbar for the selected field", () => {
    const { rerender } = render(
      <FormEditor
        form={form}
        dispatch={vi.fn()}
        selectedFieldId={null}
        focusFieldId={null}
        onSelectField={vi.fn()}
        onRequestInsert={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("toolbar", {
        name: "Field controls",
      }),
    ).not.toBeInTheDocument();

    rerender(
      <FormEditor
        form={form}
        dispatch={vi.fn()}
        selectedFieldId="field-1"
        focusFieldId={null}
        onSelectField={vi.fn()}
        onRequestInsert={vi.fn()}
      />,
    );

    expect(
      screen.getAllByRole("toolbar", {
        name: "Field controls",
      }),
    ).toHaveLength(1);
  });

  it("dispatches a complete field update when required is toggled", async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();

    renderEditor({ dispatch });

    await user.click(
      screen.getByRole("button", {
        name: "Required",
      }),
    );

    expect(dispatch).toHaveBeenCalledWith({
      type: "field/update",
      field: {
        ...firstField,
        required: false,
      },
    });
  });

  it("dispatches duplicate", async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();

    renderEditor({ dispatch });

    await user.click(
      screen.getByRole("button", {
        name: "Duplicate",
      }),
    );

    expect(dispatch).toHaveBeenCalledWith({
      type: "field/duplicate",
      fieldId: "field-1",
    });
  });

  it("dispatches move down for the first field", async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();

    renderEditor({ dispatch });

    await user.click(
      screen.getByRole("button", {
        name: "Move field down",
      }),
    );

    expect(dispatch).toHaveBeenCalledWith({
      type: "field/moveDown",
      fieldId: "field-1",
    });
  });

  it("dispatches move up for the second field", async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();

    renderEditor({
      dispatch,
      selectedFieldId: "field-2",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Move field up",
      }),
    );

    expect(dispatch).toHaveBeenCalledWith({
      type: "field/moveUp",
      fieldId: "field-2",
    });
  });

  it("dispatches delete", async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();

    renderEditor({ dispatch });

    await user.click(
      screen.getByRole("button", {
        name: "Delete",
      }),
    );

    expect(dispatch).toHaveBeenCalledWith({
      type: "field/delete",
      fieldId: "field-1",
    });
  });

  it("disables move up for the first field", () => {
    renderEditor();

    expect(
      screen.getByRole("button", {
        name: "Move field up",
      }),
    ).toBeDisabled();
  });

  it("disables move down for the last field", () => {
    renderEditor({
      selectedFieldId: "field-2",
    });

    expect(
      screen.getByRole("button", {
        name: "Move field down",
      }),
    ).toBeDisabled();
  });

  it("disables duplicate when the form reaches the field limit", () => {
    const fields = Array.from(
      { length: MAX_FIELDS },
      (_, index): ShortTextField => ({
        ...firstField,
        id: `field-${index + 1}`,
        label: `Field ${index + 1}`,
      }),
    );

    renderEditor({
      currentForm: {
        ...form,
        fields,
      },
      selectedFieldId: "field-1",
    });

    expect(
      screen.getByRole("button", {
        name: "Duplicate",
      }),
    ).toBeDisabled();
  });

  it("opens field settings", async () => {
    const user = userEvent.setup();

    renderEditor();

    await user.click(
      screen.getByRole("button", {
        name: "Settings",
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: "Field settings",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("First name"),
    ).toBeInTheDocument();
  });
});