import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  useState,
} from "react";
import {
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type {
  DateField,
  DropdownField,
  FormField,
  LongTextField,
  NumberField,
  ShortTextField,
} from "../../features/form-builder";
import {
  MAX_DROPDOWN_OPTIONS,
} from "../../features/form-builder";
import { FieldSettings } from "../../features/form-builder/components/FieldSettings";

const shortTextField: ShortTextField = {
  id: "short-field",
  type: "short-text",
  label: "Name",
  required: false,
  placeholder: "Enter your name",
  defaultValue: "Jane",
  minLength: 2,
  maxLength: 50,
};

const longTextField: LongTextField = {
  id: "long-field",
  type: "long-text",
  label: "Biography",
  required: false,
  placeholder: "Tell us about yourself",
  defaultValue: "My biography",
};

const numberField: NumberField = {
  id: "number-field",
  type: "number",
  label: "Age",
  required: false,
  placeholder: "Enter your age",
  defaultValue: 21,
  min: 18,
  max: 100,
};

const dateField: DateField = {
  id: "date-field",
  type: "date",
  label: "Birth date",
  required: false,
  defaultValue: "2000-01-01",
};

const dropdownField: DropdownField = {
  id: "dropdown-field",
  type: "dropdown",
  label: "Country",
  required: false,
  placeholder: "Select a country",
  defaultValue: "australia",
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
    {
      id: "option-3",
      label: "Japan",
      value: "japan",
    },
  ],
};

function renderSettings(initialField: FormField) {
  const onUpdate = vi.fn();
  const onClose = vi.fn();

  function SettingsHarness() {
    const [field, setField] =
      useState<FormField>(initialField);

    return (
      <FieldSettings
        field={field}
        onUpdate={(updatedField) => {
          setField(updatedField);
          onUpdate(updatedField);
        }}
        onClose={onClose}
      />
    );
  }

  render(<SettingsHarness />);

  return {
    onUpdate,
    onClose,
  };
}

function getLastUpdatedField(
  onUpdate: ReturnType<typeof vi.fn>,
) {
  const calls = onUpdate.mock.calls;

  return calls[calls.length - 1]?.[0] as
    | FormField
    | undefined;
}

describe("FieldSettings", () => {
  it("shows short text settings", () => {
    renderSettings(shortTextField);

    expect(
      screen.getByLabelText("Placeholder"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Default value"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Minimum length"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Maximum length"),
    ).toBeInTheDocument();

    expect(
      screen.queryByLabelText("Minimum value"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Options"),
    ).not.toBeInTheDocument();
  });

  it("uses a textarea for a long-text default value", () => {
    renderSettings(longTextField);

    expect(
      screen.getByLabelText("Default value").tagName,
    ).toBe("TEXTAREA");
  });

  it("shows only number-specific settings for a number field", () => {
    renderSettings(numberField);

    expect(
      screen.getByLabelText("Minimum value"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Maximum value"),
    ).toBeInTheDocument();

    expect(
      screen.queryByLabelText("Minimum length"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Options"),
    ).not.toBeInTheDocument();
  });

  it("shows only a default date setting for a date field", () => {
    renderSettings(dateField);

    expect(
      screen.getByLabelText("Default date"),
    ).toBeInTheDocument();

    expect(
      screen.queryByLabelText("Placeholder"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText("Default value"),
    ).not.toBeInTheDocument();
  });

  it("updates short-text settings", () => {
    const { onUpdate } =
      renderSettings(shortTextField);

    fireEvent.change(
      screen.getByLabelText("Placeholder"),
      {
        target: {
          value: "Your full name",
        },
      },
    );

    expect(getLastUpdatedField(onUpdate)).toEqual({
      ...shortTextField,
      placeholder: "Your full name",
    });

    fireEvent.change(
      screen.getByLabelText("Minimum length"),
      {
        target: {
          value: "5",
        },
      },
    );

    expect(getLastUpdatedField(onUpdate)).toEqual({
      ...shortTextField,
      placeholder: "Your full name",
      minLength: 5,
    });

    fireEvent.change(
      screen.getByLabelText("Maximum length"),
      {
        target: {
          value: "80",
        },
      },
    );

    expect(getLastUpdatedField(onUpdate)).toEqual({
      ...shortTextField,
      placeholder: "Your full name",
      minLength: 5,
      maxLength: 80,
    });
  });

  it("converts number input strings to numbers", () => {
    const { onUpdate } =
      renderSettings(numberField);

    fireEvent.change(
      screen.getByLabelText("Default value"),
      {
        target: {
          value: "25",
        },
      },
    );

    expect(getLastUpdatedField(onUpdate)).toEqual({
      ...numberField,
      defaultValue: 25,
    });

    fireEvent.change(
      screen.getByLabelText("Minimum value"),
      {
        target: {
          value: "20",
        },
      },
    );

    expect(getLastUpdatedField(onUpdate)).toEqual({
      ...numberField,
      defaultValue: 25,
      min: 20,
    });
  });

  it("turns cleared number settings into undefined", () => {
    const { onUpdate } =
      renderSettings(numberField);

    fireEvent.change(
      screen.getByLabelText("Minimum value"),
      {
        target: {
          value: "",
        },
      },
    );

    expect(getLastUpdatedField(onUpdate)).toEqual({
      ...numberField,
      min: undefined,
    });
  });

  it("updates the default date", () => {
    const { onUpdate } =
      renderSettings(dateField);

    fireEvent.change(
      screen.getByLabelText("Default date"),
      {
        target: {
          value: "2026-07-22",
        },
      },
    );

    expect(getLastUpdatedField(onUpdate)).toEqual({
      ...dateField,
      defaultValue: "2026-07-22",
    });
  });

  it("adds a dropdown option", async () => {
    const user = userEvent.setup();
    const { onUpdate } =
      renderSettings(dropdownField);

    await user.click(
      screen.getByRole("button", {
        name: "Add option",
      }),
    );

    const updatedField =
      getLastUpdatedField(onUpdate);

    expect(updatedField?.type).toBe("dropdown");

    if (updatedField?.type !== "dropdown") {
      throw new Error(
        "Expected an updated dropdown field",
      );
    }

    expect(updatedField.options).toHaveLength(4);
    expect(updatedField.options[3].label).toBe(
      "Option 4",
    );
  });

  it("edits a dropdown option label", () => {
    const { onUpdate } =
      renderSettings(dropdownField);

    fireEvent.change(
      screen.getByLabelText("Option 1 label"),
      {
        target: {
          value: "Australia and territories",
        },
      },
    );

    const updatedField =
      getLastUpdatedField(onUpdate);

    expect(updatedField?.type).toBe("dropdown");

    if (updatedField?.type !== "dropdown") {
      throw new Error(
        "Expected an updated dropdown field",
      );
    }

    expect(updatedField.options[0]).toEqual({
      ...dropdownField.options[0],
      label: "Australia and territories",
    });
  });

  it("moves a dropdown option down", async () => {
    const user = userEvent.setup();
    const { onUpdate } =
      renderSettings(dropdownField);

    await user.click(
      screen.getByRole("button", {
        name: "Move option 1 down",
      }),
    );

    const updatedField =
      getLastUpdatedField(onUpdate);

    expect(updatedField?.type).toBe("dropdown");

    if (updatedField?.type !== "dropdown") {
      throw new Error(
        "Expected an updated dropdown field",
      );
    }

    expect(
      updatedField.options.map(
        (option) => option.id,
      ),
    ).toEqual([
      "option-2",
      "option-1",
      "option-3",
    ]);
  });

  it("moves a dropdown option up", async () => {
    const user = userEvent.setup();
    const { onUpdate } =
      renderSettings(dropdownField);

    await user.click(
      screen.getByRole("button", {
        name: "Move option 2 up",
      }),
    );

    const updatedField =
      getLastUpdatedField(onUpdate);

    expect(updatedField?.type).toBe("dropdown");

    if (updatedField?.type !== "dropdown") {
      throw new Error(
        "Expected an updated dropdown field",
      );
    }

    expect(
      updatedField.options.map(
        (option) => option.id,
      ),
    ).toEqual([
      "option-2",
      "option-1",
      "option-3",
    ]);
  });

  it("removes a dropdown option", async () => {
    const user = userEvent.setup();
    const { onUpdate } =
      renderSettings(dropdownField);

    await user.click(
      screen.getByRole("button", {
        name: "Remove option 3",
      }),
    );

    const updatedField =
      getLastUpdatedField(onUpdate);

    expect(updatedField?.type).toBe("dropdown");

    if (updatedField?.type !== "dropdown") {
      throw new Error(
        "Expected an updated dropdown field",
      );
    }

    expect(
      updatedField.options.map(
        (option) => option.id,
      ),
    ).toEqual([
      "option-1",
      "option-2",
    ]);

    expect(updatedField.defaultValue).toBe(
      "australia",
    );
  });

  it("clears the default when its option is removed", async () => {
    const user = userEvent.setup();
    const { onUpdate } =
      renderSettings(dropdownField);

    await user.click(
      screen.getByRole("button", {
        name: "Remove option 1",
      }),
    );

    const updatedField =
      getLastUpdatedField(onUpdate);

    expect(updatedField?.type).toBe("dropdown");

    if (updatedField?.type !== "dropdown") {
      throw new Error(
        "Expected an updated dropdown field",
      );
    }

    expect(updatedField.defaultValue).toBeUndefined();

    expect(
      updatedField.options.map(
        (option) => option.id,
      ),
    ).toEqual([
      "option-2",
      "option-3",
    ]);
  });

  it("does not allow the final dropdown option to be removed", () => {
    renderSettings({
      ...dropdownField,
      defaultValue: undefined,
      options: [dropdownField.options[0]],
    });

    expect(
      screen.getByRole("button", {
        name: "Remove option 1",
      }),
    ).toBeDisabled();
  });

  it("disables adding options at the option limit", () => {
    const options = Array.from(
      { length: MAX_DROPDOWN_OPTIONS },
      (_, index) => ({
        id: `option-${index + 1}`,
        label: `Option ${index + 1}`,
        value: `option_${index + 1}`,
      }),
    );

    renderSettings({
      ...dropdownField,
      defaultValue: undefined,
      options,
    });

    expect(
      screen.getByRole("button", {
        name: "Add option",
      }),
    ).toBeDisabled();
  });

  it("changes the dropdown default option", () => {
    const { onUpdate } =
      renderSettings(dropdownField);

    fireEvent.change(
      screen.getByLabelText("Default option"),
      {
        target: {
          value: "japan",
        },
      },
    );

    expect(getLastUpdatedField(onUpdate)).toEqual({
      ...dropdownField,
      defaultValue: "japan",
    });
  });

  it("closes through the button, Escape, and backdrop", async () => {
    const user = userEvent.setup();
    const { onClose } =
      renderSettings(shortTextField);

    await user.click(
      screen.getByRole("button", {
        name: "Close field settings",
      }),
    );

    await user.keyboard("{Escape}");

    const dialog = screen.getByRole("dialog", {
      name: "Field settings",
    });

    if (!dialog.parentElement) {
      throw new Error(
        "Expected the dialog to have a backdrop",
      );
    }

    fireEvent.mouseDown(dialog.parentElement);

    expect(onClose).toHaveBeenCalledTimes(3);
  });
});