import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getMobileInputStyles } from "@/lib/mobile-standards";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  errorMessage?: string;
  showErrorInline?: boolean;
}

/**
 * FormInput — Lightly extended shadcn Input component
 *
 * Adds:
 * - ERB default styling (border-primary/20 focus:border-primary)
 * - Mobile-responsive styles via getMobileInputStyles()
 * - Optional inline error display below the input
 * - Accessible error messaging
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({
    error,
    label,
    errorMessage,
    showErrorInline = true,
    className,
    id,
    ...props
  }, ref) => {
    const inputId = id || props.name || `input-${Math.random()}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-neutral-700 mb-1 block"
          >
            {label}
          </label>
        )}
        <Input
          ref={ref}
          id={inputId}
          className={cn(
            getMobileInputStyles(),
            "border-primary/20 focus:border-primary",
            error && "border-destructive focus:border-destructive",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && showErrorInline && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-destructive mt-1 font-medium"
          >
            {errorMessage || error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
