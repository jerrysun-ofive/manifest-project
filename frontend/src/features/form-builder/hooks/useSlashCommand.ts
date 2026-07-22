/**
 * custom hook to handle logic for slash command
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type {
  FieldType,
  FormField,
} from "../builder-types";
import {
  SLASH_COMMANDS,
} from "../slash-commands";
import type {
  SlashCommand,
} from "../slash-commands";

type UseSlashCommandOptions = {
  fields: FormField[]; // all current form fields
  selectedFieldId: string | null;
  onInsert: (
    fieldType: FieldType,
    index: number,
  ) => void; // insert new field
};

export function useSlashCommand({
  fields,
  selectedFieldId,
  onInsert,
}: UseSlashCommandOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [insertionIndex, setInsertionIndex] = useState(0); // where the new field is inserted

  const previouslyFocusedElement =
    useRef<HTMLElement | null>(null);

  // if a field is selected, insert the new field immediately after it
  // useMemo remembers the calcuated result until fields or selectedFieldId changes
  // this prevents the need to recalcualte the values when the values haven't changed
  const defaultInsertionIndex = useMemo(() => {
    if (selectedFieldId === null) {
      return fields.length;
    }

    const selectedIndex = fields.findIndex(
      (field) => field.id === selectedFieldId,
    );

    if (selectedIndex === -1) {
      return fields.length;
    }

    return selectedIndex + 1;
  }, [fields, selectedFieldId]);

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery === "") {
      return SLASH_COMMANDS;
    }

    // combines each commands label, description, and keywords 
    // then search that combined text
    return SLASH_COMMANDS.filter((command) => {
      const searchableText = [
        command.label,
        command.description,
        ...command.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [query]);

  // function for opening the menu at a insert position
  const openAtIndex = useCallback(
    (index: number) => {
      previouslyFocusedElement.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      // limit value between 0 and fields.length
      const safeIndex = Math.max(
        0,
        Math.min(index, fields.length),
      );

      setInsertionIndex(safeIndex);
      setQuery("");
      setActiveIndex(0);
      setIsOpen(true);
    },
    [fields.length],
  );

  // closes the menu
  // close() restores focus
  // close(false) closes it without restoring focus
  const close = useCallback(
    (restoreFocus = true) => {
      setIsOpen(false);
      setQuery("");
      setActiveIndex(0);
      
      // use requestAnimationFrame to wait until the browers next rendering opportunity
      // this give the menu time to dissappear before focus is restored
      if (restoreFocus) {
        requestAnimationFrame(() => {
          previouslyFocusedElement.current?.focus();
        });
      }
    },
    [],
  );

  const selectCommand = useCallback(
    (command: SlashCommand) => {
      onInsert(command.type, insertionIndex);

      // the new field label will receive focus instead
      close(false);
    },
    [close, insertionIndex, onInsert],
  );

  function handleSearchKeyDown(
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (filteredCommands.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex((currentIndex) => (
        (currentIndex + 1) % filteredCommands.length
      ));

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((currentIndex) => (
        currentIndex === 0
          ? filteredCommands.length - 1
          : currentIndex - 1
      ));

      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(filteredCommands.length - 1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const activeCommand =
        filteredCommands[activeIndex];

      if (activeCommand) {
        selectCommand(activeCommand);
      }
    }
  }

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (
      filteredCommands.length > 0 &&
      activeIndex >= filteredCommands.length
    ) {
      setActiveIndex(0);
    }
  }, [activeIndex, filteredCommands.length]);

  useEffect(() => {
    function handleGlobalKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key !== "/" || isOpen) {
        return;
      }

      const target = event.target;

      if (target instanceof HTMLElement) {
        const isEditingText =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable;

        if (isEditingText) {
          return;
        }
      }

      event.preventDefault();
      openAtIndex(defaultInsertionIndex);
    }

    window.addEventListener(
      "keydown",
      handleGlobalKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleGlobalKeyDown,
      );
    };
  }, [
    defaultInsertionIndex,
    isOpen,
    openAtIndex,
  ]);

  return {
    isOpen,
    query,
    activeIndex,
    insertionIndex,
    filteredCommands,
    setQuery,
    setActiveIndex,
    openAtIndex,
    close,
    selectCommand,
    handleSearchKeyDown,
  };
}