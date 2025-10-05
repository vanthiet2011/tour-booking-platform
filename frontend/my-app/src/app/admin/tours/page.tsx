"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  PlusCircle,
  Pencil,
  Trash2,
  ListOrdered,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { createDestination } from "@/lib/api"; // ✅ Import hàm API

// Dữ liệu mẫu (sẽ được thay thế bằng dữ liệu thật từ API)
const mockTours = [
  {
    id: "TOUR001",
    title: "Khám phá Vịnh Hạ Long - Du thuyền 5 sao",
    price: 3500000,
    duration: 3,
    capacity: 20,
    schedules: 5,
  },
  {
    id: "TOUR002",
    title: "Chinh phục nóc nhà Đông Dương - Sapa",
    price: 2800000,
    duration: 4,
    capacity: 15,
    schedules: 3,
  },
  {
    id: "TOUR003",
    title: "Nghỉ dưỡng tại đảo ngọc Phú Quốc",
    price: 4200000,
    duration: 4,
    capacity: 30,
    schedules: 8,
  },
];

const mockDestinations = [
  { id: "DEST01", name: "Vịnh Hạ Long", region: "Miền Bắc", isPopular: true },
  { id: "DEST02", name: "Sapa", region: "Miền Bắc", isPopular: true },
  { id: "DEST03", name: "Phú Quốc", region: "Miền Nam", isPopular: true },
  { id: "DEST04", name: "Hội An", region: "Miền Trung", isPopular: false },
  { id: "DEST05", name: "Đà Lạt", region: "Tây Nguyên", isPopular: false },
];

// ✅ Định nghĩa schema validation cho form điểm đến
const destinationSchema = z.object({
  name: z.string().min(3, "Tên điểm đến phải có ít nhất 3 ký tự."),
  region: z.string({ required_error: "Vui lòng chọn khu vực." }),
  description: z.string().optional(),
  imageUrl: z
    .string()
    .url("URL hình ảnh không hợp lệ.")
    .optional()
    .or(z.literal("")),
});

type DestinationFormData = z.infer<typeof destinationSchema>;

// ✅ Component con để quản lý form điểm đến
function DestinationDialog() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<DestinationFormData>({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
  } = form;

  const onSubmit = async (data: DestinationFormData) => {
    try {
      const newDestination = await createDestination(data);
      toast({
        title: "Thành công!",
        description: `Đã tạo điểm đến "${newDestination.name}" thành công.`,
      });
      // TODO: Refresh lại danh sách điểm đến
      reset(); // Xóa trắng form
      setIsOpen(false); // Đóng dialog
    } catch (error: any) {
      toast({
        title: "Có lỗi xảy ra!",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Thêm Điểm đến
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Thêm Điểm đến mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dest-name">Tên Điểm đến</Label>
              <Input id="dest-name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dest-region">Khu vực</Label>
              <Select
                onValueChange={(value) => form.setValue("region", value)}
                defaultValue={form.getValues("region")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khu vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Miền Bắc">Miền Bắc</SelectItem>
                  <SelectItem value="Miền Trung">Miền Trung</SelectItem>
                  <SelectItem value="Miền Nam">Miền Nam</SelectItem>
                  <SelectItem value="Tây Nguyên">Tây Nguyên</SelectItem>
                </SelectContent>
              </Select>
              {errors.region && (
                <p className="text-sm text-destructive">
                  {errors.region.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dest-desc">Mô tả</Label>
              <Textarea id="dest-desc" {...register("description")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dest-image">URL Hình ảnh</Label>
              <Input
                id="dest-image"
                {...register("imageUrl")}
                placeholder="https://example.com/image.jpg"
              />
              {errors.imageUrl && (
                <p className="text-sm text-destructive">
                  {errors.imageUrl.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu lại"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TourManagementPage() {
  // Main component render...
  return (
    <Tabs defaultValue="tours">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="tours">Quản lý Tours</TabsTrigger>
          <TabsTrigger value="destinations">Quản lý Điểm đến</TabsTrigger>
        </TabsList>
      </div>

      {/* Tab quản lý Tours */}
      <TabsContent value="tours">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách Tours</CardTitle>
                <CardDescription>
                  Thêm, sửa, xóa và quản lý các tour du lịch.
                </CardDescription>
              </div>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Thêm Tour mới
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề Tour</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead className="text-center">Sức chứa</TableHead>
                  <TableHead className="text-center">Lịch trình</TableHead>
                  <TableHead>
                    <span className="sr-only">Hành động</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTours.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell className="font-medium">{tour.title}</TableCell>
                    <TableCell>{tour.price.toLocaleString("vi-VN")}đ</TableCell>
                    <TableCell>{tour.duration} ngày</TableCell>
                    <TableCell className="text-center">
                      {tour.capacity}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {tour.schedules} lịch trình
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ListOrdered className="mr-2 h-4 w-4" />
                            Xem lịch trình
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab quản lý Điểm đến */}
      <TabsContent value="destinations">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách Điểm đến</CardTitle>
                <CardDescription>
                  Quản lý các địa điểm du lịch của công ty.
                </CardDescription>
              </div>
              {/* ✅ Sử dụng component Dialog mới */}
              <DestinationDialog />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên Điểm đến</TableHead>
                  <TableHead>Khu vực</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>
                    <span className="sr-only">Hành động</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDestinations.map((dest) => (
                  <TableRow key={dest.id}>
                    <TableCell className="font-medium">{dest.name}</TableCell>
                    <TableCell>{dest.region}</TableCell>
                    <TableCell>
                      <Badge variant={dest.isPopular ? "default" : "secondary"}>
                        {dest.isPopular ? "Nổi bật" : "Bình thường"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
