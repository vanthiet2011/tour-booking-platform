"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BookingItem, BookingStatus } from "@/types/booking";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import BookingActions from "./BookingActions";

const statusConfig: Record<
  BookingStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  Pending: { label: "Chờ duyệt", variant: "secondary" },
  Confirmed: { label: "Đã xác nhận", variant: "default" },
  Completed: { label: "Hoàn thành", variant: "outline" },
  Cancelled: { label: "Đã hủy", variant: "destructive" },
  Failed: { label: "Thất bại", variant: "destructive" },
};

export const columns: ColumnDef<BookingItem>[] = [
  {
    accessorKey: "id",
    header: "Mã Đơn",
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.original.id.slice(0, 8).toUpperCase()}
      </span>
    ),
  },
  {
    accessorKey: "tourName",
    header: "Tên Tour",
    cell: ({ row }) => {
      const tourName = row.original.tourName;
      const tourId = row.original.tourId;

      return (
        <div className="flex flex-col max-w-[250px]">
          <span
            className="font-semibold text-sm text-blue-700 dark:text-blue-400 line-clamp-1"
            title={tourName}
          >
            {tourName || "Đang cập nhật..."}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono italic">
            ID: {tourId.slice(0, 8)}...
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "contactFullName",
    header: "Khách hàng",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.contactFullName}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.contactEmail}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "passengers",
    header: "Khách",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs space-y-0.5">
        <span
          className={row.original.adults > 0 ? "" : "text-muted-foreground"}
        >
          Người lớn: <b>{row.original.adults}</b>
        </span>
        <span
          className={row.original.children > 0 ? "" : "text-muted-foreground"}
        >
          Trẻ em: <b>{row.original.children}</b>
        </span>
        <span
          className={row.original.infants > 0 ? "" : "text-muted-foreground"}
        >
          Em bé: <b>{row.original.infants}</b>
        </span>
      </div>
    ),
  },
  {
    accessorKey: "totalPrice",
    header: "Tổng tiền",
    cell: ({ row }) => (
      <span className="font-bold text-green-600 dark:text-green-400">
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(row.original.totalPrice)}
      </span>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Khởi hành",
    cell: ({ row }) => {
      const date = new Date(row.original.startDate);
      return (
        <span>
          {date.getFullYear() <= 1 ? "N/A" : format(date, "dd/MM/yyyy")}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày đặt",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {format(date, "dd/MM/yyyy")}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(date, "HH:mm")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "TT Booking",
    cell: ({ row }) => {
      const config = statusConfig[row.original.status] || statusConfig.Pending;
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Phương thức",
    cell: ({ row }) => {
      const method = row.original.paymentMethod;
      let label = "Chưa TT";
      let className = "text-slate-400 font-normal italic";

      if (method === "PayPal") {
        label = "PayPal";
        className = "text-blue-600 dark:text-blue-400 font-bold";
      } else if (method === "AtOffice") {
        label = "Tiền mặt (VP)";
        className = "text-amber-600 dark:text-amber-400 font-bold";
      } else if (method === "VnPay") {
        label = "VNPay";
        className = "text-red-600 dark:text-red-400 font-bold";
      }

      return <span className={`text-sm ${className}`}>{label}</span>;
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "TT Thanh toán",
    cell: ({ row }) => {
      const status = row.original.paymentStatus;
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "outline";
      let label = status;

      if (status === "Completed") {
        label = "Đã thanh toán";
        variant = "default";
      } else if (status === "Pending") {
        label = "Chờ thanh toán";
        variant = "secondary";
      } else if (status === "AwaitingOffice") {
        label = "Chờ TT (VP)";
        variant = "secondary"; // Or specific color
      } else if (status === "Failed") {
        label = "Thất bại";
        variant = "destructive";
      } else if (status === "Cancelled") {
        label = "Đã hủy";
        variant = "outline";
      } else if (status === "Expired") {
        label = "Hết hạn";
        variant = "destructive";
      }

      // Custom coloring
      let badgeClassName = "";
      if (status === "Completed")
        badgeClassName = "bg-green-600 hover:bg-green-700";
      if (status === "AwaitingOffice")
        badgeClassName = "bg-amber-600 hover:bg-amber-700 text-white";
      if (status === "Pending")
        badgeClassName = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";

      return (
        <Badge variant={variant} className={badgeClassName}>
          {label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => <BookingActions booking={row.original} />,
  },
];
