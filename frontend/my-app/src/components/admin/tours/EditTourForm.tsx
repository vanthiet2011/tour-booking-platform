"use client";

import { PlusCircle, Trash, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { mutate } from "swr";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
import uploadService from "@/services/upload.service";
import type { Tour, UpdateTourPayload } from "@/types/tour";
import type { Destination } from "@/types/destination";
import { MultiSelect } from "@/components/ui/multi-select";
import tourService from "@/services/tour.service";
import { getFullImageUrl } from "@/lib/utils";

const scheduleSchema = z.object({
  dayNumber: z.coerce.number().min(1),
  title: z.string().min(1, "Tiêu đề không được trống."),
  description: z.string().optional(),
});

const departureSchema = z.object({
  startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  endDate: z.string().min(1, "Ngày kết thúc là bắt buộc"),
  totalSlots: z.coerce.number().int().min(1, "Tổng số chỗ phải lớn hơn 0"),
});

const inclusionsSchema = z.object({
  included: z.array(z.string()).optional(),
  notIncluded: z.array(z.string()).optional(),
});

const formSchema = z.object({
  name: z.string().min(2, "Tên tour phải có ít nhất 2 ký tự."),
  description: z.string().optional(),
  pricePerAdult: z.coerce.number().min(0, "Giá người lớn phải là số dương"),
  pricePerChild: z.coerce.number().min(0, "Giá trẻ em phải là số dương"),
  duration: z.string().optional(),
  isBestseller: z.boolean().default(false),
  coverImageFile: z.custom<FileList>().optional(),
  galleryImageFiles: z.custom<FileList>().optional(),
  destinationIds: z.array(z.string()).min(1, "Phải chọn ít nhất một điểm đến."),
  schedules: z.array(scheduleSchema).optional(),
  highlights: z.array(z.string()).optional(),
  inclusions: inclusionsSchema.optional(),
  tourDepartures: z
    .array(departureSchema)
    .min(1, "Phải có ít nhất một ngày khởi hành"),
});

type TourFormValues = z.infer<typeof formSchema>;

interface EditTourFormProps {
  initialData: Tour;
  destinations: Destination[];
}

export function EditTourForm({ initialData, destinations }: EditTourFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const [coverPreview, setCoverPreview] = useState<string | null>(
    initialData.imageUrl || null
  );

  const [galleryPreviews, setGalleryPreviews] = useState<(string | File)[]>(
    initialData.galleryImages || []
  );

  const form = useForm<TourFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
      description: initialData.description || "",
      pricePerAdult: initialData.pricePerAdult,
      pricePerChild: initialData.pricePerChild,
      duration: initialData.duration || "",
      isBestseller: initialData.isBestseller,
      destinationIds: initialData.destinations?.map((d) => d.id) || [],
      schedules: initialData.schedules || [],
      highlights: initialData.highlights || [],
      inclusions: initialData.inclusions || { included: [], notIncluded: [] },
      tourDepartures:
        initialData.tourDepartures.map((d) => ({
          ...d,
          startDate: new Date(d.startDate).toISOString().split("T")[0],
          endDate: new Date(d.endDate).toISOString().split("T")[0],
        })) || [],
    },
  });

  const {
    fields: scheduleFields,
    append: appendSchedule,
    remove: removeSchedule,
  } = useFieldArray({
    control: form.control,
    name: "schedules",
  });

  const {
    fields: departureFields,
    append: appendDeparture,
    remove: removeDeparture,
  } = useFieldArray({
    control: form.control,
    name: "tourDepartures",
  });

  const onSubmit = async (values: TourFormValues) => {
    setIsUploading(true);
    try {
      let coverImageUrl =
        typeof coverPreview === "string" ? initialData.imageUrl : "";
      const existingGalleryUrls = galleryPreviews.filter(
        (p) => typeof p === "string"
      ) as string[];

      const coverFile = values.coverImageFile?.[0];
      if (coverFile) {
        const result = await uploadService.uploadImage(coverFile);
        coverImageUrl = result.filePath;
      }

      const newGalleryFiles = galleryPreviews.filter(
        (p) => p instanceof File
      ) as File[];

      let newGalleryUrls: string[] = [];
      if (newGalleryFiles.length > 0) {
        const result = await uploadService.uploadMultipleImages(
          newGalleryFiles
        );
        newGalleryUrls = result.filePaths;
      }

      const finalGalleryUrls = [...existingGalleryUrls, ...newGalleryUrls];

      const payload: UpdateTourPayload = {
        name: values.name,
        description: values.description,
        pricePerAdult: values.pricePerAdult,
        pricePerChild: values.pricePerChild,
        duration: values.duration,
        isBestseller: values.isBestseller,
        imageUrl: coverImageUrl,
        galleryImages: finalGalleryUrls,
        destinationIds: values.destinationIds,
        highlights: values.highlights || [],
        inclusions: {
          included: values.inclusions?.included || [],
          notIncluded: values.inclusions?.notIncluded || [],
        },
        schedules: values.schedules || [],
        tourDepartures: values.tourDepartures || [],
      };

      await tourService.update(initialData.id, payload);

      mutate("/api/tours");
      toast({
        title: "Thành công!",
        description: `Đã cập nhật tour.`,
      });
      router.push("/admin/tours");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi!",
        description: "Thao tác thất bại. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
      form.setValue("coverImageFile", e.target.files ?? undefined);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setGalleryPreviews((prev) => [...prev, ...newFiles]);
      e.target.value = "";
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    const item = galleryPreviews[indexToRemove];
    if (item instanceof File) {
    }
    setGalleryPreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Chỉnh sửa: {initialData.name}</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
          <div className="space-y-4 rounded-lg border p-4 bg-background">
            <FormLabel className="text-base font-semibold">
              Thông tin chung
            </FormLabel>
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
                control={form.control}
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

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="destinationIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Các điểm đến</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={destinations}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Chọn các điểm đến..."
                        valueKey="id"
                        labelKey="name"
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
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4 bg-background">
            <FormLabel className="text-base font-semibold">
              Ngày khởi hành
            </FormLabel>
            {departureFields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end rounded-md border bg-muted/50 p-3"
              >
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                  control={form.control}
                  name={`tourDepartures.${index}.totalSlots`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tổng số chỗ</FormLabel>
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
                  onClick={() => removeDeparture(index)}
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
                appendDeparture({
                  startDate: "",
                  endDate: "",
                  totalSlots: 10,
                })
              }
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm ngày khởi hành
            </Button>
          </div>

          <div className="space-y-4 rounded-lg border p-4 bg-background">
            <FormLabel className="text-base font-semibold">
              Thông tin chi tiết & Hình ảnh
            </FormLabel>
            <FormField
              control={form.control}
              name="highlights"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Điểm nổi bật (Mỗi dòng một ý)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mỗi đặc điểm trên một dòng..."
                      rows={4}
                      onChange={(e) =>
                        field.onChange(e.target.value.split("\n"))
                      }
                      defaultValue={field.value?.join("\n")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverImageFile"
              render={() => (
                <FormItem>
                  <FormLabel>Ảnh đại diện</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {coverPreview && (
              <div className="relative w-full aspect-[16/9] mt-2 rounded-md overflow-hidden border">
                <Image
                  src={
                    coverPreview.startsWith("blob:")
                      ? coverPreview
                      : getFullImageUrl(coverPreview)
                  }
                  alt="Cover Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="galleryImageFiles"
              render={() => (
                <FormItem>
                  <FormLabel>Thư viện ảnh</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryChange}
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-2">
                {galleryPreviews.map((p, index) => (
                  <div key={index} className="relative aspect-square group">
                    <Image
                      src={
                        typeof p === "string"
                          ? getFullImageUrl(p)
                          : URL.createObjectURL(p)
                      }
                      alt={`Gallery ${index}`}
                      fill
                      className="rounded-md object-cover border"
                      unoptimized
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeGalleryImage(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="inclusions.included"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bao gồm</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mỗi mục trên một dòng..."
                        rows={5}
                        onChange={(e) =>
                          field.onChange(e.target.value.split("\n"))
                        }
                        defaultValue={field.value?.join("\n")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inclusions.notIncluded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Không bao gồm</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mỗi mục trên một dòng..."
                        rows={5}
                        onChange={(e) =>
                          field.onChange(e.target.value.split("\n"))
                        }
                        defaultValue={field.value?.join("\n")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4 bg-background">
            <FormLabel className="text-base font-semibold">
              Lịch trình chi tiết
            </FormLabel>
            {scheduleFields.map((field, index) => (
              <div
                key={field.id}
                className="flex gap-2 items-start rounded-md border bg-muted/50 p-3"
              >
                <div className="flex-1 grid grid-cols-1 gap-y-2">
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
                  onClick={() => removeSchedule(index)}
                  className="mt-8 text-destructive"
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
                appendSchedule({
                  dayNumber: scheduleFields.length + 1,
                  title: "",
                  description: "",
                })
              }
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Thêm ngày
            </Button>
          </div>

          <div className="flex justify-end gap-2 sticky bottom-0 bg-background p-4 border-t z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/tours")}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || isUploading}
            >
              {form.formState.isSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
