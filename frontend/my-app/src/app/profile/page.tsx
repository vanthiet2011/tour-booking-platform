"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User, Camera } from "lucide-react";

const profileSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface Profile {
  id: string;
  fullName: string | null;
  phoneNumber: string | null;
  address: string | null;
  gender: string | null;
  avatarUrl: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      address: "",
      gender: undefined,
    },
  });

  // Load profile from API
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5002/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Không thể tải hồ sơ");

        const data: Profile = await res.json();
        setProfile(data);
        setUser(data);
        form.reset({
          fullName: data.fullName || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          gender: (data.gender as any) || undefined,
        });
      } catch (err: any) {
        console.error(err);
        toast({
          title: "Lỗi",
          description: err.message || "Không thể tải hồ sơ",
          variant: "destructive",
        });
      }
    };

    loadProfile();
  }, [token, router, form, toast]);

  // Submit form
  const handleSubmit = async (data: ProfileForm) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5002/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: data.fullName,
          phoneNumber: data.phoneNumber || null,
          address: data.address || null,
          gender: data.gender || null,
          avatarUrl: profile?.avatarUrl || null,
        }),
      });

      if (!res.ok) throw new Error("Cập nhật hồ sơ thất bại");

      toast({
        title: "Thành công",
        description: "Cập nhật hồ sơ thành công",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Lỗi",
        description: err.message || "Không thể cập nhật hồ sơ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-semibold">Đang tải...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Hồ sơ cá nhân</h1>
          <Button variant="outline" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl">
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
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
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  placeholder="Nguyễn Văn A"
                  {...form.register("fullName")}
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  placeholder="0123456789"
                  {...form.register("phoneNumber")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                  id="address"
                  placeholder="123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh"
                  {...form.register("address")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <Select
                  value={form.watch("gender") || ""}
                  onValueChange={(value) =>
                    form.setValue("gender", value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="flex-1"
                >
                  Quay lại trang chủ
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
