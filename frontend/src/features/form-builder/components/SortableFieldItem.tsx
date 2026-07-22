import type {
  CSSProperties,
  ReactNode,
} from "react";
import {
  useSortable,
} from "@dnd-kit/sortable";
import {
  CSS,
} from "@dnd-kit/utilities";

export type DropIndicator =
  | "before"
  | "after"
  | null;

type SortableFieldItemProps = {
  fieldId: string;
  fieldLabel: string;
  dropIndicator: DropIndicator;
  children: ReactNode;
};

export function SortableFieldItem({
  fieldId,
  fieldLabel,
  dropIndicator,
  children,
}: SortableFieldItemProps) {
  const {
    attributes,
    listeners, // mouse, touch, keyboard event handlers
    setNodeRef, // tells dnd kit whihc html element to move
    setActivatorNodeRef, // identifies the drag handle
    transform, // current movement coords
    transition,
    isDragging,
  } = useSortable({
    id: fieldId,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="relative"
      data-dragging={isDragging}
    >
      {dropIndicator === "before" && (
        <div
          className="mb-2 h-1 rounded-full bg-accent"
          aria-hidden="true"
        />
      )}

      <div className="group relative">
        <button
          ref={setActivatorNodeRef}
          type="button"
          className={[
            "absolute -left-11 top-5 z-10",
            "flex h-9 w-9 items-center justify-center",
            "rounded-lg border border-default",
            "bg-surface text-lg text-muted shadow-sm",
            "cursor-grab touch-none",
            "hover:bg-surface-secondary hover:text-foreground",
            "focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-accent",
            "active:cursor-grabbing",
          ].join(" ")}
          aria-label={`Drag ${fieldLabel}`}
          {...attributes}
          {...listeners}
        >
          <span aria-hidden="true">⠿</span>
        </button>

        {children}
      </div>

      {dropIndicator === "after" && (
        <div
          className="mt-2 h-1 rounded-full bg-accent"
          aria-hidden="true"
        />
      )}
    </li>
  );
}