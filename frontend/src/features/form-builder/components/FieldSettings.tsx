/**
 * display a setting window for one form field
 */

import { useEffect } from "react";
import type {
  FormField,
} from "../builder-types";
import { createDropdownOption } from "../field-defaults";
import {
  MAX_DROPDOWN_OPTIONS,
  MAX_OPTION_LABEL_LENGTH,
  MAX_PLACEHOLDER_LENGTH,
  MAX_TEXT_VALUE_LENGTH,
} from "../limits";

type FieldSettingsProps = {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onClose: () => void;
};

// convert input text to numbers since HMTL input gives react string
function toOptionalNumber(value: string) {
  if (value.trim() === "") {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function FieldSettings({
  field,
  onUpdate,
  onClose,
}: FieldSettingsProps) {
  // exit with esc
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const inputClass =
    "w-full rounded-xl border border-default bg-surface-secondary " +
    "px-3 py-2 text-sm text-foreground outline-none " +
    "focus:border-accent";

  const labelClass =
    "grid gap-1.5 text-sm font-medium text-foreground";

  return (
    // modal window
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-[10vh] backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-default bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="field-settings-title"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <header className="flex items-center justify-between border-b border-default px-5 py-4">
          <div>
            <h2
              id="field-settings-title"
              className="font-semibold text-foreground"
            >
              Field settings
            </h2>

            <p className="text-sm text-muted">
              {field.label}
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm hover:bg-surface-secondary"
            aria-label="Close field settings"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <div className="grid gap-5 p-5">
          {(field.type === "short-text" ||
            field.type === "long-text") && (
            <>
              <label className={labelClass}>
                Placeholder
                <input
                  className={inputClass}
                  value={field.placeholder ?? ""}
                  maxLength={MAX_PLACEHOLDER_LENGTH}
                  onChange={(event) => {
                    onUpdate({
                      ...field,
                      placeholder: event.target.value || undefined,
                    });
                  }}
                />
              </label>

              <label className={labelClass}>
                Default value
                {field.type === "long-text" ? (
                  <textarea
                    className={`${inputClass} min-h-24 resize-y`}
                    value={field.defaultValue ?? ""}
                    maxLength={MAX_TEXT_VALUE_LENGTH}
                    onChange={(event) => {
                      onUpdate({
                        ...field,
                        defaultValue: event.target.value || undefined,
                      });
                    }}
                  />
                ) : (
                  <input
                    className={inputClass}
                    value={field.defaultValue ?? ""}
                    maxLength={MAX_TEXT_VALUE_LENGTH}
                    onChange={(event) => {
                      onUpdate({
                        ...field,
                        defaultValue: event.target.value || undefined,
                      });
                    }}
                  />
                )}
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className={labelClass}>
                  Minimum length
                  <input
                    type="number"
                    min={0}
                    max={MAX_TEXT_VALUE_LENGTH}
                    className={inputClass}
                    value={field.minLength ?? ""}
                    onChange={(event) => {
                      onUpdate({
                        ...field,
                        minLength: toOptionalNumber(
                          event.target.value,
                        ),
                      });
                    }}
                  />
                </label>

                <label className={labelClass}>
                  Maximum length
                  <input
                    type="number"
                    min={0}
                    max={MAX_TEXT_VALUE_LENGTH}
                    className={inputClass}
                    value={field.maxLength ?? ""}
                    onChange={(event) => {
                      onUpdate({
                        ...field,
                        maxLength: toOptionalNumber(
                          event.target.value,
                        ),
                      });
                    }}
                  />
                </label>
              </div>
            </>
          )}

          {field.type === "number" && (
            <>
              <label className={labelClass}>
                Placeholder
                <input
                  className={inputClass}
                  value={field.placeholder ?? ""}
                  maxLength={MAX_PLACEHOLDER_LENGTH}
                  onChange={(event) => {
                    onUpdate({
                      ...field,
                      placeholder:
                        event.target.value || undefined,
                    });
                  }}
                />
              </label>

              <label className={labelClass}>
                Default value
                <input
                  type="number"
                  className={inputClass}
                  value={field.defaultValue ?? ""}
                  onChange={(event) => {
                    onUpdate({
                      ...field,
                      defaultValue: toOptionalNumber(
                        event.target.value,
                      ),
                    });
                  }}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className={labelClass}>
                  Minimum value
                  <input
                    type="number"
                    className={inputClass}
                    value={field.min ?? ""}
                    onChange={(event) => {
                      onUpdate({
                        ...field,
                        min: toOptionalNumber(
                          event.target.value,
                        ),
                      });
                    }}
                  />
                </label>

                <label className={labelClass}>
                  Maximum value
                  <input
                    type="number"
                    className={inputClass}
                    value={field.max ?? ""}
                    onChange={(event) => {
                      onUpdate({
                        ...field,
                        max: toOptionalNumber(
                          event.target.value,
                        ),
                      });
                    }}
                  />
                </label>
              </div>
            </>
          )}

          {field.type === "date" && (
            <label className={labelClass}>
              Default date
              <input
                type="date"
                className={inputClass}
                value={field.defaultValue ?? ""}
                onChange={(event) => {
                  onUpdate({
                    ...field,
                    defaultValue:
                      event.target.value || undefined,
                  });
                }}
              />
            </label>
          )}

          {field.type === "dropdown" && (
            <>
              <label className={labelClass}>
                Placeholder
                <input
                  className={inputClass}
                  value={field.placeholder ?? ""}
                  maxLength={MAX_PLACEHOLDER_LENGTH}
                  onChange={(event) => {
                    onUpdate({
                      ...field,
                      placeholder:
                        event.target.value || undefined,
                    });
                  }}
                />
              </label>

              <label className={labelClass}>
                Default option
                <select
                  className={inputClass}
                  value={field.defaultValue ?? ""}
                  onChange={(event) => {
                    onUpdate({
                      ...field,
                      defaultValue:
                        event.target.value || undefined,
                    });
                  }}
                >
                  <option value="">No default</option>
                  {/* render dropdown options */}
                  {field.options.map((option) => (
                    <option
                      key={option.id}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Options
                  </h3>

                  <span className="text-xs text-muted">
                    {field.options.length}/
                    {MAX_DROPDOWN_OPTIONS}
                  </span>
                </div>

                <div className="grid gap-2">
                  {field.options.map((option, index) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-2"
                    >
                      <input
                        className={inputClass}
                        aria-label={`Option ${index + 1} label`}
                        value={option.label}
                        maxLength={MAX_OPTION_LABEL_LENGTH}
                        onChange={(event) => {
                          // if its edited option, return updated copy
                          // otherwise, return exisiting option
                          const options =
                            field.options.map(
                              (currentOption) =>
                                currentOption.id === option.id
                                  ? {
                                      ...currentOption,
                                      label: event.target.value,
                                    }
                                  : currentOption,
                            );

                          onUpdate({
                            ...field,
                            options,
                          });
                        }}
                      />

                      <button
                        type="button"
                        className="rounded-lg px-2 py-2 text-sm hover:bg-surface-secondary disabled:opacity-40"
                        aria-label={`Move option ${index + 1} up`}
                        disabled={index === 0}
                        onClick={() => {
                          const options = [...field.options];

                          [
                            options[index - 1],
                            options[index],
                          ] = [
                            options[index],
                            options[index - 1],
                          ];

                          onUpdate({
                            ...field,
                            options,
                          });
                        }}
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        className="rounded-lg px-2 py-2 text-sm hover:bg-surface-secondary disabled:opacity-40"
                        aria-label={`Move option ${index + 1} down`}
                        disabled={
                          index === field.options.length - 1
                        }
                        onClick={() => {
                          const options = [...field.options];

                          [
                            options[index],
                            options[index + 1],
                          ] = [
                            options[index + 1],
                            options[index],
                          ];

                          onUpdate({
                            ...field,
                            options,
                          });
                        }}
                      >
                        ↓
                      </button>

                      <button
                        type="button"
                        className="rounded-lg px-2 py-2 text-sm text-danger hover:bg-surface-secondary disabled:opacity-40"
                        aria-label={`Remove option ${index + 1}`}
                        disabled={field.options.length === 1}
                        onClick={() => {
                          onUpdate({
                            ...field,
                            defaultValue:
                              field.defaultValue ===
                              option.value
                                ? undefined
                                : field.defaultValue,
                            options: field.options.filter(
                              (currentOption) =>
                                currentOption.id !==
                                option.id,
                            ),
                          });
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-3 rounded-lg border border-default px-3 py-2 text-sm font-medium hover:bg-surface-secondary disabled:opacity-40"
                  disabled={
                    field.options.length >=
                    MAX_DROPDOWN_OPTIONS
                  }
                  onClick={() => {
                    onUpdate({
                      ...field,
                      options: [
                        ...field.options,
                        createDropdownOption(
                          `Option ${field.options.length + 1}`,
                        ),
                      ],
                    });
                  }}
                >
                  Add option
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}