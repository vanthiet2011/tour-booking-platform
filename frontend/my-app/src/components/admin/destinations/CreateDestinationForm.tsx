"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createDestination, CreateDestinationPayload } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Định nghĩa schema validation
const formSchema = z.object({
  name: z.string().min(2, "Tên điểm đến phải có ít nhất 2 ký tự."),
  description: z.string().optional(),
  imageUrl: z.string().url("URL hình ảnh không hợp lệ.").optional(),
  region: z.string().min(1, "Vui lòng chọn vùng miền."),
});

export function CreateDestinationForm() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      region: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload: CreateDestinationPayload = {
        name: values.name,
        description: values.description,
        imageUrl: values.imageUrl,
        region: values.region,
      };
      await createDestination(payload);
      toast({
        title: "Thành công!",
        description: "Đã tạo điểm đến mới.",
      });
      // Reset form hoặc chuyển hướng
      form.reset();
      // Tùy chọn: router.push('/admin/destinations'); để xem danh sách
    } catch (error) {
      toast({
        title: "Lỗi!",
        description:
          error instanceof Error ? error.message : "Không thể tạo điểm đến.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                <Textarea placeholder="Mô tả ngắn về điểm đến..." {...field} />
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
              <FormLabel>URL Hình ảnh</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Đang lưu..." : "Tạo điểm đến"}
        </Button>
      </form>
    </Form>
  );
}
