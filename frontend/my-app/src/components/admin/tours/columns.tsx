import { ColumnDef } from "@tanstack/react-table";
import { Tour } from "@/types/tour";
import { TourActionsCell } from "./TourActionsCell";

export const getColumns = (onDeleteSuccess: () => void): ColumnDef<Tour>[] => [
  {
    accessorKey: "name",
    header: "Tên Tour",
  },
  {
    accessorKey: "pricePerAdult",
    header: "Giá",
    cell: ({ row }) => {
      const amount = Number(row.getValue("pricePerAdult"));
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    },
  },
  {
    accessorKey: "duration",
    header: "Thời gian",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <TourActionsCell tour={row.original} onDeleteSuccess={onDeleteSuccess} />
    ),
  },
];
