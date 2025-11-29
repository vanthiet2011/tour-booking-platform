// src/components/admin/tours/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Tour } from "@/types/tour";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import tourService from "@/services/tour.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

export const getColumns = (onDeleteSuccess: () => void): ColumnDef<Tour>[] => [
  {
    accessorKey: "name",
    header: "Tên Tour",
  },
  {
    accessorKey: "pricePerAdult",
    header: "Giá",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("pricePerAdult"));
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "duration",
    header: "Thời gian",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const tour = row.original;
      const [isDeleting, setIsDeleting] = useState(false);
      const [isAlertOpen, setIsAlertOpen] = useState(false);
      const { toast } = useToast();
      const router = useRouter();

      const onCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        toast({ title: "Thành công", description: "Đã sao chép ID Tour." });
      };

      const handleDelete = async () => {
        setIsDeleting(true);
        try {
          await tourService.delete(tour.id);
          toast({ title: "Thành công", description: "Đã xóa tour." });
          onDeleteSuccess();
        } catch (error) {
          console.error("Lỗi khi xóa tour:", error);
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Không thể xóa tour. Vui lòng thử lại.",
          });
        } finally {
          setIsDeleting(false);
          setIsAlertOpen(false);
        }
      };

      return (
        <>
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này không thể hoàn tác. Tour sẽ bị xóa vĩnh viễn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Đang xóa..." : "Tiếp tục"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onCopy(tour.id)}>
                <Copy className="mr-2 h-4 w-4" /> Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/tours/edit/${tour.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" /> Cập nhật
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsAlertOpen(true)}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" /> Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];
