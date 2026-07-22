import {
  Button,
} from "@heroui/react";
import {
  useState,
} from "react";
import type {
  FormEvent,
} from "react";
import type {
  FormDocument,
  FormField,
} from "../builder-types";
import {
  validateFormAnswers,
} from "../field-validation";

type FormPreviewProps = {
  form: FormDocument;
};

function createInitialAnswers(
  fields: FormField[],
): Record<string, string> {
  return Object.fromEntries(
    fields.map((field) => [
      field.id,
      field.defaultValue ===
      undefined
        ? ""
        : String(field.defaultValue),
    ]),
  );
}

export function FormPreview({
  form,
}: FormPreviewProps) {
  const [
    answers,
    setAnswers,
  ] = useState<Record<string, string>>(
    () =>
      createInitialAnswers(
        form.fields,
      ),
  );

  const [
    errors,
    setErrors,
  ] = useState<
    Record<string, string>
  >({});

  const [
    isValid,
    setIsValid,
  ] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-default " +
    "bg-surface-secondary px-3 py-2 " +
    "text-foreground outline-none " +
    "focus:border-accent";

  function updateAnswer(
    fieldId: string,
    value: string,
  ) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [fieldId]: value,
    }));

    setErrors((currentErrors) => {
      const nextErrors = {
        ...currentErrors,
      };

      delete nextErrors[fieldId];

      return nextErrors;
    });

    setIsValid(false);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationErrors =
      validateFormAnswers(
        form.fields,
        answers,
      );

    setErrors(validationErrors);

    setIsValid(
      Object.keys(validationErrors)
        .length === 0,
    );
  }

  function renderInput(
    field: FormField,
  ) {
    const value =
      answers[field.id] ?? "";

    const hasError =
      Boolean(errors[field.id]);

    switch (field.type) {
      case "short-text":
        return (
          <input
            id={`preview-${field.id}`}
            type="text"
            className={inputClass}
            value={value}
            placeholder={
              field.placeholder
            }
            minLength={
              field.minLength
            }
            maxLength={
              field.maxLength
            }
            aria-invalid={
              hasError || undefined
            }
            aria-describedby={
              hasError
                ? `error-${field.id}`
                : undefined
            }
            onChange={(event) => {
              updateAnswer(
                field.id,
                event.target.value,
              );
            }}
          />
        );

      case "long-text":
        return (
          <textarea
            id={`preview-${field.id}`}
            className={`${inputClass} min-h-28 resize-y`}
            value={value}
            placeholder={
              field.placeholder
            }
            minLength={
              field.minLength
            }
            maxLength={
              field.maxLength
            }
            aria-invalid={
              hasError || undefined
            }
            aria-describedby={
              hasError
                ? `error-${field.id}`
                : undefined
            }
            onChange={(event) => {
              updateAnswer(
                field.id,
                event.target.value,
              );
            }}
          />
        );

      case "number":
        return (
          <input
            id={`preview-${field.id}`}
            type="number"
            className={inputClass}
            value={value}
            placeholder={
              field.placeholder
            }
            min={field.min}
            max={field.max}
            aria-invalid={
              hasError || undefined
            }
            aria-describedby={
              hasError
                ? `error-${field.id}`
                : undefined
            }
            onChange={(event) => {
              updateAnswer(
                field.id,
                event.target.value,
              );
            }}
          />
        );

      case "date":
        return (
          <input
            id={`preview-${field.id}`}
            type="date"
            className={inputClass}
            value={value}
            aria-invalid={
              hasError || undefined
            }
            aria-describedby={
              hasError
                ? `error-${field.id}`
                : undefined
            }
            onChange={(event) => {
              updateAnswer(
                field.id,
                event.target.value,
              );
            }}
          />
        );

      case "dropdown":
        return (
          <select
            id={`preview-${field.id}`}
            className={inputClass}
            value={value}
            aria-invalid={
              hasError || undefined
            }
            aria-describedby={
              hasError
                ? `error-${field.id}`
                : undefined
            }
            onChange={(event) => {
              updateAnswer(
                field.id,
                event.target.value,
              );
            }}
          >
            <option value="">
              {field.placeholder ||
                "Select an option"}
            </option>

            {field.options.map(
              (option) => (
                <option
                  key={option.id}
                  value={option.value}
                >
                  {option.label}
                </option>
              ),
            )}
          </select>
        );
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {form.title ||
            "Untitled form"}
        </h1>

        {form.description && (
          <p className="mt-3 text-muted">
            {form.description}
          </p>
        )}
      </header>

      <div className="grid gap-7">
        {form.fields.map(
          (field, index) => (
            <div key={field.id}>
              <label
                htmlFor={`preview-${field.id}`}
                className="mb-2 block font-semibold text-foreground"
              >
                <span className="mr-2 text-sm text-muted">
                  {index + 1}.
                </span>

                {field.label}

                {field.required && (
                  <span
                    className="ml-1 text-danger"
                    aria-label="Required"
                  >
                    *
                  </span>
                )}
              </label>

              {field.description && (
                <p className="mb-3 text-sm text-muted">
                  {field.description}
                </p>
              )}

              {renderInput(field)}

              {errors[field.id] && (
                <p
                  id={`error-${field.id}`}
                  className="mt-2 text-sm text-danger"
                >
                  {errors[field.id]}
                </p>
              )}
            </div>
          ),
        )}
      </div>

      {isValid && (
        <p
          role="status"
          className="mt-6 rounded-xl border border-default bg-surface-secondary px-4 py-3 text-sm"
        >
          All answers are valid.
        </p>
      )}

      <Button
        type="submit"
        className="mt-8"
      >
        Check response
      </Button>
    </form>
  );
}