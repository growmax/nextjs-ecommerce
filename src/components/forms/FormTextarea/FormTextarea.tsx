import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import clsx from "clsx";
import { Control } from "react-hook-form";

interface FormTextareaProps {
  control: Control<any>;
  name: string;
  label: string | React.ReactNode;
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
      render={({ field,fieldState }) => (
        <FormItem>
          <FormLabel>
            {label}
           
          </FormLabel>
          <FormControl>
            {loading ? (
              <Skeleton className="h-20 w-full rounded-md" />
            ) : (
              <Textarea
                placeholder={placeholder}
                {...field}
                disabled={disabled}
                className={clsx(
                  "min-h-20", // always applied
                  fieldState.error && "border-red-500 focus-visible:ring-red-500"
                )}
                
                
              />
            )}
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default FormTextarea;
