// src/components/admin/destinations/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Destination } from "@/types/destination";

type DestinationActionsProps = {
  onEdit: (destination: Destination) => void;
  onDelete: (destination: Destination) => void;
};

export const getColumns = ({
  onEdit,
  onDelete,
}: DestinationActionsProps): ColumnDef<Destination>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tên Điểm Đến
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "region",
    header: "Vùng Miền",
  },
  {
    accessorKey: "isPopular",
    header: "Phổ Biến",
    cell: ({ row }) => (row.original.isPopular ? "Có" : "Không"),
  },
  {
    accessorKey: "createdAt",
    header: "Ngày Tạo",
    cell: ({ row }) => {
      const dateString = row.getValue("createdAt") as string;
      if (!dateString) {
        return <span>N/A</span>;
      }

      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return <span>InvalidDate</span>;
        }
        return <span>{format(date, "dd/MM/yyyy")}</span>;
      } catch (error) {
        console.error("Lỗi parse ngày:", error);
        return <span>InvalidDate</span>;
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const destination = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(destination)}>
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(destination)}
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
