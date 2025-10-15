import { useFormContext, useFieldArray } from "react-hook-form";
import * as z from "zod";
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
import { getDestinations } from "@/lib/api";
import { MultiStepTourFormValues } from "../CreateTourForm";

// Zod schema cho riêng bước này
export const generalInfoSchema = z.object({
  name: z.string().min(2, "Tên tour phải có ít nhất 2 ký tự."),
  duration: z.string().optional(),
  pricePerAdult: z.coerce.number().min(0),
  pricePerChild: z.coerce.number().min(0),
  description: z.string().optional(),
  destinationIds: z.array(z.string()).min(1, "Phải chọn ít nhất một điểm đến."),
  isBestseller: z.boolean().default(false),
  tourDepartures: z
    .array(
      z.object({
        startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
        endDate: z.string().min(1, "Ngày kết thúc là bắt buộc"),
        availableSlots: z.coerce.number().int().min(1),
      })
    )
    .min(1, "Phải có ít nhất một ngày khởi hành"),
  highlights: z.array(z.string()).optional(),
  inclusions: z
    .object({
      included: z.array(z.string()).optional(),
      notIncluded: z.array(z.string()).optional(),
    })
    .optional(),
});

interface Step1Props {
  form: any; // Simplified for brevity
}

export function Step1_GeneralInfo() {
  const { control } = useFormContext<MultiStepTourFormValues>();

  const { data: destinations } = useSWR("/api/destinations", getDestinations);
  const destinationOptions =
    destinations?.map((d) => ({ value: d.id, label: d.name })) || [];

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "tourDepartures",
  });

  return (
    <div className="space-y-6">
      {/* Tên, Thời lượng, Giá */}
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
      {/* Mô tả */}
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
      {/* Điểm đến và Bestseller */}
      <FormField
        control={control}
        name="destinationIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Các điểm đến</FormLabel>
            <FormControl>
              <MultiSelect
                options={destinationOptions}
                selected={field.value}
                onChange={field.onChange}
                placeholder="Chọn các điểm đến..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
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

      {/* Ngày khởi hành */}
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
      {/* Điểm nổi bật, Bao gồm/Không bao gồm */}
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
