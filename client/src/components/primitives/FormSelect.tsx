import { forwardRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getMobileInputStyles } from "@/lib/mobile-standards";

interface FormSelectProps {
  error?: string;
  label?: string;
  errorMessage?: string;
  showErrorInline?: boolean;
  placeholder?: string;
  options: readonly { value: string; label: string }[] | Array<{ value: string; label: string }>;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  defaultValue?: string;
}

/**
 * FormSelect — Lightly extended shadcn Select component
 *
 * Adds:
 * - ERB default styling (border-primary/20 focus:border-primary)
 * - Mobile-responsive styles via getMobileInputStyles()
 * - Optional inline error display below the select
 * - Accessible error messaging
 * - Simplified API for common use cases
 */
export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  ({
    error,
    label,
    errorMessage,
    showErrorInline = true,
    placeholder = "Select an option",
    options,
    value,
    onValueChange,
    disabled,
    defaultValue,
  }, ref) => {
    const selectId = `select-${Math.random()}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-neutral-700 mb-1 block"
          >
            {label}
          </label>
        )}
        <Select value={value} onValueChange={onValueChange} defaultValue={defaultValue} disabled={disabled}>
          <SelectTrigger
            ref={ref}
            id={selectId}
            className={cn(
              getMobileInputStyles(),
              "border-primary/20 focus:border-primary",
              error && "border-destructive focus:border-destructive"
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : undefined}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && showErrorInline && (
          <p
            id={`${selectId}-error`}
            className="text-xs text-destructive mt-1 font-medium"
          >
            {errorMessage || error}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
