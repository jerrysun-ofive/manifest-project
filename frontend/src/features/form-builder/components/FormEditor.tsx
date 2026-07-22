/**
 * Recieve current form data, display the title, description, and fields. 
 * Then tell the reducer when user changes somethin and tell 
 * parent component which field th euser selected. 
 */

import { useState, type Dispatch } from "react";
import type {
  BuilderAction,
  FormDocument,
  FormField,
} from "../builder-types";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_LABEL_LENGTH,
  MAX_FIELDS,
} from "../limits";
import { EditableText } from "./EditableText";
import { FormBlock } from "./FormBlock";
import { Button } from "@heroui/react"
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  SortableFieldItem,
} from "./SortableFieldItem";
import type {
  DropIndicator,
} from "./SortableFieldItem";

type FormEditorProps = {
  form: FormDocument;
  // dispatch sends action to reducer. reducer receives and create new ver of form
  dispatch: Dispatch<BuilderAction>;
  selectedFieldId: string | null;
  focusFieldId: string | null;
  onSelectField: (fieldId: string) => void;
  onRequestInsert: (index: number) => void;
};

export function FormEditor({
  form,
  dispatch,
  selectedFieldId,
  focusFieldId,
  onSelectField,
  onRequestInsert,
}: FormEditorProps) {
  /**
   * activeFieldId rememebrs whch field is being dragged
   * calling setActiveFieldId causes react to render the component again
   * the new render uses the updated fieldId to show the drag preview 
   * and drop indicator
   * 
   * https://dndkit.com/concepts/sortable/ 
   */
  // 
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [overFieldId, setOverFieldId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeField = form.fields.find(
    (field) => field.id === activeFieldId,
  );

  function resetDragState() {
    setActiveFieldId(null);
    setOverFieldId(null);
  }

  function handleDragStart(
    event: DragStartEvent,
  ) {
    const fieldId = String(event.active.id);

    setActiveFieldId(fieldId);
    setOverFieldId(fieldId);
    onSelectField(fieldId);
  }

  function handleDragOver(
    event: DragOverEvent,
  ) {
    setOverFieldId(
      event.over ? String(event.over.id) : null,
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    if (overId && activeId !== overId) {
      dispatch({
        type: "field/reorder",
        activeId,
        overId,
      });
    }
    resetDragState();
  }

  function getDropIndicator(fieldId: string): DropIndicator {
    if (
      !activeFieldId ||
      !overFieldId ||
      activeFieldId === overFieldId ||
      fieldId !== overFieldId
    ) {
      return null;
    }
    const activeIndex =
      form.fields.findIndex(
        (field) =>
          field.id === activeFieldId,
      );
    const overIndex =
      form.fields.findIndex(
        (field) =>
          field.id === overFieldId,
      );
    if (
      activeIndex === -1 ||
      overIndex === -1
    ) {
      return null;
    }
    return activeIndex < overIndex
      ? "after"
      : "before";
  }

  // converts field update into reducer action
  function updateField(field: FormField) {
    dispatch({
      type: "field/update",
      field,
    });
  }

  return (
    <section aria-label="Form editor">
      <header className="mb-12">
        <h1>
          {/* edit form title */}
          <EditableText
            value={form.title} // current title
            ariaLabel="Form title"
            placeholder="Untitled form"
            maxLength={MAX_LABEL_LENGTH}
            className="text-4xl font-bold tracking-tight md:text-5xl"
            onCommit={(title) => {
              dispatch({
                type: "form/setTitle",
                title,
              });
            }}
          />
        </h1>
        
        <div className="mt-3">
          {/* edit form description */}
          <EditableText
            value={form.description}
            ariaLabel="Form description"
            placeholder="Add a description"
            maxLength={MAX_DESCRIPTION_LENGTH}
            multiline
            className="text-base text-muted"
            onCommit={(description) => {
              dispatch({
                type: "form/setDescription",
                description,
              });
            }}
          />
        </div>
      </header>
      
      {/* check if form has any fields and render them */}
      {form.fields.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-default px-6 py-14 text-center">
          <p className="font-semibold text-foreground">
            No fields yet
          </p>

          <p className="mt-1 text-sm text-muted">
            Add your first field below or press /.
          </p>

          <Button
            className="mt-5"
            variant="secondary"
            onPress={() => onRequestInsert(0)}
          >
            Add first field
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={resetDragState}
        >
          <SortableContext
            items={form.fields.map(
              (field) => field.id,
            )}
            strategy={
              verticalListSortingStrategy
            }
          >
            <ol
              className="grid list-none gap-4 p-0"
              aria-label="Form fields"
            >
              {form.fields.map(
                (field, index) => (
                  <SortableFieldItem
                    key={field.id}
                    fieldId={field.id}
                    fieldLabel={field.label}
                    dropIndicator={getDropIndicator(
                      field.id,
                    )}
                  >
                    <FormBlock
                      field={field}
                      index={index}
                      selected={
                        selectedFieldId ===
                        field.id
                      }
                      shouldAutoFocus={
                        focusFieldId ===
                        field.id
                      }
                      canDuplicate={
                        form.fields.length <
                        MAX_FIELDS
                      }
                      canMoveUp={index > 0}
                      canMoveDown={
                        index <
                        form.fields.length - 1
                      }
                      onSelect={onSelectField}
                      onUpdate={updateField}
                      onDuplicate={(
                        fieldId,
                      ) => {
                        dispatch({
                          type:
                            "field/duplicate",
                          fieldId,
                        });
                      }}
                      onMoveUp={(fieldId) => {
                        dispatch({
                          type:
                            "field/moveUp",
                          fieldId,
                        });
                      }}
                      onMoveDown={(
                        fieldId,
                      ) => {
                        dispatch({
                          type:
                            "field/moveDown",
                          fieldId,
                        });
                      }}
                      onDelete={(fieldId) => {
                        dispatch({
                          type:
                            "field/delete",
                          fieldId,
                        });
                      }}
                    />
                    <div className="flex justify-center py-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-50 transition-opacity hover:opacity-100"
                        aria-label={`Add field after field ${index + 1}`}
                        isDisabled={
                          form.fields.length >=
                          MAX_FIELDS
                        }
                        onPress={() => {
                          onRequestInsert(
                            index + 1,
                          );
                        }}
                      >
                        Add field
                      </Button>
                    </div>
                  </SortableFieldItem>
                ),
              )}
            </ol>
          </SortableContext>
          <DragOverlay>
            {activeField ? (
              <div className="w-[36rem] max-w-[80vw] rounded-2xl border border-accent bg-surface px-5 py-4 shadow-2xl">
                <p className="font-semibold text-foreground">
                  {activeField.label}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {activeField.type}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </section>
  );
}