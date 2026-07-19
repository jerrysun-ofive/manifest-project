/** 
 * The form builder will have a few ways to reorder a field
 *  - drag and drop (dnd kit)
 *  - clicking move up or move down
 * These actions will need to change the same field array
 * 
 * This file allows reodering logic inside all components,
 * giving consistent behaviour, reusable logic and better testing
*/
import type { FormField } from "./builder-types";

/** helper function to find the position of a field by its id */
function idxOfField(fields: FormField[], fieldId: string): number {
  return fields.findIndex((field) => field.id === fieldId);
}

/** move the field with activeId to where overId is at currently */
export function reorderFields(
  fields: FormField[],
  activeId: string, // the field being dragged
  overId: string, // the field it was dropped over
): FormField[] {
  // dropped in the same place
  if (activeId === overId) {
    return fields;
  }

  const fromIdx = idxOfField(fields, activeId);
  const toIdx = idxOfField(fields, overId);

  // the field with id wasn't found 
  if (fromIdx === -1 || toIdx === -1) {
    return fields;
  }

  const nxt = [...fields];
  const [moved] = nxt.splice(fromIdx, 1);
  nxt.splice(toIdx, 0, moved);
  return nxt;
}

/** move a field up by one spot */
export function moveFieldUp(
  fields: FormField[],
  fieldId: string,
): FormField[] {
  const idx = idxOfField(fields, fieldId);
  // if field not found or already the first field
  if (idx <= 0) {
    return fields;
  }

  const nxt = [...fields];
  [nxt[idx - 1], nxt[idx]] = [nxt[idx], nxt[idx - 1]];
  return nxt;
}

/** move a field down by one spot */
export function moveFieldDown(
  fields: FormField[],
  fieldId: string,
): FormField[] {
  const idx = idxOfField(fields, fieldId);
  // if field not found or already the last field
  if (idx === -1 || idx >= fields.length - 1) {
    return fields;
  }

  const nxt = [...fields];
  [nxt[idx], nxt[idx + 1]] = [nxt[idx + 1], nxt[idx]];
  return nxt;
}