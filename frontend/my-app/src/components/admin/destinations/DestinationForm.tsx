// src/components/admin/destinations/DestinationForm.tsx

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { mutate } from "swr";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createDestination,
  updateDestination,
  Destination,
  CreateDestinationPayload,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DestinationFormProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination | null;
}

const formSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự."),
  description: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  region: z.string().min(1, "Vui lòng chọn vùng miền."),
  isPopular: z.boolean().default(false),
});

export function DestinationForm({
  isOpen,
  onClose,
  destination,
}: DestinationFormProps) {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string | undefined>("");
  const [isUploading, setIsUploading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      region: "",
      isPopular: false,
    },
  });

  const isEditing = !!destination;

  useEffect(() => {
    if (isOpen) {
      if (isEditing && destination) {
        form.reset(destination);
        setImageUrl(destination.imageUrl);
      } else {
        form.reset({
          name: "",
          description: "",
          imageUrl: "",
          region: "",
          isPopular: false,
        });
        setImageUrl("");
      }
    }
  }, [destination, isEditing, isOpen, form]);

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
          headers: {
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setImageUrl(data.url);
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
    console.log("Submitting form with values:", values);
    try {
      const payload: CreateDestinationPayload = {
        ...values,
        imageUrl: imageUrl,
      };
      if (isEditing && destination) {
        await updateDestination(destination.id, payload);
      } else {
        await createDestination(payload);
      }

      mutate("/api/destinations");
      toast({
        title: "Thành công!",
        description: `Đã ${isEditing ? "cập nhật" : "tạo mới"} điểm đến.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Lỗi!",
        description:
          error instanceof Error ? error.message : "Thao tác thất bại.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa Điểm đến" : "Tạo Điểm đến mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên điểm đến</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Vịnh Hạ Long" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả ngắn về điểm đến..."
                      {...field}
                    />
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
                        className="mb-2"
                        disabled={isUploading}
                      />
                      {isUploading && (
                        <p className="text-sm text-muted-foreground">
                          Đang tải lên...
                        </p>
                      )}
                      {field.value && (
                        <div className="mt-2 relative">
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="w-full h-auto rounded-md border"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vùng miền</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vùng miền" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Miền Bắc">Miền Bắc</SelectItem>
                      <SelectItem value="Miền Trung">Miền Trung</SelectItem>
                      <SelectItem value="Miền Nam">Miền Nam</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPopular"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Điểm đến phổ biến?</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isUploading}
              >
                {form.formState.isSubmitting ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
