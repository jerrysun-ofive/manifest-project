import { Input } from "@heroui/react";
import type { DateField } from "../../builder-types";

type DateFieldViewProps = {
  field: DateField;
};

export function DateFieldView({
  field,
}: DateFieldViewProps) {
  return (
    <Input
      type="date"
      value={field.defaultValue ?? ""}
      aria-label={`${field.label} preview`}
      variant="secondary"
      fullWidth
      readOnly
      // prevent preview controls from interrupting keyboard nav through the builder
      tabIndex={-1}
    />
  );
}