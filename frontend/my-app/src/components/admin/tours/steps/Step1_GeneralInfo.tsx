"use client";

import * as z from "zod";
import { useFormContext, useFieldArray } from "react-hook-form";
import useSWR from "swr";
import { PlusCircle, Trash } from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import destinationService from "@/services/destination.service";
import { MultiStepTourFormValues } from "../CreateTourForm";

const departureSchema = z.object({
  startDate: z.string().min(1, "Ngày đi không được để trống"),
  endDate: z.string().min(1, "Ngày về không được để trống"),
  availableSlots: z.coerce
    .number({
      required_error: "Số chỗ không được để trống",
      invalid_type_error: "Số chỗ phải là số",
    })
    .int("Số chỗ phải là số nguyên")
    .min(1, "Số chỗ phải lớn hơn 0"),
});

export const generalInfoSchema = z.object({
  name: z.string().min(5, "Tên tour phải có ít nhất 5 ký tự"),
  duration: z.string().min(1, "Thời lượng không được để trống"),
  pricePerAdult: z.coerce
    .number({
      required_error: "Giá người lớn không được để trống",
      invalid_type_error: "Giá phải là số",
    })
    .min(0, "Giá không được là số âm"),
  pricePerChild: z.coerce
    .number({
      required_error: "Giá trẻ em không được để trống",
      invalid_type_error: "Giá phải là số",
    })
    .min(0, "Giá không được là số âm"),
  description: z.string().min(20, "Mô tả phải có ít nhất 20 ký tự"),
  destinationIds: z.array(z.string()).min(1, "Phải chọn ít nhất một điểm đến"),
  isBestseller: z.boolean().default(false).optional(),
  tourDepartures: z
    .array(departureSchema)
    .min(1, "Phải có ít nhất một ngày khởi hành"),
  highlights: z.array(z.string()).optional(),
  inclusions: z.object({
    included: z.array(z.string()).optional(),
    notIncluded: z.array(z.string()).optional(),
  }),
});

export function Step1_GeneralInfo() {
  const { control } = useFormContext<MultiStepTourFormValues>();

  const { data: destinations } = useSWR("/api/destinations?limit=1000", () =>
    destinationService.getAll({ limit: 1000 })
  );
  const destinationOptions =
    destinations?.items?.map((d) => ({ value: d.id, label: d.name })) || [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tourDepartures",
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên Tour</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thời lượng</FormLabel>
              <FormControl>
                <Input placeholder="Ví dụ: 3 ngày 2 đêm" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="pricePerAdult"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giá người lớn</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="pricePerChild"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giá trẻ em</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mô tả</FormLabel>
            <FormControl>
              <Textarea rows={5} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="destinationIds"
        render={({ field }) => {
          const selectedValues = destinationOptions.filter((option) =>
            (field.value || []).includes(option.value)
          );

          return (
            <FormField
              control={control}
              name="destinationIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Các điểm đến</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={destinationOptions}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Chọn các điểm đến..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        }}
      />

      <FormField
        control={control}
        name="isBestseller"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 pt-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel>Đây là tour Bestseller?</FormLabel>
          </FormItem>
        )}
      />

      <div className="space-y-4 rounded-lg border p-4">
        <FormLabel className="text-base font-semibold">
          Ngày khởi hành
        </FormLabel>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end rounded-md border bg-muted/50 p-3"
          >
            <FormField
              control={control}
              name={`tourDepartures.${index}.startDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày đi</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`tourDepartures.${index}.endDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày về</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`tourDepartures.${index}.availableSlots`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số chỗ</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              className="text-destructive"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() =>
            append({ startDate: "", endDate: "", availableSlots: 10 })
          }
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm ngày khởi hành
        </Button>
      </div>

      <FormField
        control={control}
        name="highlights"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Điểm nổi bật</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Mỗi đặc điểm trên một dòng..."
                onChange={(e) => field.onChange(e.target.value.split("\n"))}
                defaultValue={
                  Array.isArray(field.value) ? field.value.join("\n") : ""
                }
              />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="inclusions.included"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bao gồm</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mỗi mục trên một dòng..."
                  rows={5}
                  onChange={(e) => field.onChange(e.target.value.split("\n"))}
                  defaultValue={
                    Array.isArray(field.value) ? field.value.join("\n") : ""
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="inclusions.notIncluded"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Không bao gồm</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mỗi mục trên một dòng..."
                  rows={5}
                  onChange={(e) => field.onChange(e.target.value.split("\n"))}
                  defaultValue={
                    Array.isArray(field.value) ? field.value.join("\n") : ""
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
