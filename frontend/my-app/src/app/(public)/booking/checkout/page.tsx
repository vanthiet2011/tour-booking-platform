"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BookingForm } from "@/components/booking/BookingForm";
import { PriceSummary } from "@/components/booking/PriceSummary";
import { useAuth } from "@/contexts/AuthContext";
import bookingService from "@/services/booking.service";
import tourService from "@/services/tour.service";
import { BookingDetail } from "@/types/booking";
import { Tour, TourDepartureInfo } from "@/types/tour";
import { CreditCard, Home, Loader2 } from "lucide-react";
import { paymentService } from "@/services/payment.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { PaymentMethod } from "@/types/payment";

const CheckoutPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setSagaStatus] = useState<
    "idle" | "creating" | "confirming" | "ready"
  >("idle");
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [tourData, setTourData] = useState<Tour | null>(null);
  const [departureData, setDepartureData] = useState<TourDepartureInfo | null>(
    null,
  );

  // Booking & Payment states
  const [, setBookingId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [paymentData, setPaymentData] = useState<string | null>(null);
  const [internalPaymentId, setInternalPaymentId] = useState<string | null>(
    null,
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "",
  });

  const [tourists, setTourists] = useState({
    adults: 0,
    children: 0,
    infants: 0,
  });

  /* ================= SUCCESS STATE ================= */
  const [isOfficeSuccess, setIsOfficeSuccess] = useState(false);

  /* ================= FETCH TOUR DATA ================= */
  useEffect(() => {
    const tourId = searchParams.get("tourId");
    const departureId = searchParams.get("departureId");
    if (!tourId || !departureId) {
      toast.error("Thiếu thông tin tour.");
      return;
    }
    const fetchData = async () => {
      try {
        const [tour, departures] = await Promise.all([
          tourService.getById(tourId),
          tourService.getTourDeparturesById(tourId),
        ]);
        setTourData(tour);
        const dep = departures.find((d) => d.id === departureId);
        if (dep) setDepartureData(dep);
      } catch {
        toast.error("Không thể tải thông tin.");
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [searchParams]);

  /* ================= TOURIST CHANGE ================= */
  const handleTouristChange = (type: keyof typeof tourists, value: number) => {
    setTourists((prev) => ({ ...prev, [type]: value }));
  };

  const handlePrepareOrder = async () => {
    // 1. Validate form
    if (!user) {
      toast.error("Vui lòng đăng nhập.");
      return null;
    }
    if (!formData.name || !formData.phone) {
      toast.error("Vui lòng điền đủ thông tin.");
      return null;
    }

    setIsSubmitting(true);
    setSagaStatus("creating");

    try {
      // BƯỚC 1: Tạo đơn hàng
      const bookingDetails = [
        {
          participantType: "Adult",
          quantity: tourists.adults,
          unitPrice: tourData!.pricePerAdult,
        },
        {
          participantType: "Child",
          quantity: tourists.children,
          unitPrice: tourData!.pricePerChild,
        },
        { participantType: "Infant", quantity: tourists.infants, unitPrice: 0 },
      ].filter((d) => d.quantity > 0) as BookingDetail[];

      if (bookingDetails.length === 0) {
        toast.error("Vui lòng chọn ít nhất 1 hành khách.");
        setIsSubmitting(false); // Reset loading state
        setSagaStatus("idle");
        return null; // Stop execution
      }

      // Clean payload (remove unitPrice as backend doesn't expect it)
      const payloadDetails = bookingDetails.map(
        ({ participantType, quantity }) => ({
          participantType,
          quantity,
        }),
      );

      const booking = await bookingService.create({
        tourDepartureId: departureData!.id,
        contactFullName: formData.name,
        contactEmail: formData.email,
        contactPhone: formData.phone,
        contactAddress: formData.address,
        note: formData.note,
        paymentMethod: PaymentMethod[selectedMethod!], // Send string name (e.g. "PayPal") not number
        bookingDetails: payloadDetails as unknown as BookingDetail[], // Cast to avoid TS error with strict types if needed, or update types
      });

      const newBookingId = booking.id;
      setBookingId(newBookingId);
      setSagaStatus("confirming");

      // BƯỚC 2: Polling chờ Kafka tạo bản ghi Payment
      let isPaymentReady = false;
      let paymentLink = "";
      let paymentId = "";

      for (let i = 0; i < 15; i++) {
        try {
          const status =
            await paymentService.getStatusByBookingId(newBookingId);
          if (status && status.paymentLink) {
            isPaymentReady = true;
            paymentLink = status.paymentLink;
            paymentId = status.paymentId;
            break;
          }
        } catch {
          /* Đợi... */
        }
        await new Promise((r) => setTimeout(r, 2000));
      }

      if (!isPaymentReady) throw new Error("Hệ thống xác nhận chậm...");

      // Không cần gọi initiatePayment nữa
      
      setInternalPaymentId(paymentId);
      setPaymentData(paymentLink); 
      setSagaStatus("ready");

      return { paymentLink, paymentId }; // Trả về cấu trúc tương tự để logic dưới dùng được
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg =
        err.response?.data?.message || err.message || "Lỗi khởi tạo";
      console.error("❌ Lỗi PayPal:", errorMsg);
      toast.error(err.message || "Lỗi xử lý.");
      setSagaStatus("idle");
      setIsSubmitting(false);
      return null;
    }
  };

  /* ================= CREATE BOOKING ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handlePrepareOrder();

    if (result) {
      if (selectedMethod === PaymentMethod.VnPay) {
        window.location.href = result.paymentLink;
      } else if (selectedMethod === PaymentMethod.AtOffice) {
        // Thay vì redirect ngay -> Hiển thị Success View
        setIsOfficeSuccess(true);
      }
    }
  };

  /* ================= LOADING STATES ================= */
  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!tourData || !departureData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Xác Nhận & Thanh Toán"
        subtitle="Kiểm tra thông tin và hoàn tất thanh toán"
        badgeLabel="Thanh toán"
        badgeIcon={CreditCard}
        backgroundImage="/images/geneva_banner.jpg"
        breadcrumbItems={[
          { label: "Trang chủ", href: "/", icon: Home },
          { label: "Tour", href: "/tours" },
          { label: "Checkout" },
        ]}
      />
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {isOfficeSuccess ? (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center border">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                <CreditCard className="w-10 h-10 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Đặt chỗ thành công!
            </h2>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã đặt tour. Vui lòng thực hiện thanh toán tại văn
              phòng theo hướng dẫn bên dưới.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                ℹ️ Hướng dẫn thanh toán
              </h3>
              <p className="text-blue-700 whitespace-pre-line leading-relaxed">
                {paymentData || "Vui lòng liên hệ nhân viên để được hỗ trợ."}
              </p>
            </div>

            <Button
              size="lg"
              className="w-full sm:w-auto min-w-[200px]"
              onClick={() =>
                router.push(
                  `/booking/payment-result?paymentId=${internalPaymentId}&status=office`,
                )
              }
            >
              Xác nhận
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <BookingForm
                formData={formData}
                setFormData={setFormData}
                tourists={tourists}
                onTouristChange={handleTouristChange}
                selectedMethod={selectedMethod!}
                onMethodChange={setSelectedMethod}
                onSubmit={handleSubmit}
              />
            </div>

            <div className="lg:col-span-1">
              <PriceSummary
                tourCode={tourData.id.slice(0, 8).toUpperCase()}
                tourTitle={tourData.name}
                startDate={new Date(departureData.startDate).toLocaleDateString(
                  "vi-VN",
                )}
                endDate={new Date(departureData.endDate).toLocaleDateString(
                  "vi-VN",
                )}
                adultPrice={tourData.pricePerAdult}
                childPrice={tourData.pricePerChild}
                infantPrice={0}
                adults={tourists.adults}
                numChildren={tourists.children}
                infants={tourists.infants}
                showAction
                actionLabel="Đặt ngay"
                actionFormId="booking-form"
                isSubmitting={isSubmitting}
                customAction={
                  selectedMethod === PaymentMethod.PayPal ? (
                    <PayPalButtons
                      style={{ layout: "vertical", label: "checkout" }}
                      createOrder={async () => {
                        const result = await handlePrepareOrder();
                        if (result && result.paymentLink) {
                          return result.paymentLink;
                        }
                        throw new Error("Không thể khởi tạo giao dịch.");
                      }}
                      onApprove={async (data) => {
                        const loadingToast = toast.loading(
                          "Đang xác nhận với PayPal...",
                        );
                        try {
                          await paymentService.capturePayPal({
                            paymentId: internalPaymentId!,
                            payPalOrderId: data.orderID!,
                          });
                          toast.dismiss(loadingToast);
                          router.push(
                            `/booking/payment-result?paymentId=${internalPaymentId}&status=success`,
                          );
                        } catch {
                          toast.error("Lỗi xác nhận thanh toán.");
                          toast.dismiss(loadingToast);
                        }
                      }}
                    />
                  ) : undefined
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Index = () => (
  <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    }
  >
    <CheckoutPageContent />
  </Suspense>
);

export default Index;
