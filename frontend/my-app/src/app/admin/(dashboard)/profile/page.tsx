"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Camera, ShieldCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const profileSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống").nullable(),
  phoneNumber: z.string().nullable(),
  address: z.string().nullable(),
  gender: z.enum(["Male", "Female", "Other"]).nullable(),
  dateOfBirth: z.date().nullable(),
  avatarUrl: z.string().nullable().or(z.literal("")),
});

type Gender = "Male" | "Female" | "Other";
type ProfileForm = z.infer<typeof profileSchema>;

export default function AdminProfilePage() {
  const router = useRouter();
  const { user, updateUser, isLoading: isAuthLoading } = useAuth();
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

  const hasFetched = useRef(false);
  const loadProfile = useCallback(async () => {
    setIsProfileLoading(true);
    try {
      const data = await userService.getMe();
      if (data) {
        form.reset({
          fullName: data.fullName || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          gender: (data.gender as Gender) || null,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          avatarUrl: data.avatarUrl || "",
        });
        if (data.avatarUrl) setAvatarPreview(data.avatarUrl);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast({
          title: "Thông tin trống",
          description: "Vui lòng cập nhật thông tin hồ sơ Quản trị viên.",
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể kết nối đến máy chủ.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push("/admin/login");
      return;
    }
    if (!hasFetched.current) {
      loadProfile();
      hasFetched.current = true;
    }
  }, [user, isAuthLoading, router, loadProfile]);

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
        const uploadResult = await uploadService.uploadImage(avatarFile);
        finalAvatarUrl = uploadResult.filePath;
      }

      await userService.updateMe({
        ...data,
        avatarUrl: finalAvatarUrl,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : null,
      });

      updateUser({
        fullName: data.fullName,
        avatarUrl: finalAvatarUrl,
      });

      toast({
        title: "Thành công",
        description: "Hồ sơ Admin đã được cập nhật.",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Cập nhật thất bại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm text-muted-foreground font-medium">
          Đang tải hồ sơ Quản trị...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header Page */}
      <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Hồ sơ cá nhân
          </h1>
          <p className="text-sm text-muted-foreground dark:text-slate-400">
            Quản lý thông tin tài khoản Quản trị viên
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800">
          <ShieldCheck size={16} />
          <span className="text-xs font-bold uppercase">Administrator</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái: Ảnh đại diện & Email */}
        <Card className="lg:col-span-1 h-fit shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-800 shadow-xl">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="text-3xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400">
                    <User className="w-16 h-16" />
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  className="hidden"
                  accept="image/*"
                />
                <Button
                  type="button"
                  size="sm"
                  className="absolute bottom-1 right-1 rounded-full w-10 h-10 p-0 bg-emerald-600 hover:bg-emerald-700 shadow-lg border-2 border-white dark:border-slate-800"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <Camera className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <CardTitle className="text-xl font-bold dark:text-slate-100">
              {form.getValues("fullName") || "Admin"}
            </CardTitle>
            <CardDescription className="font-medium text-emerald-600 dark:text-emerald-400">
              {user?.email}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Cột phải: Form thông tin chi tiết */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg text-center dark:text-slate-100">
              Thông tin chi tiết
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold dark:text-slate-300">
                    Họ và tên
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Nguyễn Văn A"
                    {...form.register("fullName")}
                    className="focus-visible:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Ngày sinh
                  </Label>
                  <Controller
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => {
                      const currentDate = field.value
                        ? new Date(field.value)
                        : null;

                      const day = currentDate
                        ? currentDate.getDate().toString()
                        : "";
                      const month = currentDate
                        ? (currentDate.getMonth() + 1).toString()
                        : "";
                      const year = currentDate
                        ? currentDate.getFullYear().toString()
                        : "";

                      const handleSelectChange = (
                        type: "day" | "month" | "year",
                        val: string
                      ) => {
                        const newDay =
                          type === "day"
                            ? parseInt(val)
                            : day
                            ? parseInt(day)
                            : 1;
                        const newMonth =
                          type === "month"
                            ? parseInt(val) - 1
                            : month
                            ? parseInt(month) - 1
                            : 0;
                        const newYear =
                          type === "year"
                            ? parseInt(val)
                            : year
                            ? parseInt(year)
                            : 2000;

                        // Tạo đối tượng Date mới (tháng trong JS tính từ 0-11)
                        const newDate = new Date(newYear, newMonth, newDay);
                        field.onChange(newDate);
                      };

                      return (
                        <div className="grid grid-cols-3 gap-2">
                          {/* Ngày */}
                          <Select
                            value={day}
                            onValueChange={(v) => handleSelectChange("day", v)}
                          >
                            <SelectTrigger className="border-slate-200 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
                              <SelectValue placeholder="Ngày" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 31 }, (_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>
                                  {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Tháng */}
                          <Select
                            value={month}
                            onValueChange={(v) =>
                              handleSelectChange("month", v)
                            }
                          >
                            <SelectTrigger className="border-slate-200 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
                              <SelectValue placeholder="Tháng" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>
                                  Tháng {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Năm */}
                          <Select
                            value={year}
                            onValueChange={(v) => handleSelectChange("year", v)}
                          >
                            <SelectTrigger className="border-slate-200 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
                              <SelectValue placeholder="Năm" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                              {Array.from({ length: 100 }, (_, i) => {
                                const y = new Date().getFullYear() - i;
                                return (
                                  <SelectItem key={y} value={String(y)}>
                                    {y}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phoneNumber"
                    className="text-sm font-semibold dark:text-slate-300"
                  >
                    Số điện thoại
                  </Label>
                  <Input
                    id="phoneNumber"
                    placeholder="090..."
                    {...form.register("phoneNumber")}
                    className="focus-visible:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-semibold dark:text-slate-300">
                    Giới tính
                  </Label>
                  <Controller
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold dark:text-slate-300">
                  Địa chỉ liên hệ
                </Label>
                <Input
                  id="address"
                  placeholder="TP. Hồ Chí Minh"
                  {...form.register("address")}
                  className="focus-visible:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[150px] bg-emerald-600 hover:bg-emerald-700 font-bold shadow-md transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
