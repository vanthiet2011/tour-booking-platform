"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { mutate } from "swr";
import { CreateTourPayload } from "@/types/tour";
import uploadService from "@/services/upload.service";
import tourService from "@/services/tour.service";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

import {
  Step1_GeneralInfo,
  generalInfoSchema,
} from "./steps/Step1_GeneralInfo";
import { Step2_Images, imagesSchema } from "./steps/Step2_Images";
import { Step3_Itinerary, itinerarySchema } from "./steps/Step3_Itinerary";

const multiStepTourSchema = generalInfoSchema
  .merge(imagesSchema)
  .merge(itinerarySchema);
export type MultiStepTourFormValues = z.infer<typeof multiStepTourSchema>;

const initialValues: MultiStepTourFormValues = {
  name: "",
  duration: "",
  pricePerAdult: 0,
  pricePerChild: 0,
  description: "",
  destinationIds: [],
  isBestseller: false,
  tourDepartures: [{ startDate: "", endDate: "", totalSlots: 10 }],
  highlights: [],
  inclusions: { included: [], notIncluded: [] },
  coverImageFile: undefined,
  galleryImageFiles: undefined,
  schedules: [{ dayNumber: 1, title: "", description: "" }],
};

const stepFields = [
  Object.keys(generalInfoSchema.shape),
  Object.keys(imagesSchema.shape),
  Object.keys(itinerarySchema.shape),
];

export function CreateTourForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MultiStepTourFormValues>({
    resolver: zodResolver(multiStepTourSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  const { trigger, handleSubmit } = form;

  const handleFinalSubmit = async (values: MultiStepTourFormValues) => {
    setIsSubmitting(true);
    try {
      let coverImageUrl = "";
      let galleryUrls: string[] = [];

      if (values.coverImageFile && values.coverImageFile.length > 0) {
        const result = await uploadService.uploadImage(
          values.coverImageFile[0]
        );
        coverImageUrl = result.filePath;
      }

      if (values.galleryImageFiles && values.galleryImageFiles.length > 0) {
        const files = Array.from(values.galleryImageFiles);
        const result = await uploadService.uploadMultipleImages(files);
        galleryUrls = result.filePaths;
      }

      const payload: CreateTourPayload = {
        name: values.name,
        description: values.description,
        pricePerAdult: values.pricePerAdult,
        pricePerChild: values.pricePerChild,
        duration: values.duration,
        isBestseller: values.isBestseller || false,
        destinationIds: values.destinationIds,
        tourDepartures: values.tourDepartures,
        imageUrl: coverImageUrl,
        galleryImages: galleryUrls,
        highlights: values.highlights || [],
        schedules: values.schedules || [],
        inclusions: {
          included: values.inclusions?.included || [],
          notIncluded: values.inclusions?.notIncluded || [],
        },
      };

      await tourService.create(payload);
      mutate("/api/tours");
      toast({ title: "Thành công!", description: "Đã tạo tour mới." });
      router.push("/admin/tours");
    } catch {
      toast({
        title: "Lỗi!",
        description: "Tạo tour thất bại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = async () => {
    console.log("Attempting to go to next step...");
    const fields = stepFields[currentStep - 1];
    const isValid = await trigger(fields as (keyof MultiStepTourFormValues)[]);
    console.log("Validation result for this step:", isValid); // BÁO CÁO 2

    if (isValid) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log("Validation failed. Errors:", form.formState.errors);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-8">
          <div className="flex justify-between">
            <div
              className={`w-1/3 text-center ${
                currentStep >= 1 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Thông tin chung
            </div>
            <div
              className={`w-1/3 text-center ${
                currentStep >= 2 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Hình ảnh
            </div>
            <div
              className={`w-1/3 text-center ${
                currentStep >= 3 ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Lịch trình
            </div>
          </div>
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/20">
              <div
                style={{ width: `${(currentStep / 3) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>

        {currentStep === 1 && <Step1_GeneralInfo />}
        {currentStep === 2 && <Step2_Images />}
        {currentStep === 3 && <Step3_Itinerary />}

        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
          >
            Quay lại
          </Button>

          {currentStep < 3 ? (
            <Button type="button" onClick={handleNextStep}>
              Tiếp tục
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit(handleFinalSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Hoàn tất & Tạo Tour"}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
