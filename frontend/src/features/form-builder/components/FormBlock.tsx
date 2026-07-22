import type { FormField } from "../builder-types";
import { EditableText } from "./EditableText";
import { FieldRenderer } from "./fields/FieldRenderer";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_LABEL_LENGTH,
} from "../limits";
import { useState } from "react";
import { ContextualToolbar } from "./ContextualToolbar";
import { FieldSettings } from "./FieldSettings";

type FormBlockProps = {
  field: FormField;
  index: number;
  selected: boolean;
  shouldAutoFocus: boolean;
  canDuplicate: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: (fieldId: string) => void;
  onUpdate: (field: FormField) => void;
  onDuplicate: (fieldId: string) => void;
  onMoveUp: (fieldId: string) => void;
  onMoveDown: (fieldId: string) => void;
  onDelete: (fieldId: string) => void;
};

export function FormBlock({
  field,
  index, // position in form
  selected, // if this current block is selected
  shouldAutoFocus,
  canDuplicate,
  canMoveUp,
  canMoveDown,
  onSelect, // tells parent which field was selected
  onUpdate, // sends update field to parent 
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: FormBlockProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const blockClasses = [
    "rounded-2xl border p-5",
    "transition-all duration-150",
    "focus-visible:outline-none",
    selected
      ? "border-transparent bg-accent/5"
      : "border-transparent hover:border-default hover:bg-surface-secondary",
  ].join(" ");

return (
  <>
    <article
      className={blockClasses}
      data-selected={selected}
      tabIndex={0}
      onClick={() => onSelect(field.id)}
      onFocus={() => onSelect(field.id)}
    >
      {selected && (
        <ContextualToolbar
          required={field.required}
          canDuplicate={canDuplicate}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          onToggleRequired={() => {
            onUpdate({
              ...field,
              required: !field.required,
            });
          }}
          onDuplicate={() => {
            onDuplicate(field.id);
          }}
          onMoveUp={() => {
            onMoveUp(field.id);
          }}
          onMoveDown={() => {
            onMoveDown(field.id);
          }}
          onDelete={() => {
            onDelete(field.id);
          }}
          onOpenSettings={() => {
            setSettingsOpen(true);
          }}
        />
      )}

      <div className="flex items-start gap-2">
        <span
          className="mt-2 shrink-0 text-xs text-muted"
          aria-hidden="true"
        >
          {index + 1}
        </span>
        
        {/* handle change title */}
        <h2 className="min-w-0 flex-1">
          <EditableText
            autoFocus={shouldAutoFocus}
            value={field.label}
            ariaLabel={`Field ${index + 1} label`}
            placeholder="Untitled question"
            maxLength={MAX_LABEL_LENGTH}
            className="text-lg font-semibold"
            onCommit={(label) => {
              onUpdate({ ...field, label });
            }}
          />
      </h2>

        {/* if required is selected, show an astrics */}
        {field.required && (
          <span
            className="mt-1 font-bold text-danger"
            aria-label="Required"
          >
            *
          </span>
        )}
      </div>
      
      {/* handle change description */}
      {/* multiline  changes to textarea */}
      <div className="ml-5 mt-1">
        <EditableText
          value={field.description ?? ""}
          ariaLabel={`Field ${index + 1} description`}
          placeholder="Add a description"
          maxLength={MAX_DESCRIPTION_LENGTH}
          multiline
          className="text-sm text-muted"
          onCommit={(description) => {
            onUpdate({
              ...field,
              description: description || undefined,
            });
          }}
        />
      </div>
      
      <div className="ml-5 mt-4">
        <FieldRenderer field={field} />
      </div>
    </article>

    {settingsOpen && (
      <FieldSettings
        field={field}
        onUpdate={onUpdate}
        onClose={() => {
          setSettingsOpen(false);
        }}
      />
    )}
  </>
  );
}