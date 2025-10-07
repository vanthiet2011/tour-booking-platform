"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSWR, { mutate } from "swr";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  getDestinations,
  createTour,
  updateTour,
  Tour,
  CreateTourPayload,
} from "@/lib/api";
import { Trash } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";

interface TourFormProps {
  isOpen: boolean;
  onClose: () => void;
  tour: Tour | null;
}

const scheduleSchema = z.object({
  dayNumber: z.coerce.number().min(1),
  title: z.string().min(1, "Tiêu đề không được trống."),
  description: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(2, "Tên tour phải có ít nhất 2 ký tự."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Giá phải là số dương."),
  capacity: z.coerce.number().int().min(1, "Sức chứa phải lớn hơn 0."),
  duration: z.string().optional(),
  isBestseller: z.boolean().default(false),
  imageUrl: z.string().optional().or(z.literal("")),
  destinationIds: z.array(z.string()).min(1, "Phải chọn ít nhất một điểm đến."),
  schedules: z.array(scheduleSchema).optional(),
});

export function TourForm({ isOpen, onClose, tour }: TourFormProps) {
  const { toast } = useToast();
  const { data: destinations } = useSWR("/api/destinations", getDestinations);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      capacity: 10,
      duration: "",
      isBestseller: false,
      imageUrl: "",
      destinationIds: [],
      schedules: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedules",
  });

  const isEditing = !!tour;

  useEffect(() => {
    if (isOpen) {
      if (isEditing && tour) {
        // Reset form với dữ liệu từ tour đang chỉnh sửa
        form.reset({
          name: tour.name,
          description: tour.description,
          price: tour.price,
          capacity: tour.capacity,
          duration: tour.duration,
          isBestseller: tour.isBestseller,
          imageUrl: tour.imageUrl,
          // Map lại destinationIds từ mảng tourDestinations
          destinationIds:
            tour.tourDestinations?.map((td) => td.destination.id) || [],
          // Map lại schedules từ mảng tourSchedules
          schedules: tour.tourSchedules || [],
        });
      } else {
        // Reset form về trạng thái trống cho việc thêm mới
        form.reset({
          name: "",
          description: "",
          price: 0,
          capacity: 10,
          duration: "",
          isBestseller: false,
          imageUrl: "",
          destinationIds: [],
          schedules: [],
        });
      }
    }
  }, [tour, isEditing, isOpen, form]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/files/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${Cookies.get("accessToken")}` },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      form.setValue("imageUrl", data.url, { shouldValidate: true });
      toast({ title: "Thành công", description: "Đã tải ảnh lên." });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải ảnh lên.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload: CreateTourPayload = {
        ...values,
        schedules: values.schedules || [],
      };

      if (isEditing && tour) {
        await updateTour(tour.id, payload);
      } else {
        await createTour(payload);
      }
      mutate("/api/tours");
      toast({
        title: "Thành công!",
        description: `Đã ${isEditing ? "cập nhật" : "tạo mới"} tour.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: "Thao tác thất bại.",
        variant: "destructive",
      });
    }
  };

  const destinationOptions =
    destinations?.map((d) => ({ value: d.id, label: d.name })) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa Tour" : "Tạo Tour Mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số người tối đa</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
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
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình ảnh</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="mb-2"
                      />
                      {isUploading && <p>Đang tải lên...</p>}
                      {field.value && (
                        <img
                          src={field.value}
                          alt="Preview"
                          className="w-full h-auto rounded-md mt-2"
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
              control={form.control}
              name="isBestseller"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Là Bestseller?</FormLabel>
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="text-lg font-semibold">
                Lịch trình chi tiết
              </FormLabel>
              <div className="space-y-4 mt-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-2 items-start border p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1 space-y-2">
                      <FormField
                        control={form.control}
                        name={`schedules.${index}.dayNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ngày số</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`schedules.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tiêu đề</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`schedules.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mô tả hoạt động</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="mt-8 text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() =>
                  append({
                    dayNumber: fields.length + 1,
                    title: "",
                    description: "",
                  })
                }
              >
                Thêm ngày vào lịch trình
              </Button>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isUploading}
              >
                {form.formState.isSubmitting ? "Đang lưu..." : "Lưu Tour"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
