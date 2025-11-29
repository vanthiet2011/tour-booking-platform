// src/components/ui/multi-select.tsx
"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

// 1. ĐỊNH NGHĨA KIỂU (TYPE) MỚI
// Kiểu 'Option' chung, chấp nhận bất kỳ đối tượng nào
type Option = Record<string, any>;

export interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  // 2. THÊM 2 PROPS MỚI
  valueKey?: string; // Tên thuộc tính để làm value (ví dụ: 'id')
  labelKey?: string; // Tên thuộc tính để làm label (ví dụ: 'name')
  placeholder?: string;
  className?: string;
}

export const MultiSelect = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  MultiSelectProps
>(
  (
    {
      options,
      value = [],
      onChange,
      // 3. ĐẶT GIÁ TRỊ MẶC ĐỊNH
      valueKey = "value", // Mặc định là 'value'
      labelKey = "label", // Mặc định là 'label'
      placeholder = "Chọn...",
      className,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    const selectedOptions = React.useMemo(
      () =>
        options.filter((option) => value.includes(option[valueKey] as string)),
      [options, value, valueKey]
    );

    const selectableOptions = React.useMemo(
      () =>
        options.filter((option) => !value.includes(option[valueKey] as string)),
      [options, value, valueKey]
    );

    const handleSelect = (optionValue: string) => {
      onChange([...value, optionValue]);
    };

    const handleDeselect = (optionValue: string) => {
      onChange(value.filter((v) => v !== optionValue));
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        className={`overflow-visible bg-transparent ${className}`}
        ref={ref}
        {...props}
      >
        <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <div className="flex gap-1 flex-wrap">
            {/* 4. SỬA LOGIC HIỂN THỊ BADGE (PILL) */}
            {selectedOptions.map((option) => {
              return (
                <Badge
                  key={option[valueKey]}
                  variant="secondary"
                  className="rounded-sm"
                >
                  {/* Sử dụng 'labelKey' thay vì 'label' hard-coded */}
                  {option[labelKey]}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleDeselect(option[valueKey]);
                      }
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleDeselect(option[valueKey])}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              );
            })}

            {/* Input */}
            <CommandPrimitive.Input
              value={inputValue}
              onValueChange={setInputValue}
              onBlur={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
            />
          </div>
        </div>
        <div className="relative mt-2">
          {open && selectableOptions.length > 0 ? (
            <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup className="h-full overflow-auto">
                {/* 5. SỬA LOGIC HIỂN THỊ DANH SÁCH */}
                {selectableOptions.map((option) => {
                  return (
                    <CommandItem
                      key={option[valueKey]}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => {
                        handleSelect(option[valueKey]);
                        setInputValue("");
                      }}
                      className={"cursor-pointer"}
                    >
                      {/* Sử dụng 'labelKey' thay vì 'label' hard-coded */}
                      {option[labelKey]}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          ) : null}
        </div>
      </Command>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
