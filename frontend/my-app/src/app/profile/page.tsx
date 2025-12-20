"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, User, Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import userService from "@/services/user.service";
import uploadService from "@/services/upload.service";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  fullName: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  address: z.string().nullable(),
  gender: z.enum(["Male", "Female", "Other"]).nullable(),
  dateOfBirth: z.date().nullable(),
  avatarUrl: z.string().url().nullable().or(z.literal("")),
});

type Gender = "Male" | "Female" | "Other";

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      address: "",
      gender: null,
      dateOfBirth: null,
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const loadProfile = async () => {
      setIsProfileLoading(true);
      try {
        const data = await userService.getMe();
        form.reset({
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          address: data.address,
          gender: data.gender as Gender | null,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          avatarUrl: data.avatarUrl,
        });
        if (data.avatarUrl) {
          setAvatarPreview(data.avatarUrl);
        }
      } catch {
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin hồ sơ của bạn.",
          variant: "destructive",
        });
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadProfile();
  }, [user, isAuthLoading, router, form, toast]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setIsSubmitting(true);
    let finalAvatarUrl = form.getValues("avatarUrl");

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadResult = await uploadService.uploadImage(avatarFile);
        finalAvatarUrl = uploadResult.filePath;
      }

      await userService.updateMe({
        ...data,
        avatarUrl: finalAvatarUrl,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : null,
      });

      toast({
        title: "Thành công",
        description: "Hồ sơ của bạn đã được cập nhật.",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật hồ sơ.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || isProfileLoading) {
    return <div className="container mx-auto p-4">Đang tải...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/50 min-h-screen">
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Card>
          <CardHeader className="text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/png, image/jpeg, image/gif"
            />
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="text-2xl">
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardTitle>Cập nhật thông tin</CardTitle>
            <CardDescription>
              Điền thông tin cá nhân để hoàn thiện hồ sơ
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input id="fullName" {...form.register("fullName")} />
              </div>

              <div className="space-y-2">
                <Label>Ngày sinh</Label>
                <Controller
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "dd-MM-yyyy")
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input id="phoneNumber" {...form.register("phoneNumber")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input id="address" {...form.register("address")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <Controller
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(value: Gender) => field.onChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Nam</SelectItem>
                        <SelectItem value="Female">Nữ</SelectItem>
                        <SelectItem value="Other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
