// src/components/ui/multi-select.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

export interface MultiSelectProps<T extends object> {
  options: T[];
  value: string[]; // các value đã chọn
  onChange: (value: string[]) => void;
  valueKey: keyof T; // key dùng làm value
  labelKey: keyof T; // key dùng làm hiển thị
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const MultiSelect = <T extends object>({
  options,
  value = [],
  onChange,
  valueKey,
  labelKey,
  placeholder = "Chọn...",
  className,
  disabled = false,
}: MultiSelectProps<T>) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const selectedOptions = React.useMemo(
    () => options.filter((option) => value.includes(String(option[valueKey]))),
    [options, value, valueKey]
  );

  const selectableOptions = React.useMemo(
    () => options.filter((option) => !value.includes(String(option[valueKey]))),
    [options, value, valueKey]
  );

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    onChange([...value, optionValue]);
  };

  const handleDeselect = (optionValue: string) => {
    if (disabled) return;
    onChange(value.filter((v) => v !== optionValue));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      setOpen(true);
    } else if (e.key === "Backspace" && !inputValue) {
      if (value.length > 0) {
        handleDeselect(value[value.length - 1]);
      }
    }
  };

  return (
    <Command
      onKeyDown={handleInputKeyDown}
      className={`overflow-visible bg-transparent ${
        disabled ? "opacity-50 pointer-events-none" : ""
      } ${className ?? ""}`}
    >
      <div className="group border border-input px-3 py-2 text-sm rounded-md ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex gap-1 flex-wrap">
          {selectedOptions.map((option) => {
            const optionValue = String(option[valueKey]);
            return (
              <Badge
                key={optionValue}
                variant="secondary"
                className="rounded-sm"
              >
                {String(option[labelKey])}
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleDeselect(optionValue)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}

          <CommandPrimitive.Input
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {open && selectableOptions.length > 0 && (
        <div className="relative mt-2">
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in">
            <CommandGroup className="max-h-60 overflow-auto">
              {selectableOptions.map((option) => {
                const optionValue = String(option[valueKey]);
                return (
                  <CommandItem
                    key={optionValue}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => {
                      handleSelect(optionValue);
                      setInputValue("");
                    }}
                    className="cursor-pointer"
                  >
                    {String(option[labelKey])}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        </div>
      )}
    </Command>
  );
};

MultiSelect.displayName = "MultiSelect";
