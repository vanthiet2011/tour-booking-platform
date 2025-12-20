// src/components/admin/tours/steps/Step2_Images.tsx
import { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { TourFormValues } from "@/types/tour";
import * as z from "zod";
import Image from "next/image";
import { Trash2, Image as ImageIcon } from "lucide-react";
import { getFullImageUrl } from "@/lib/utils";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const imagesSchema = z.object({
  coverImageFile: z.custom<FileList>().optional(),
  galleryImageFiles: z.custom<FileList>().optional(),
});

export function Step2_Images() {
  const { control, setValue } = useFormContext<TourFormValues>();

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const coverFile = useWatch({ control, name: "coverImageFile" });
  const galleryFiles = useWatch({ control, name: "galleryImageFiles" });

  const existingCoverUrl = useWatch({ control, name: "imageUrl" });
  const existingGalleryUrls = useWatch({ control, name: "galleryImages" });

  useEffect(() => {
    if (coverFile && coverFile.length > 0) {
      const file = coverFile[0];
      const newUrl = URL.createObjectURL(file);
      setCoverPreview(newUrl);
      return () => URL.revokeObjectURL(newUrl);
    } else if (existingCoverUrl) {
      setCoverPreview(getFullImageUrl(existingCoverUrl));
    } else {
      setCoverPreview(null);
    }
  }, [coverFile, existingCoverUrl]);

  useEffect(() => {
    const newFileUrls =
      galleryFiles && galleryFiles.length > 0
        ? Array.from(galleryFiles).map((file) =>
            URL.createObjectURL(file as File)
          )
        : [];

    const oldUrls = Array.isArray(existingGalleryUrls)
      ? existingGalleryUrls.map((url: string) => getFullImageUrl(url))
      : [];

    if (galleryFiles && galleryFiles.length > 0) {
      setGalleryPreviews(newFileUrls);
    } else {
      setGalleryPreviews(oldUrls);
    }

    return () => newFileUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [galleryFiles, existingGalleryUrls]);

  const removeGalleryImage = (indexToRemove: number) => {
    if (galleryFiles && galleryFiles.length > 0) {
      const currentFiles = Array.from(galleryFiles || []);
      const updatedFiles = currentFiles.filter(
        (_, index) => index !== indexToRemove
      );
      const dataTransfer = new DataTransfer();
      updatedFiles.forEach((file) => dataTransfer.items.add(file as File));
      setValue(
        "galleryImageFiles",
        dataTransfer.files.length > 0 ? dataTransfer.files : undefined,
        { shouldDirty: true }
      );
    } else {
      const currentUrls = existingGalleryUrls || [];
      const updatedUrls = currentUrls.filter(
        (_: string, index: number) => index !== indexToRemove
      );
      setValue("galleryImages", updatedUrls, { shouldDirty: true });
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="coverImageFile"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ảnh đại diện (Bìa)</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {coverPreview ? (
                  <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                    <Image
                      src={coverPreview}
                      alt="Cover Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full aspect-video rounded-md border border-dashed bg-muted/50">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>Chưa có ảnh bìa</p>
                    </div>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => field.onChange(e.target.files)}
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="galleryImageFiles"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Thư viện ảnh</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const newFiles = e.target.files;
                    if (newFiles && newFiles.length > 0) {
                      const dataTransfer = new DataTransfer();
                      Array.from(newFiles).forEach((file) =>
                        dataTransfer.items.add(file)
                      );
                      field.onChange(dataTransfer.files);
                      e.target.value = "";
                    }
                  }}
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                />
                <p className="text-xs text-muted-foreground">
                  Chọn ảnh mới sẽ thay thế danh sách hiển thị bên dưới.
                </p>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {galleryPreviews.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {galleryPreviews.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative aspect-square group"
            >
              <Image
                src={url}
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
    </div>
  );
}
