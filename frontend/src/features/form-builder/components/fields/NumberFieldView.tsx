import { Input } from "@heroui/react";
import type { NumberField } from "../../builder-types";

type NumberFieldViewProps = {
  field: NumberField;
};

export function NumberFieldView({
  field,
}: NumberFieldViewProps) {
  return (
    <Input
      type="number"
      value={field.defaultValue?.toString() ?? ""}
      placeholder={field.placeholder}
      min={field.min}
      max={field.max}
      aria-label={`${field.label} preview`}
      variant="secondary"
      fullWidth
      readOnly
      // prevent preview controls from interrupting keyboard nav through the builder
      tabIndex={-1}
    />
  );
}