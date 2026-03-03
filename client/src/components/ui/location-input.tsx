import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LocationData = {
  formatted_address: string;
  city: string;
  state: string;
  country: string;
};

type LocationInputProps = {
  onLocationSelect: (locationData: LocationData) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  required?: boolean;
};

export function LocationInput({
  onLocationSelect,
  placeholder = "Enter a location",
  className,
  defaultValue = "",
  required = false
}: LocationInputProps) {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Simple parsing - Just treat the entire entry as a formatted address and city
    onLocationSelect({
      formatted_address: newValue,
      city: newValue,
      state: "",
      country: ""
    });
  };

  const handleBlur = () => {
    if (value) {
      // Try to parse city and state from common formats like "City, State"
      const parts = value.split(",").map(part => part.trim());
      
      let city = parts[0] || "";
      let state = parts.length > 1 ? parts[1] : "";
      let country = parts.length > 2 ? parts[2] : "";
      
      onLocationSelect({
        formatted_address: value,
        city,
        state,
        country
      });
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        className={cn(className, "w-full")}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        required={required}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Enter location as "City, State, Country" for best results
      </p>
    </div>
  );
}