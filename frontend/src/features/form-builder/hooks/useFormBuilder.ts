import { useReducer } from "react";
import type { FormDocument } from "../builder-types";
import {
  formBuilderReducer,
  initialFormDocument,
} from "../form-builder-reducer";

/** hook keeps state setup out of page component */
export function useFormBuilder(
  initialState: FormDocument = initialFormDocument,
) {
  const [form, dispatch] = useReducer(formBuilderReducer, initialState);

  return { form, dispatch };
}