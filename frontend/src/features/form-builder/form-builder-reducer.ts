/**
 * The form has too many different ways of changing one shared piece of state, i.e.
 *  - change title, description
 *  - update, add, delete, duplicate fields
 *  - reoder fields and move fields up and down
 * therefore, a reducer is created to keep all the scattered update logic in a central function
 * 
 * the reducer will take in (current state + action) and return a new state
 */

import type { BuilderAction, FormDocument } from "./builder-types";
import { duplicateField } from "./field-defaults";
import { MAX_FIELDS } from "./limits";
import {
  moveFieldDown,
  moveFieldUp,
  reorderFields,
} from "./reorder-fields";

export const initialFormDocument: FormDocument = {
  title: "Untitled form",
  description: "",
  fields: [],
};

export function formBuilderReducer(
  state: FormDocument,
  action: BuilderAction,
): FormDocument {
  switch (action.type){
    case "form/setTitle":
      return { ...state, title: action.title };
    
    case "form/setDescription":
      return { ...state, description: action.description };

    case "field/add": {
      if (state.fields.length >= MAX_FIELDS) {
        return state;
      }

      const idx = Math.max(0, Math.min(action.index, state.fields.length));
      const fields = [...state.fields];
      fields.splice(idx, 0, action.field);
      return { ...state, fields };
    }

    case "field/update": {
      const idx = state.fields.findIndex(
        (field) => field.id === action.field.id,
      );

      if (idx === -1) return state;

      const fields = [...state.fields];
      fields[idx] = action.field;
      return { ...state, fields };
    }

    case "field/delete":
      return {
        ...state,
        fields: state.fields.filter((field) => 
          field.id !== action.fieldId
        ),
      };
    
    case "field/duplicate": {
      if (state.fields.length >= MAX_FIELDS){
        return state;
      }

      const idx = state.fields.findIndex((field) => 
        field.id === action.fieldId,
      );

      if (idx === -1) return state;

      const prev = state.fields[idx];
      const copy = duplicateField(prev);
      const fields = [...state.fields];
      fields.splice(idx + 1, 0, copy);
      return { ...state, fields };
    }

    case "field/reorder":
      return {
        ...state,
        fields: reorderFields(
          state.fields,
          action.activeId,
          action.overId,
        ),
      };
    
    case "field/moveDown":
      return {
        ...state,
        fields: moveFieldDown(state.fields, action.fieldId),
      };
    
    case "field/moveUp":
      return {
        ...state,
        fields: moveFieldUp(state.fields, action.fieldId),
      };

    default:
      return state;
  }
}
