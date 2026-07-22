/**
 * this exposes the reducer actions defined in builder-types.ts
 */

type ContextualToolbarProps = {
  required: boolean;
  canDuplicate: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggleRequired: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onOpenSettings: () => void;
};

export function ContextualToolbar({
  required,
  canDuplicate,
  canMoveUp,
  canMoveDown,
  onToggleRequired,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDelete,
  onOpenSettings,
}: ContextualToolbarProps) {
  const buttonClass =
    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors " +
    "hover:bg-surface-secondary disabled:cursor-not-allowed " +
    "disabled:opacity-40";

  return (
    <div
      className="mb-4 flex flex-wrap items-center gap-1 rounded-xl border border-default bg-surface p-1 shadow-sm"
      role="toolbar"
      aria-label="Field controls"
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <button
        type="button"
        className={buttonClass}
        aria-pressed={required}
        onClick={onToggleRequired}
      >
        {required ? "Required" : "Optional"}
      </button>

      <button
        type="button"
        className={buttonClass}
        onClick={onOpenSettings}
      >
        Settings
      </button>

      <button
        type="button"
        className={buttonClass}
        disabled={!canDuplicate}
        onClick={onDuplicate}
      >
        Duplicate
      </button>

      <button
        type="button"
        className={buttonClass}
        disabled={!canMoveUp}
        aria-label="Move field up"
        onClick={onMoveUp}
      >
        Move up
      </button>

      <button
        type="button"
        className={buttonClass}
        disabled={!canMoveDown}
        aria-label="Move field down"
        onClick={onMoveDown}
      >
        Move down
      </button>

      <button
        type="button"
        className={`${buttonClass} text-danger`}
        onClick={onDelete}
      >
        Delete
      </button>
    </div>
  );
}