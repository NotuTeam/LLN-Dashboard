import { Select } from "antd";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface StyledSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  label?: string;
  className?: string;
}

export function StyledSelect({
  value,
  onChange,
  options,
  label,
  className = "",
}: StyledSelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <Select
          value={value}
          onChange={(e) => onChange(e)}
          className={cn("w-full", className)}
          dropdownClassName="rounded-xl border-gray-200 bg-white"
        >
          {options.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </div>
    </div>
  );
}
