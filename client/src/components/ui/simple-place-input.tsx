import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Simple Place Input Component
 * 
 * A basic input component for location selection without external API dependencies.
 */

type SimpleAddressInputProps = {
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  required?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

export function SimpleAddressInput({
  onValueChange,
  placeholder = "Enter location (e.g. Miami, FL)",
  className,
  defaultValue = "",
  required = false,
  onFocus
}: SimpleAddressInputProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  
  // Handle input changes and notify parent
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onValueChange(value);
  };
  
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        className={cn(className, "w-full")}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={onFocus}
        required={required}
      />
    </div>
  );
}

/**
 * Simple Business Input Component
 * 
 * A basic input component to replace Google Places Autocomplete
 * for business selection.
 */

type SimpleBusinessInputProps = {
  onBusinessChange: (value: { businessName: string }) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  required?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

export function SimpleBusinessInput({
  onBusinessChange,
  placeholder = "Enter business name",
  className,
  defaultValue = "",
  required = false,
  onFocus
}: SimpleBusinessInputProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  
  // Handle input changes and notify parent
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onBusinessChange({ businessName: value });
  };
  
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        className={cn(className, "w-full")}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={onFocus}
        required={required}
      />
    </div>
  );
}