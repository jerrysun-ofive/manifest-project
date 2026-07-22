import { TextArea } from "@heroui/react";
import type { LongTextField } from "../../builder-types";

type LongTextFieldViewProps = {
  field: LongTextField;
};

export function LongTextFieldView({
  field,
}: LongTextFieldViewProps) {
  return (
    <TextArea
      value={field.defaultValue ?? ""}
      placeholder={field.placeholder}
      minLength={field.minLength}
      maxLength={field.maxLength}
      aria-label={`${field.label} preview`}
      variant="secondary"
      rows={4}
      fullWidth
      readOnly
      // prevent preview controls from interrupting keyboard nav through the builder
      tabIndex={-1}
    />
  );
}