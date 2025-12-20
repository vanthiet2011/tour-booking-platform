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
import { BookingPayload, BookingDetail } from "@/types/booking";
import { Tour, TourDepartureInfo } from "@/types/tour";
import { Loader2 } from "lucide-react";

const CheckoutPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [tourData, setTourData] = useState<Tour | null>(null);
  const [departureData, setDepartureData] = useState<TourDepartureInfo | null>(
    null
  );

  // State form
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

  useEffect(() => {
    const tourId = searchParams.get("tourId");
    const departureId = searchParams.get("departureId");

    if (!tourId || !departureId) {
      toast.error("Thiếu thông tin tour hoặc ngày khởi hành.");
      setIsLoadingData(false);
      return;
    }

    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const fetchedTour = await tourService.getById(tourId);
        setTourData(fetchedTour);

        const departures = await tourService.getTourDeparturesById(tourId);

        console.log(
          "ĐANG TÌM ID (từ URL):",
          departureId,
          `(Kiểu: ${typeof departureId})`
        );

        console.log(
          "DANH SÁCH DEPARTURES (từ API):",
          JSON.stringify(departures, null, 2)
        );

        const selectedDeparture = departures.find(
          (dep) => dep.id === departureId
        );

        console.log("KẾT QUẢ TÌM THẤY:", selectedDeparture);

        if (selectedDeparture) {
          setDepartureData(selectedDeparture);
        } else {
          toast.error("Không tìm thấy thông tin ngày khởi hành phù hợp.");
        }
      } catch (error) {
        console.error("Failed to fetch tour/departure data:", error);
        toast.error("Không thể tải thông tin chuyến đi. Vui lòng thử lại.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [searchParams, router]);

  const handleTouristChange = (type: keyof typeof tourists, value: number) => {
    setTourists((prev) => ({ ...prev, [type]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const departureId = departureData?.id || searchParams.get("departureId");

    if (!departureId) {
      toast.error("Lỗi: Không xác định được ngày khởi hành.");
      return;
    }

    setIsSubmitting(true);

    if (!user) {
      toast.error("Vui lòng đăng nhập để tiếp tục đặt tour");
      setIsSubmitting(false);
      return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin liên lạc bắt buộc (*)");
      setIsSubmitting(false);
      return;
    }

    if (tourists.adults === 0 && tourists.children === 0) {
      toast.error(
        "Vui lòng chọn ít nhất một hành khách (người lớn hoặc trẻ em)"
      );
      setIsSubmitting(false);
      return;
    }

    const bookingDetails: BookingDetail[] = [];
    if (tourists.adults > 0) {
      bookingDetails.push({
        participantType: "Adult",
        quantity: tourists.adults,
      });
    }
    if (tourists.children > 0) {
      bookingDetails.push({
        participantType: "Child",
        quantity: tourists.children,
      });
    }
    if (tourists.infants > 0) {
      bookingDetails.push({
        participantType: "Infant",
        quantity: tourists.infants,
      });
    }

    const payload: BookingPayload = {
      tourDepartureId: departureId,
      contactFullName: formData.name,
      contactEmail: formData.email,
      contactPhone: formData.phone,
      contactAddress: formData.address,
      note: formData.note,
      bookingDetails: bookingDetails,
    };

    try {
      const result = await bookingService.create(payload);
      toast.success("Đặt tour thành công! Đang chuyển hướng...");
      console.log("Booking created:", result);
      router.push("/profile?tab=bookings");
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Đã có lỗi xảy ra khi đặt tour. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Đang tải thông tin chuyến đi...</p>
      </div>
    );
  }

  if (!tourData || !departureData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
        <h2 className="text-2xl font-bold text-destructive mb-4">
          Lỗi Tải Dữ Liệu
        </h2>
        <p className="text-muted-foreground mb-6">
          Không thể tải thông tin chi tiết cho chuyến đi này. Vui lòng kiểm tra
          lại đường dẫn hoặc thử lại sau.
        </p>
        <Button onClick={() => router.back()}>Quay Lại</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 md:px-8 py-8 max-w-7xl">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">
          Tổng Quan Về Chuyến Đi
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BookingForm
              formData={formData}
              setFormData={setFormData}
              tourists={tourists}
              onTouristChange={handleTouristChange}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="lg:col-span-1">
            <PriceSummary
              tourCode={tourData.id.slice(0, 8).toUpperCase()}
              tourTitle={tourData.name}
              startDate={new Date(departureData.startDate).toLocaleDateString(
                "vi-VN"
              )}
              endDate={new Date(departureData.endDate).toLocaleDateString(
                "vi-VN"
              )}
              adultPrice={tourData.pricePerAdult}
              childPrice={tourData.pricePerChild}
              infantPrice={0}
              roomPrice={0}
              adults={tourists.adults}
              numChildren={tourists.children}
              infants={tourists.infants}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

const Index = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutPageContent />
    </Suspense>
  );
};

export default Index;
