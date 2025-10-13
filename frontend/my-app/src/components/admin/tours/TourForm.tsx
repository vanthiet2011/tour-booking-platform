"use client";

import { PlusCircle, Trash, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSWR, { mutate } from "swr";
import Cookies from "js-cookie";
import Image from "next/image"; // Import Image component

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
  uploadFile, // Giữ lại để upload ảnh bìa
  uploadMultipleFiles, // Import hàm upload nhiều file
  Tour,
  CreateTourPayload,
} from "@/lib/api";
import { MultiSelect } from "@/components/ui/multi-select";

// --- ZOD SCHEMA ---
const scheduleSchema = z.object({
  dayNumber: z.coerce.number().min(1),
  title: z.string().min(1, "Tiêu đề không được trống."),
  description: z.string().optional(),
});

const inclusionsSchema = z.object({
  included: z.array(z.string()).optional(),
  notIncluded: z.array(z.string()).optional(),
});

const formSchema = z.object({
  name: z.string().min(2, "Tên tour phải có ít nhất 2 ký tự."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Giá phải là số dương."),
  capacity: z.coerce.number().int().min(1, "Sức chứa phải lớn hơn 0."),
  duration: z.string().optional(),
  isBestseller: z.boolean().default(false),
  // Các trường nhận file từ input
  coverImageFile: z.custom<FileList>().optional(),
  galleryImageFiles: z.custom<FileList>().optional(),
  // Các trường dữ liệu khác
  destinationIds: z.array(z.string()).min(1, "Phải chọn ít nhất một điểm đến."),
  schedules: z.array(scheduleSchema).optional(),
  highlights: z.array(z.string()).optional(),
  inclusions: inclusionsSchema.optional(),
});

type TourFormValues = z.infer<typeof formSchema>;

interface TourFormProps {
  isOpen: boolean;
  onClose: () => void;
  tour: Tour | null;
}

// === COMPONENT CHÍNH ===
export function TourForm({ isOpen, onClose, tour }: TourFormProps) {
  const { toast } = useToast();
  const { data: destinations } = useSWR("/api/destinations", getDestinations);
  const [isUploading, setIsUploading] = useState(false);

  // State quản lý ảnh preview
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<(string | File)[]>([]);

  const form = useForm<TourFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {}, // Sẽ reset trong useEffect
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedules",
  });
  const isEditing = !!tour;

  // Effect để reset form và state khi mở dialog
  useEffect(() => {
    if (isOpen) {
      if (isEditing && tour) {
        form.reset({
          name: tour.name,
          description: tour.description,
          price: tour.price,
          capacity: tour.capacity,
          duration: tour.duration,
          isBestseller: tour.isBestseller,
          destinationIds:
            tour.tourDestinations?.map((td) => td.destination.id) || [],
          schedules: tour.tourSchedules || [],
          highlights: tour.highlights || [],
          inclusions: tour.inclusions || { included: [], notIncluded: [] },
        });
        setCoverPreview(tour.imageUrl || null);
        setGalleryPreviews(tour.galleryImages || []);
      } else {
        form.reset({
          name: "",
          description: "",
          price: 0,
          capacity: 10,
          duration: "",
          isBestseller: false,
          destinationIds: [],
          schedules: [],
          highlights: [],
          inclusions: { included: [], notIncluded: [] },
        });
        setCoverPreview(null);
        setGalleryPreviews([]);
      }
    }
  }, [tour, isEditing, isOpen, form]);

  // Logic Submit đã được gộp và tối ưu
  const onSubmit = async (values: TourFormValues) => {
    setIsUploading(true);
    try {
      let coverImageUrl = tour?.imageUrl || "";
      let finalGalleryUrls = galleryPreviews.filter(
        (p) => typeof p === "string"
      ) as string[];

      // 1. Upload ảnh bìa mới
      if (values.coverImageFile && values.coverImageFile.length > 0) {
        const formData = new FormData();
        formData.append("file", values.coverImageFile[0]);
        const result = await uploadFile(formData); // Giả sử uploadFile trả về { filePath: '...' }
        coverImageUrl = result.filePath;
      }

      // 2. Upload các ảnh mới trong thư viện
      const newGalleryFiles = galleryPreviews.filter(
        (p) => p instanceof File
      ) as File[];
      if (newGalleryFiles.length > 0) {
        const formData = new FormData();
        newGalleryFiles.forEach((file) => formData.append("files", file));
        const result = await uploadMultipleFiles(formData); // result là một object { filePaths: [...] }
        const newUrls = result.filePaths; // Lấy ra mảng các đường dẫn
        finalGalleryUrls.push(...newUrls); // Đúng: "Trải" một mảng
      }

      // 3. Chuẩn bị payload cuối cùng
      const payload: CreateTourPayload = {
        ...values,
        imageUrl: coverImageUrl,
        galleryImages: finalGalleryUrls,
        schedules: values.schedules || [],
        highlights: values.highlights || [],
        inclusions: {
          included: values.inclusions?.included || [],
          notIncluded: values.inclusions?.notIncluded || [],
        },
      };

      // 4. Gửi request tạo mới hoặc cập nhật
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
        description: "Thao tác thất bại. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Các hàm xử lý UI cho việc chọn và xóa ảnh
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

  const destinationOptions =
    destinations?.map((d) => ({ value: d.id, label: d.name })) || [];

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
                    // SỬA LẠI DÒNG NÀY
                    src={
                      coverPreview.startsWith("http")
                        ? coverPreview
                        : `http://localhost:5003/${coverPreview}`
                    }
                    alt="Preview"
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              )}

              {/* Thư viện ảnh */}
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
                        // VÀ SỬA LẠI DÒNG NÀY
                        src={
                          typeof p === "string"
                            ? p.startsWith("http")
                              ? p
                              : `http://localhost:5003/${p}`
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

            <div className="space-y-4 rounded-lg border p-4">
              <FormLabel className="text-base font-semibold">
                Lịch trình chi tiết
              </FormLabel>
              {fields.map((field, index) => (
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
                    onClick={() => remove(index)}
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
                  append({
                    dayNumber: fields.length + 1,
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
