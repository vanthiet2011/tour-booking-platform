import { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import { Trash2 } from "lucide-react";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiStepTourFormValues } from "../CreateTourForm";

// Zod schema không đổi
export const imagesSchema = z.object({
  coverImageFile: z.custom<FileList>().optional(),
  galleryImageFiles: z.custom<FileList>().optional(),
});

export function Step2_Images() {
  const { control, setValue } = useFormContext<MultiStepTourFormValues>();

  // State để lưu trữ URL xem trước
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Theo dõi sự thay đổi của các trường file trong form
  const coverFile = useWatch({ control, name: "coverImageFile" });
  const galleryFiles = useWatch({ control, name: "galleryImageFiles" });

  // Effect để tạo URL preview cho ảnh bìa
  useEffect(() => {
    if (coverFile && coverFile.length > 0) {
      const file = coverFile[0];
      const newUrl = URL.createObjectURL(file);
      setCoverPreview(newUrl);

      // Cleanup function để giải phóng bộ nhớ
      return () => URL.revokeObjectURL(newUrl);
    } else {
      setCoverPreview(null);
    }
  }, [coverFile]);

  // Effect để tạo URL preview cho thư viện ảnh
  useEffect(() => {
    if (galleryFiles && galleryFiles.length > 0) {
      const newUrls = Array.from(galleryFiles).map((file) =>
        URL.createObjectURL(file)
      );
      setGalleryPreviews(newUrls);

      // Cleanup function
      return () => newUrls.forEach((url) => URL.revokeObjectURL(url));
    } else {
      setGalleryPreviews([]);
    }
  }, [galleryFiles]);

  const removeGalleryImage = (indexToRemove: number) => {
    // Cập nhật lại FileList trong react-hook-form
    const currentFiles = Array.from(galleryFiles || []);
    const updatedFiles = currentFiles.filter(
      (_, index) => index !== indexToRemove
    );

    // Cần tạo một DataTransfer object để cập nhật FileList
    const dataTransfer = new DataTransfer();
    updatedFiles.forEach((file) => dataTransfer.items.add(file));

    setValue(
      "galleryImageFiles",
      dataTransfer.files.length > 0 ? dataTransfer.files : undefined
    );
  };

  return (
    <div className="space-y-6">
      {/* Ảnh đại diện */}
      <FormField
        control={control}
        name="coverImageFile"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ảnh đại diện</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => field.onChange(e.target.files)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {coverPreview && (
        <div className="relative w-full aspect-[16/9] mt-2 rounded-md overflow-hidden">
          <Image
            src={coverPreview}
            alt="Cover Preview"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Thư viện ảnh */}
      <FormField
        control={control}
        name="galleryImageFiles"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Thư viện ảnh</FormLabel>
            <FormControl>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => field.onChange(e.target.files)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {galleryPreviews.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-2">
          {galleryPreviews.map((url, index) => (
            <div key={url} className="relative aspect-square">
              <Image
                src={url}
                alt={`Preview ${index}`}
                fill
                className="rounded-md object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full z-10"
                onClick={() => removeGalleryImage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
