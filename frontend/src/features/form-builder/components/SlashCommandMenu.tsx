import { Input } from "@heroui/react";
import type {
  KeyboardEventHandler,
} from "react";
import type {
  SlashCommand,
} from "../slash-commands";

type SlashCommandMenuProps = {
  query: string;
  commands: SlashCommand[];
  activeIndex: number;
  insertionIndex: number;
  onQueryChange: (query: string) => void;
  onActiveIndexChange: (index: number) => void;
  onSearchKeyDown:
    KeyboardEventHandler<HTMLInputElement>;
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
};

export function SlashCommandMenu({
  query,
  commands,
  activeIndex,
  insertionIndex,
  onQueryChange,
  onActiveIndexChange,
  onSearchKeyDown,
  onSelect,
  onClose,
}: SlashCommandMenuProps) {
  const activeCommand = commands[activeIndex];

  return (
    // background behind menu
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-[15vh] backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      {/* command menu */}
      <section
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-default bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Insert a field"
        onMouseDown={(event) => {
          event.stopPropagation(); // prevent click inside bubbling up to outer overlay
        }}
      >
        <header className="border-b border-default p-4">
          <Input
            autoFocus // moves cursor into the search box when menu opens
            value={query}
            aria-label="Search field types"
            aria-controls="slash-command-results"
            aria-activedescendant={
              activeCommand
                ? `slash-command-${activeCommand.type}`
                : undefined
            }
            placeholder="Search field types..."
            variant="secondary"
            fullWidth
            onChange={(event) => {
              onQueryChange(event.target.value);
            }}
            onKeyDown={onSearchKeyDown}
          />

          <p className="mt-2 px-1 text-xs text-muted">
            Insert at position {insertionIndex + 1}
          </p>
        </header>

        <div
          id="slash-command-results"
          className="max-h-80 overflow-y-auto p-2"
          role="listbox"
          aria-label="Field types"
        >
          {commands.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="font-medium text-foreground">
                No field types found
              </p>

              <p className="mt-1 text-sm text-muted">
                Try searching for text, number, or date.
              </p>
            </div>
          ) : (
            commands.map((command, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  id={`slash-command-${command.type}`}
                  key={command.type}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={[
                    "flex w-full items-center gap-3",
                    "rounded-xl px-3 py-3 text-left",
                    "transition-colors",
                    isActive
                      ? "bg-accent/10 text-foreground"
                      : "text-foreground hover:bg-surface-secondary",
                  ].join(" ")}
                  onMouseMove={() => {
                    // when cursor over a command, that command becomes active
                    onActiveIndexChange(index);
                  }}
                  onMouseDown={(event) => {
                    // keeps focus on the search input
                    event.preventDefault();
                  }}
                  onClick={() => {
                    onSelect(command);
                  }}
                >
                  <span
                    className={[
                      "flex size-10 shrink-0",
                      "items-center justify-center",
                      "rounded-lg border border-default",
                      "bg-surface-secondary font-semibold",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    {command.symbol}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">
                      {command.label}
                    </span>

                    <span className="block truncate text-sm text-muted">
                      {command.description}
                    </span>
                  </span>

                  {isActive && (
                    <kbd className="rounded-md border border-default px-2 py-1 text-xs text-muted">
                      Enter
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        <footer className="flex items-center gap-4 border-t border-default px-4 py-3 text-xs text-muted">
          <span>↑↓ Navigate</span>
          <span>Enter Insert</span>
          <span>Esc Close</span>
        </footer>
      </section>
    </div>
  );
}