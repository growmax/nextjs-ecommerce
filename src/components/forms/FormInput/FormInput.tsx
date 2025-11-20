import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import clsx from "clsx";
import { Control } from "react-hook-form";

interface FormInputProps {
  control: Control<any>;
  name: string;
  label: string | React.ReactNode;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  rules?: any;
}

const FormInput = ({
  control,
  name,
  label,
  placeholder,
  disabled = false,
  loading = false,
  required = false,
  rules = {},
}: FormInputProps) => {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>
            {label}
            
          </FormLabel>

          <FormControl>
            {loading ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <Input
                placeholder={placeholder}
                {...field}
                disabled={disabled}
                className={clsx(
                  fieldState?.error && "border-red-500 focus-visible:ring-red-500"
                )}
              />
            )}
          </FormControl>

          {/* 🔥 shows "Branch name is required" */}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormInput;
