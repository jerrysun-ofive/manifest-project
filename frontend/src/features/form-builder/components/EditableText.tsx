import { Input, TextArea } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import type {
  ChangeEvent,
  KeyboardEvent,
} from "react";

type EditableTextProps = {
  value: string;
  // called with the new text when the user finishes editing
  onCommit: (value: string) => void; 
  ariaLabel: string;
  placeholder: string;
  maxLength: number;
  multiline?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function EditableText({
  value,
  onCommit, // updates the actual reducer state after blur or entry
  ariaLabel, // accessibility (screen reader) element
  placeholder,
  maxLength,
  multiline = false,
  className = "",
  autoFocus = false,
}: EditableTextProps) {
  // stores unfinihsed typing locally
  const [draft, setDraft] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const isCancelling = useRef(false);

  useEffect(() => {
    if (!isEditing) {
      setDraft(value);
    }
  }, [isEditing, value]);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setDraft(event.target.value);
  }

  // when user clicks away
  function handleBlur() {
    setIsEditing(false);
    
    if (isCancelling.current) {
      isCancelling.current = false;
      setDraft(value);
      
      return;
    }
    
    // if user cancelled and changed text, pass it to parent
    if (draft !== value) {
      onCommit(draft);
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    // restores the original value, marks the edit as cancelled.
    // removes focus, and prevents onCommit from being called.
    if (event.key === "Escape") {
      event.preventDefault();
      isCancelling.current = true;
      setDraft(value);
      event.currentTarget.blur();
      return;
    }
    
    // single line input
    if (event.key === "Enter" && !multiline) {
      event.preventDefault();
      event.currentTarget.blur();
    }
  }

  const sharedClasses  = [
    "w-full bg-transparent shadow-none",
    "transition-colors",
    className,
  ].join(" ");

  if (multiline) {
    return (
      <TextArea
        autoFocus={autoFocus}
        value={draft}
        aria-label={ariaLabel}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={2}
        variant="secondary"
        className={sharedClasses}
        onFocus={() => setIsEditing(true)}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    );
  }
  return (
    <Input
      autoFocus={autoFocus}
      type="text"
      value={draft}
      aria-label={ariaLabel}
      placeholder={placeholder}
      maxLength={maxLength}
      variant="secondary"
      className={sharedClasses}
      onFocus={() => setIsEditing(true)}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}