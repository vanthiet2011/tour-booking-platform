"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import bookingService from "@/services/booking.service";
import { paymentService } from "@/services/payment.service";
import { BookingFormReadOnly } from "@/components/booking/BookingFormReadOnly";

import { Booking } from "@/types/booking";
import { PriceSummary } from "@/components/booking/PriceSummary";
import { PageHeader } from "@/components/layout/PageHeader";
import { Home, Ticket } from "lucide-react";

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

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      try {
        const data = await bookingService.getById(id);
        setBooking(data);

        try {
          const payment = await paymentService.getStatusByBookingId(id);
          if (payment && payment.paymentMethod) {
            setPaymentMethod(payment.paymentMethod);
          }
        } catch (error) {
          console.log("Could not fetch payment info", error);
        }
      } catch {
        toast.error("Không tìm thấy thông tin đơn hàng");
        router.replace("/profile?tab=bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, router]);

  const formData = useMemo(() => {
    if (!booking) return null;

    return {
      name: booking.contactFullName,
      email: booking.contactEmail,
      phone: booking.contactPhone,
      address: booking.contactAddress,
      note: booking.note ?? "",
    };
  }, [booking]);

  const tourists = useMemo(() => {
    if (!booking?.bookingDetails) {
      return { adults: 0, children: 0, infants: 0 };
    }

    const getQty = (type: "Adult" | "Child" | "Infant") =>
      booking.bookingDetails.find((d) => d.participantType === type)
        ?.quantity ?? 0;

    return {
      adults: getQty("Adult"),
      children: getQty("Child"),
      infants: getQty("Infant"),
    };
  }, [booking]);

  const onCancelClick = () => {
      setShowCancelDialog(true);
  };

  const executeCancelBooking = async () => {
    if (!booking) return;
    setIsCancelling(true);
    try {
      await bookingService.cancel(booking.id);
      toast.success("Yêu cầu hủy đã được ghi nhận");

      const updated = await bookingService.getById(booking.id);
      setBooking(updated);
    } catch {
      toast.error("Hủy tour thất bại, vui lòng liên hệ hỗ trợ");
    } finally {
        setIsCancelling(false);
        setShowCancelDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!booking || !formData || !tourists) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Không tìm thấy đơn hàng
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Tour Đã Đặt"
        subtitle="Đặt tour thành công. Dưới đây là thông tin chi tiết bạn đã cung cấp sau khi hoàn tất thanh toán."
        badgeLabel="Lịch sử đặt tour"
        badgeIcon={Ticket}
        backgroundImage="/images/lake_header.jpg"
        breadcrumbItems={[
          { label: "Trang chủ", href: "/", icon: Home },
          { label: "Tour đã đặt" },
        ]}
      />

      <div className="container mx-auto px-6 md:px-8 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BookingFormReadOnly
              formData={formData}
              tourists={tourists}
              paymentMethod={paymentMethod}
            />
          </div>
          <div className="lg:col-span-1">
            <PriceSummary
              tourCode={booking.tourId.slice(0, 8).toUpperCase()}
              tourTitle={booking.tourName}
              startDate={new Date(booking.startDate).toLocaleDateString(
                "vi-VN",
              )}
              endDate={new Date(booking.endDate).toLocaleDateString("vi-VN")}
              adultPrice={
                booking.bookingDetails.find(
                  (d) => d.participantType === "Adult",
                )?.unitPrice || 0
              }
              childPrice={
                booking.bookingDetails.find(
                  (d) => d.participantType === "Child",
                )?.unitPrice || 0
              }
              infantPrice={0}
              adults={tourists.adults}
              numChildren={tourists.children}
              infants={tourists.infants}
              showAction={["Pending", "Confirmed"].includes(booking.status)}
              actionLabel={
                booking.status === "Confirmed"
                  ? "Yêu cầu hủy & Hoàn tiền"
                  : "Hủy tour"
              }
              onActionClick={onCancelClick}
              isSubmitting={isCancelling}
            />
          </div>
        </div>

        {/* Actions - Removed as requested in previous step, ensuring it is gone */}
        
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận hủy tour</AlertDialogTitle>
                    <AlertDialogDescription>
                        {booking.status === "Confirmed"
                            ? "Tour này đã được thanh toán. Việc hủy tour sẽ tuân theo chính sách hoàn tiền của chúng tôi. Bạn vẫn muốn tiếp tục?"
                            : "Bạn có chắc chắn muốn hủy đơn đặt tour này không? Hành động này không thể hoàn tác."
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isCancelling}>Đóng</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={(e) => {
                            e.preventDefault();
                            executeCancelBooking();
                        }}
                        disabled={isCancelling}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {isCancelling ? "Đang xử lý..." : "Xác nhận hủy"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
}
