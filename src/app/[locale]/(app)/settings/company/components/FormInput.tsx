import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Control } from "react-hook-form";

interface FormInputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
}

const FormInput = ({
  control,
  name,
  label,
  placeholder,
  disabled = false,
  loading = false,
}: FormInputProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {loading ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <Input placeholder={placeholder} {...field} disabled={disabled} />
            )}
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default FormInput;
