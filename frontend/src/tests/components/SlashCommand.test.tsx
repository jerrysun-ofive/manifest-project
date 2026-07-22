import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type {
  FieldType,
  FormField,
} from "../../features/form-builder";
import { SlashCommandMenu } from "../../features/form-builder/components/SlashCommandMenu";
import { useSlashCommand } from "../../features/form-builder/hooks/useSlashCommand";

type SlashCommandHarnessProps = {
  fields?: FormField[];
  selectedFieldId?: string | null;
  onInsert: (
    fieldType: FieldType,
    index: number,
  ) => void;
};

function SlashCommandHarness({
  fields = [],
  selectedFieldId = null,
  onInsert,
}: SlashCommandHarnessProps) {
  const slashCommand = useSlashCommand({
    fields,
    selectedFieldId,
    onInsert,
  });

  return (
    <div>
      <button type="button">
        Background control
      </button>

      <input
        type="text"
        aria-label="Existing editor"
      />

      <button
        type="button"
        onClick={() => {
          slashCommand.openAtIndex(fields.length);
        }}
      >
        Open menu
      </button>

      {slashCommand.isOpen && (
        <SlashCommandMenu
          query={slashCommand.query}
          commands={slashCommand.filteredCommands}
          activeIndex={slashCommand.activeIndex}
          insertionIndex={slashCommand.insertionIndex}
          onQueryChange={slashCommand.setQuery}
          onActiveIndexChange={
            slashCommand.setActiveIndex
          }
          onSearchKeyDown={
            slashCommand.handleSearchKeyDown
          }
          onSelect={slashCommand.selectCommand}
          onClose={() => slashCommand.close()}
        />
      )}
    </div>
  );
}

const fields: FormField[] = [
  {
    id: "first-field",
    type: "short-text",
    label: "First field",
    required: false,
  },
  {
    id: "second-field",
    type: "date",
    label: "Second field",
    required: false,
  },
];

describe("slash commands", () => {
  it("opens with / and inserts after the selected field", async () => {
    const user = userEvent.setup();
    const onInsert = vi.fn();

    render(
      <SlashCommandHarness
        fields={fields}
        selectedFieldId="first-field"
        onInsert={onInsert}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Background control",
      }),
    );

    await user.keyboard("/");

    expect(
      screen.getByRole("dialog", {
        name: "Insert a field",
      }),
    ).toBeInTheDocument();

    // array index 1 should be displayed to users as position 2
    expect(
      screen.getByText("Insert at position 2"),
    ).toBeInTheDocument();

    await user.keyboard("{Enter}");

    expect(onInsert).toHaveBeenCalledWith(
      "short-text",
      1,
    );
  });

  it("does not open when / is typed in an input", async () => {
    const user = userEvent.setup();

    render(
      <SlashCommandHarness onInsert={vi.fn()} />,
    );

    const input = screen.getByRole("textbox", {
      name: "Existing editor",
    });

    await user.click(input);
    await user.type(input, "/");

    expect(input).toHaveValue("/");

    expect(
      screen.queryByRole("dialog", {
        name: "Insert a field",
      }),
    ).not.toBeInTheDocument();
  });

  it("filters commands using labels and keywords", async () => {
    const user = userEvent.setup();

    render(
      <SlashCommandHarness onInsert={vi.fn()} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Open menu",
      }),
    );

    const search = screen.getByRole("textbox", {
      name: "Search field types",
    });

    // "calendar" is a keyword for the date command
    await user.type(search, "calendar");

    expect(
      screen.getByRole("option", {
        name: /date/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("option", {
        name: /short text/i,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getAllByRole("option"),
    ).toHaveLength(1);
  });

  it("selects the filtered command with Enter", async () => {
    const user = userEvent.setup();
    const onInsert = vi.fn();

    render(
      <SlashCommandHarness onInsert={onInsert} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Open menu",
      }),
    );

    await user.type(
      screen.getByRole("textbox", {
        name: "Search field types",
      }),
      "calendar",
    );

    await user.keyboard("{Enter}");

    expect(onInsert).toHaveBeenCalledWith(
      "date",
      0,
    );

    expect(
      screen.queryByRole("dialog", {
        name: "Insert a field",
      }),
    ).not.toBeInTheDocument();
  });

  it("changes the active command with ArrowDown", async () => {
    const user = userEvent.setup();
    const onInsert = vi.fn();

    render(
      <SlashCommandHarness onInsert={onInsert} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Open menu",
      }),
    );

    // short text starts active. One arrow down should then selects long text
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onInsert).toHaveBeenCalledWith(
      "long-text",
      0,
    );
  });

  it("wraps from the first command to the last", async () => {
    const user = userEvent.setup();
    const onInsert = vi.fn();

    render(
      <SlashCommandHarness onInsert={onInsert} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Open menu",
      }),
    );

    // arrow up from the first item wraps to Dropdown
    await user.keyboard("{ArrowUp}{Enter}");

    expect(onInsert).toHaveBeenCalledWith(
      "dropdown",
      0,
    );
  });

  it("supports mouse command selection", async () => {
    const user = userEvent.setup();
    const onInsert = vi.fn();

    render(
      <SlashCommandHarness onInsert={onInsert} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Open menu",
      }),
    );

    await user.click(
      screen.getByRole("option", {
        name: /number/i,
      }),
    );

    expect(onInsert).toHaveBeenCalledWith(
      "number",
      0,
    );
  });

  it("closes with Escape and restores focus", async () => {
    const user = userEvent.setup();

    render(
      <SlashCommandHarness onInsert={vi.fn()} />,
    );

    const openButton = screen.getByRole("button", {
      name: "Open menu",
    });

    await user.click(openButton);

    expect(
      screen.getByRole("textbox", {
        name: "Search field types",
      }),
    ).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("dialog", {
        name: "Insert a field",
      }),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(openButton).toHaveFocus();
    });
  });

  it("shows an empty result when nothing matches", async () => {
    const user = userEvent.setup();

    render(
      <SlashCommandHarness onInsert={vi.fn()} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Open menu",
      }),
    );

    await user.type(
      screen.getByRole("textbox", {
        name: "Search field types",
      }),
      "unsupported field",
    );

    expect(
      screen.getByText("No field types found"),
    ).toBeInTheDocument();

    expect(
      screen.queryAllByRole("option"),
    ).toHaveLength(0);
  });
});