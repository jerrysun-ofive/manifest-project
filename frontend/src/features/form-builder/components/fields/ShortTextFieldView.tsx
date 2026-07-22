import { Input } from "@heroui/react";
import type { ShortTextField } from "../../builder-types";

type ShortTextFieldProps = {
  field: ShortTextField;
}

export function ShortTextFieldView({
  field,
}: ShortTextFieldProps) {
  return (
    <Input
      type="text"
      value={field.defaultValue ?? ""}
      placeholder={field.placeholder}
      minLength={field.minLength}
      maxLength={field.maxLength}
      aria-label={`${field.label} preview`}
      variant="secondary"
      fullWidth
      readOnly
      // prevent preview controls from interrupting keyboard nav through the builder
      tabIndex={-1} 
    />
  )
}