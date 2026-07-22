import {
  Button,
  Card,
} from "@heroui/react";
import {
  useCallback,
  useState,
} from "react";
import {
  createField,
  MAX_FIELDS,
  formDocumentSchema,
} from "../features/form-builder";
import type {
  FieldType,
} from "../features/form-builder";
import { FormEditor } from "../features/form-builder/components/FormEditor";
import { SlashCommandMenu } from "../features/form-builder/components/SlashCommandMenu";
import { useFormBuilder } from "../features/form-builder/hooks/useFormBuilder";
import { useSlashCommand } from "../features/form-builder/hooks/useSlashCommand";
import { FormPreview } from "../features/form-builder/components/FormPreview";

type PageMode = "build" | "preview"

export default function BuilderPage() {
  const { form, dispatch } = useFormBuilder();

  const [mode, setMode] = useState<PageMode>("build");
  const configResult = formDocumentSchema.safeParse(form);
  const configErrors =
  configResult.success
    ? []
    : configResult.error.issues.map(
        (issue) => ({
          path: issue.path
            .map(String)
            .join("."),
          message: issue.message,
        }),
      );

  const canPreview = configResult.success && form.fields.length > 0;

  const [
    selectedFieldId,
    setSelectedFieldId,
  ] = useState<string | null>(null);

  const [
    focusFieldId,
    setFocusFieldId,
  ] = useState<string | null>(null);

  const hasReachedFieldLimit =
    form.fields.length >= MAX_FIELDS;

  const insertField = useCallback(
    (
      fieldType: FieldType,
      index: number,
    ) => {
      const field = createField(fieldType);

      dispatch({
        type: "field/add",
        field,
        index,
      });

      setSelectedFieldId(field.id);
      setFocusFieldId(field.id);
    },
    [dispatch],
  );

  const slashCommand = useSlashCommand({
    fields: form.fields,
    selectedFieldId,
    onInsert: insertField,
  });

  return (
    <main className="min-h-screen bg-surface-secondary px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto mb-5 flex w-full max-w-3xl items-center justify-between">
        <div>
          <p className="font-medium text-foreground">
            {mode === "build"
              ? "Form builder"
              : "View form"}
          </p>

          <p className="text-sm text-muted">
            {mode === "build"
              ? "Press / to insert a field"
              : "Complete the form to test it"}
          </p>
        </div>

        {mode === "build" ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">
              {form.fields.length}/
              {MAX_FIELDS} fields
            </span>
            <Button
              size="sm"
              variant="secondary"
              isDisabled={!canPreview}
              onPress={() => {
                slashCommand.close();
                setMode("preview");
              }}
            >
              Test form
            </Button>
            <Button
              size="sm"
              variant="secondary"
              isDisabled={
                hasReachedFieldLimit
              }
              onPress={() => {
                slashCommand.openAtIndex(
                  form.fields.length,
                );
              }}
            >
              Add field
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onPress={() => {
              setMode("build");
            }}
          >
            Back to editor
          </Button>
        )}
      </div>
      {mode === "build" && (
        <section
          aria-label="Configuration validation"
          className={[
            "mx-auto mb-5 w-full max-w-3xl",
            "rounded-xl border px-4 py-3",
            configResult.success
              ? "border-default bg-surface"
              : "border-danger/30 bg-danger/5",
          ].join(" ")}
        >
          {configResult.success ? (
            <p className="text-sm text-foreground">
              Form configuration is
              valid.
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold text-danger">
                Fix these configuration
                errors:
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-danger">
                {configErrors.map(
                  (error, index) => (
                    <li
                      key={`${error.path}-${index}`}
                    >
                      {error.path
                        ? `${error.path}: `
                        : ""}
                      {error.message}
                    </li>
                  ),
                )}
              </ul>
            </>
          )}
        </section>
      )}
      <Card
        variant="default"
        className="mx-auto w-full max-w-3xl"
      >
        <Card.Content className="px-6 py-10 md:px-16 md:py-16">
          {mode === "build" ? (
            <FormEditor
              form={form}
              dispatch={dispatch}
              selectedFieldId={
                selectedFieldId
              }
              focusFieldId={
                focusFieldId
              }
              onSelectField={(
                fieldId,
              ) => {
                setSelectedFieldId(
                  fieldId,
                );
                setFocusFieldId(null);
              }}
              onRequestInsert={
                slashCommand.openAtIndex
              }
            />
          ) : (
            <FormPreview form={form} />
          )}
        </Card.Content>
      </Card>
      {mode === "build" &&
        slashCommand.isOpen && (
          <SlashCommandMenu
            query={slashCommand.query}
            commands={
              slashCommand.filteredCommands
            }
            activeIndex={
              slashCommand.activeIndex
            }
            insertionIndex={
              slashCommand.insertionIndex
            }
            onQueryChange={
              slashCommand.setQuery
            }
            onActiveIndexChange={
              slashCommand.setActiveIndex
            }
            onSearchKeyDown={
              slashCommand.handleSearchKeyDown
            }
            onSelect={
              slashCommand.selectCommand
            }
            onClose={() => {
              slashCommand.close();
            }}
          />
        )}
    </main>
  );
}
