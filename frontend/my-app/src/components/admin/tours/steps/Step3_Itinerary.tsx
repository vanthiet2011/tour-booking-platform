import { useFormContext, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { PlusCircle, Trash } from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MultiStepTourFormValues } from "../CreateTourForm";

export const itinerarySchema = z.object({
  schedules: z
    .array(
      z.object({
        dayNumber: z.coerce.number().min(1),
        title: z.string().min(1, "Tiêu đề không được trống."),
        description: z.string().optional(),
      })
    )
    .optional(),
});

export function Step3_Itinerary() {
  const { control } = useFormContext<MultiStepTourFormValues>();
  const { fields, append, remove } = useFieldArray<
    MultiStepTourFormValues,
    "schedules"
  >({
    control,
    name: "schedules",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="rounded-md border bg-muted/50 p-4 space-y-4"
        >
          <div className="flex justify-between items-center">
            <FormLabel className="font-semibold">Ngày {index + 1}</FormLabel>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
            >
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <FormField
            control={control}
            name={`schedules.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiêu đề</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`schedules.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả hoạt động</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ dayNumber: fields.length + 1, title: "", description: "" })
        }
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Thêm ngày
      </Button>
    </div>
  );
}
