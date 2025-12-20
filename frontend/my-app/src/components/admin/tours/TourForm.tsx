"use client";

import { PlusCircle, Trash, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Destination } from "@/types/destination";
import * as z from "zod";
import useSWR, { mutate } from "swr";
import Image from "next/image";

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
import uploadService from "@/services/upload.service";
import type { Tour, CreateTourPayload } from "@/types/tour";
import { MultiSelect } from "@/components/ui/multi-select";
import destinationService from "@/services/destination.service";
import tourService from "@/services/tour.service";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const scheduleSchema = z.object({
  dayNumber: z.coerce.number().min(1),
  title: z.string().min(1, "Tiêu đề không được trống."),
  description: z.string().optional(),
});

const departureSchema = z.object({
  startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  endDate: z.string().min(1, "Ngày kết thúc là bắt buộc"),
  availableSlots: z.coerce.number().int().min(1, "Số chỗ phải lớn hơn 0"),
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

interface TourFormProps {
  isOpen: boolean;
  onClose: () => void;
  tour: Tour | null;
}

export function TourForm({ isOpen, onClose, tour }: TourFormProps) {
  const { toast } = useToast();

  const { data: destinationsData } = useSWR(
    "/api/destinations?page=1&pageSize=999",
    () => {
      const params = { page: 1, limit: 999 };
      return destinationService.getAll(params);
    }
  );
  const destinationOptions = destinationsData?.items || [];

  const [isUploading, setIsUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<(string | File)[]>([]);

  const form = useForm<TourFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
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

  const isEditing = !!tour;

  useEffect(() => {
    if (isOpen) {
      if (isEditing && tour) {
        form.reset({
          name: tour.name,
          description: tour.description,
          pricePerAdult: tour.pricePerAdult,
          pricePerChild: tour.pricePerChild,
          duration: tour.duration,
          isBestseller: tour.isBestseller,
          destinationIds: tour.destinations?.map((d) => d.id) || [],
          schedules: tour.schedules || [],
          highlights: tour.highlights || [],
          inclusions: tour.inclusions || { included: [], notIncluded: [] },
          tourDepartures:
            tour.tourDepartures.map((d) => ({
              ...d,
              startDate: new Date(d.startDate).toISOString().split("T")[0],
              endDate: new Date(d.endDate).toISOString().split("T")[0],
            })) || [],
        });
        setCoverPreview(tour.imageUrl || null);
        setGalleryPreviews(tour.galleryImages || []);
      } else {
        form.reset({
          name: "",
          description: "",
          pricePerAdult: 0,
          pricePerChild: 0,
          duration: "",
          isBestseller: false,
          destinationIds: [],
          schedules: [],
          highlights: [],
          inclusions: { included: [], notIncluded: [] },
          tourDepartures: [],
        });
        setCoverPreview(null);
        setGalleryPreviews([]);
      }
    }
  }, [tour, isEditing, isOpen, form]);

  const onSubmit = async (values: TourFormValues) => {
    setIsUploading(true);
    try {
      let coverImageUrl = tour?.imageUrl || "";
      const finalGalleryUrls = galleryPreviews.filter(
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
      if (newGalleryFiles.length > 0) {
        const result = await uploadService.uploadMultipleImages(
          newGalleryFiles
        );
        finalGalleryUrls.push(...result.filePaths);
      }

      const payload: CreateTourPayload = {
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

      if (isEditing && tour) {
        await tourService.update(tour.id, payload);
      } else {
        await tourService.create(payload);
      }

      mutate("/api/tours");
      toast({
        title: "Thành công!",
        description: `Đã ${isEditing ? "cập nhật" : "tạo mới"} tour.`,
      });
      onClose();
    } catch {
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
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    const item = galleryPreviews[indexToRemove];
    if (item instanceof File) {
      URL.revokeObjectURL(item.name);
    }
    setGalleryPreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa Tour" : "Tạo Tour Mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 py-4"
          >
            <div className="space-y-4 rounded-lg border p-4">
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
                          options={destinationOptions}
                          value={field.value}
                          onChange={field.onChange}
                          valueKey="id"
                          labelKey="name"
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
            <div className="space-y-4 rounded-lg border p-4">
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
                    availableSlots: 10,
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm ngày khởi hành
              </Button>
            </div>
            <div className="space-y-4 rounded-lg border p-4">
              <FormLabel className="text-base font-semibold">
                Thông tin chi tiết
              </FormLabel>
              <FormField
                control={form.control}
                name="highlights"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Điểm nổi bật</FormLabel>
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
                <div className="relative w-full aspect-[16/9] mt-2">
                  <Image
                    src={
                      coverPreview.startsWith("blob:") ||
                      coverPreview.startsWith("http")
                        ? coverPreview
                        : `${API_BASE_URL}/${coverPreview}`
                    }
                    alt="Preview"
                    fill
                    className="rounded-md object-cover"
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
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={
                          typeof p === "string"
                            ? p.startsWith("http")
                              ? p
                              : `${API_BASE_URL}/${p}`
                            : URL.createObjectURL(p)
                        }
                        alt={`Preview ${index}`}
                        fill
                        className="rounded-md object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                        onClick={() => removeGalleryImage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
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
                          placeholder="MDù mỗi mục trên một dòng..."
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

            <div className="space-y-4 rounded-lg border p-4">
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
