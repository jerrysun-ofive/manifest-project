import {
  ListBox,
  Select,
} from "@heroui/react";
import type { DropdownField } from "../../builder-types";

type DropdownFieldViewProps = {
  field: DropdownField;
};

export function DropdownFieldView({
  field,
}: DropdownFieldViewProps) {
  return (
    <Select
      value={field.defaultValue ?? null}
      placeholder={field.placeholder || "Select an option"}
      aria-label={`${field.label} preview`}
      variant="secondary"
      fullWidth
      isDisabled
    >
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>

      <Select.Popover>
        <ListBox>
          {field.options.map((option) => (
            <ListBox.Item
              key={option.id}
              id={option.value}
            >
              {option.label}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}