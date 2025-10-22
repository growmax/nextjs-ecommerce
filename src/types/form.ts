import { Control, FieldValues, Path } from "react-hook-form";

// Base Form Field Props
export interface BaseFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  error?: string;
}

// Company Form Data Interface
export interface CompanyFormData {
  data: {
    name: string;
    website: string | null;
    addressId: {
      gst: string | null;
    };
    subIndustryId: {
      id: string | null;
      name: string | null;
      description: string | null;
    };
    businessTypeId: {
      id: string | null;
      name: string | null;
    };
    accountTypeId: {
      id: string | null;
      name: string | null;
    };
    currencyId: {
      currencyCode: string | null;
    };
  };
  subIndustry: string;
  subIndustryOptions: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

// Form Input Props with Generic Type
export interface FormInputProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {
  type?: "text" | "email" | "number" | "tel" | "url";
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: string) => boolean | string;
}

// Select Input Props
export interface SelectInputProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {
  options: Array<{
    value: string;
    label: string;
  }>;
  isMulti?: boolean;
  isClearable?: boolean;
}

// Form Validation Rules
export const formValidationRules = {
  website: {
    pattern: {
      value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
      message: "Please enter a valid URL",
    },
  },
  gst: {
    pattern: {
      value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      message: "Please enter a valid GST number",
    },
  },
};

// Form Error Handler Type
export type FormErrorHandler = (field: string, message: string) => void;

// Form Submit Handler Type
export type FormSubmitHandler<T> = (data: T) => Promise<void>;

// Form State Interface
export interface FormState<T> {
  isLoading: boolean;
  isSaving: boolean;
  isFormReady: boolean;
  initialData: T | null;
  errors: Record<string, string>;
}
