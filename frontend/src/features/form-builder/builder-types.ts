// define explicit models 
export type FieldType = 
  | "short-text"
  | "long-text"
  | "number"
  | "date"
  | "dropdown";

export type BaseField = {
  id: string;
  label: string;
  description?: string;
  required: boolean;
};

// define extra values needed for each field type
export type ShortTextField = BaseField & {
  type: "short-text";
  placeholder?: string;
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
};

export type LongTextField = BaseField & {
  type: "long-text";
  placeholder?: string;
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
};

export type NumberField = BaseField & {
  type: "number";
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
};
export type DateField = BaseField & {
  type: "date";
  // set a default value as ISO date string, e.g. 2026-07-19
  defaultValue?: string; 
};

// drop down check boxes, each option is a own type
export type DropdownOption = {
  id: string;
  label: string;
  value: string;
};

export type DropdownField = BaseField & {
  type: "dropdown";
  placeholder?: string;
  defaultValue?: string;
  options: DropdownOption[];
};

export type FormField = 
| ShortTextField
| LongTextField
| NumberField
| DateField
| DropdownField;

// complete form document
export type FormDocument = {
  title: string;
  description: string;
  fields: FormField[];
};

/**
 * changes the form builder reducer is allowd to make
 * each item is a possible event that can happen in the builder
 */
export type BuilderAction = 
| { type: "form/setTitle"; title: string }
| { type: "form/setDescription"; description: string }
| { type: "field/add"; field: FormField; index: number }
| { type: "field/update"; field: FormField }
| { type: "field/delete"; fieldId: string }
| { type: "field/duplicate"; fieldId: string }
| { type: "field/reorder"; activeId: string; overId: string }
| { type: "field/moveUp"; fieldId: string }
| { type: "field/moveDown"; fieldId: string };
