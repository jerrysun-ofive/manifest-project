/**
 * Uses the discriminated uniton
 * After checking field.type === "number", ts should know
 * that the field is a NumberField. 
 * 
 * assertNever also causes a ts error if we later add 
 * a field type but forget to render it
 */

import type { FormField } from "../../builder-types";
import { DateFieldView } from "./DateFieldView";
import { DropdownFieldView } from "./DropdownFieldView";
import { LongTextFieldView } from "./LongTextFieldView";
import { NumberFieldView } from "./NumberFieldView";
import { ShortTextFieldView } from "./ShortTextFieldView";

type FieldRendererProps = {
  field: FormField;
};

function assertNever(value: never): never {
  throw new Error(`Unsupported field: ${JSON.stringify(value)}`);
}

export function FieldRenderer({
  field,
}: FieldRendererProps) {
  switch (field.type) {
    case "short-text":
      return <ShortTextFieldView field={field} />;

    case "long-text":
      return <LongTextFieldView field={field} />;

    case "number":
      return <NumberFieldView field={field} />;

    case "date":
      return <DateFieldView field={field} />;

    case "dropdown":
      return <DropdownFieldView field={field} />;

    default:
      return assertNever(field);
  }
}