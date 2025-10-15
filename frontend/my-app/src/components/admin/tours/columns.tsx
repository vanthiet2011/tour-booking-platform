"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tour } from "@/lib/api";

type TourActionsProps = {
  onEdit: (tour: Tour) => void;
  onDelete: (tour: Tour) => void;
};

export const getColumns = ({
  onEdit,
  onDelete,
}: TourActionsProps): ColumnDef<Tour>[] => [
  {
    accessorKey: "name",
    header: "Tên Tour",
  },
  {
    accessorKey: "pricePerAdult",
    header: "Giá người lớn",
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
    header: "Thời lượng",
  },
  {
    accessorKey: "isBestseller",
    header: "Bán chạy",
    cell: ({ row }) => (row.original.isBestseller ? "Có" : "Không"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const tour = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(tour)}>
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(tour)}
              className="text-red-600"
            >
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
