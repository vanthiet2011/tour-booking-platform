"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, CheckCircle, XCircle } from "lucide-react";
import { BookingItem } from "@/types/booking";
import { paymentService } from "@/services/payment.service";
import bookingService from "@/services/booking.service";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface BookingActionsProps {
  booking: BookingItem;
}

export default function BookingActions({ booking }: BookingActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      await paymentService.confirmOfficePayment({
        bookingId: booking.id,
      });
      toast.success("Xác nhận thanh toán thành công!");
      window.location.reload();
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message || "Có lỗi xảy ra khi xác nhận thanh toán.");
    } finally {
      setLoading(false);
      setShowPaymentDialog(false);
    }
  };

  const handleCancelBooking = async () => {
    setLoading(true);
    try {
      await bookingService.cancelBookingAdmin(
        booking.id,
        "Admin Cancelled from Dashboard",
      );
      toast.success("Đã hủy đơn hàng thành công!");
      window.location.reload();
    } catch (error: unknown) {
      console.error("Cancel Error:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra khi hủy đơn.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setShowCancelDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              // Navigate logic or modal logic if needed
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </DropdownMenuItem>

          {booking.status === "Pending" &&
            booking.paymentMethod === "AtOffice" && (
              <DropdownMenuItem onClick={() => setShowPaymentDialog(true)}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Thanh toán VP
              </DropdownMenuItem>
            )}

          {(booking.status === "Pending" || booking.status === "Confirmed") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowCancelDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Hủy đơn
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog Hủy Đơn */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy đơn hàng này?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy đơn hàng{" "}
              <span className="font-bold">
                {booking.id.slice(0, 8).toUpperCase()}
              </span>
              ?
              <br />
              Chỗ trống sẽ được giải phóng ngay lập tức.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Đóng</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancelBooking();
              }}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {loading ? "Đang xử lý..." : "Xác nhận hủy"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Xác Nhận Thanh Toán */}
      <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xác nhận thanh toán tại văn phòng?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Xác nhận khách hàng đã thanh toán cho đơn{" "}
              <span className="font-bold">
                {booking.id.slice(0, 8).toUpperCase()}
              </span>
              ?
              <br />
              Trạng thái đơn hàng sẽ được cập nhật.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmPayment();
              }}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
