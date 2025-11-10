import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";

interface FormTextareaProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
}

const FormTextarea = ({
  control,
  name,
  label,
  placeholder,
  disabled = false,
  loading = false,
  required = false,
}: FormTextareaProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {loading ? (
              <Skeleton className="h-20 w-full rounded-md" />
            ) : (
              <Textarea
                placeholder={placeholder}
                {...field}
                disabled={disabled}
                className="min-h-20"
              />
            )}
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default FormTextarea;
