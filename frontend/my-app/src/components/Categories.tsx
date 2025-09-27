import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  userId: string;
  fullName: string | null;
  phoneNumber: string | null;
  address: string | null;
  gender: string | null;
  avatarUrl: string | null;
}

const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      address: "",
      gender: undefined,
    },
  });

  const token = localStorage.getItem("token");

  // Lấy thông tin user + profile
  useEffect(() => {
    const checkUserAndLoadProfile = async () => {
      if (!token) {
        navigate("/auth");
        return;
      }

      try {
        // Lấy user từ session
        const resUser = await fetch("http://localhost:5000/api/auth/session", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resUser.ok) {
          navigate("/auth");
          return;
        }

        const userData = await resUser.json();
        setUser(userData);

        // Lấy profile
        const resProfile = await fetch(
          `http://localhost:5000/api/profiles/${userData.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (resProfile.ok) {
          const p = await resProfile.json();
          setProfile(p);
          form.reset({
            fullName: p.fullName || "",
            phoneNumber: p.phoneNumber || "",
            address: p.address || "",
            gender: p.gender || undefined,
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin hồ sơ",
          variant: "destructive",
        });
      }
    };

    checkUserAndLoadProfile();
  }, [navigate, token, form, toast]);

  // Submit cập nhật
  const handleSubmit = async (data: ProfileForm) => {
    if (!user) return;
    setIsLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/profiles/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          address: data.address,
          gender: data.gender,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      toast({
        title: "Thành công",
        description: "Cập nhật hồ sơ thành công",
      });

      navigate("/");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật hồ sơ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Đăng xuất
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Đang tải...</h2>
        </div>
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
                  onValueChange={(value: string) =>
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
                  onClick={() => navigate("/")}
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
};

export default ProfilePage;
