import { forwardRef } from "react";
import { GooglePlacesBusinessInput } from "@/components/ui/google-places-input";
import { GooglePlacesAddressInput } from "@/components/ui/google-places-input";
import { cn } from "@/lib/utils";
import { getMobileInputStyles } from "@/lib/mobile-standards";

interface AutocompleteFieldProps {
  type: "business" | "address";
  onSelect: (result: any) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  required?: boolean;
  onFocus?: ((e?: React.FocusEvent<HTMLInputElement>) => void) | (() => void);
  autoFocus?: boolean;
  error?: string;
  errorMessage?: string;
  showErrorInline?: boolean;
  label?: string;
}

/**
 * AutocompleteField — Unified wrapper for Google Places autocomplete primitives
 *
 * Consolidates GooglePlacesBusinessInput and GooglePlacesAddressInput
 * into a single configurable component via the `type` prop.
 *
 * Adds:
 * - ERB default styling (border-primary/20 focus:border-primary)
 * - Mobile-responsive styles via getMobileInputStyles()
 * - Optional inline error display
 * - Accessible error messaging
 * - Single interface for business and address autocomplete
 *
 * Used for: UI-003 (Google Places not autosuggesting correct business name)
 */
export const AutocompleteField = forwardRef<HTMLInputElement, AutocompleteFieldProps>(
  ({
    type,
    onSelect,
    placeholder,
    className,
    defaultValue,
    required,
    onFocus,
    autoFocus,
    error,
    errorMessage,
    showErrorInline = true,
    label,
  }, ref) => {
    const defaultPlaceholders = {
      business: "Search for your business...",
      address: "Search for address...",
    };

    const mergedClassName = cn(
      getMobileInputStyles(),
      "border-primary/20 focus:border-primary",
      error && "border-destructive focus:border-destructive",
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="text-xs font-semibold text-neutral-700 mb-1 block">
            {label}
          </label>
        )}
        {type === "business" ? (
          <GooglePlacesBusinessInput
            onBusinessSelect={onSelect}
            placeholder={placeholder || defaultPlaceholders.business}
            className={mergedClassName}
            defaultValue={defaultValue}
            required={required}
            onFocus={onFocus}
            autoFocus={autoFocus}
          />
        ) : (
          <GooglePlacesAddressInput
            onAddressSelect={onSelect}
            placeholder={placeholder || defaultPlaceholders.address}
            className={mergedClassName}
            defaultValue={defaultValue}
            required={required}
            onFocus={onFocus}
          />
        )}
        {error && showErrorInline && (
          <p className="text-xs text-destructive mt-1 font-medium">
            {errorMessage || error}
          </p>
        )}
      </div>
    );
  }
);

AutocompleteField.displayName = "AutocompleteField";
