// src/components/booking/PriceSummary.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ticket, Loader2 } from "lucide-react"; // Thêm Loader2

interface PriceSummaryProps {
  tourCode: string;
  tourTitle: string;
  startDate: string;
  endDate: string;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  roomPrice: number;
  adults: number;
  children: number;
  infants: number;
  isSubmitting?: boolean; // Thêm prop này
}

export const PriceSummary = ({
  tourCode,
  tourTitle,
  startDate,
  endDate,
  adultPrice,
  childPrice,
  infantPrice,
  roomPrice,
  adults,
  children,
  infants,
  isSubmitting = false, // Giá trị mặc định
}: PriceSummaryProps) => {
  const totalAdultPrice = adults * adultPrice;
  const totalChildPrice = children * childPrice;
  const totalInfantPrice = infants * infantPrice;
  const totalPrice =
    totalAdultPrice + totalChildPrice + totalInfantPrice + roomPrice;

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN");
  };

  return (
    <Card className="p-6 sticky top-6">
      <div className="space-y-4">
        {/* Tour Code */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Ticket className="h-4 w-4" />
          <span>Mã tour: {tourCode}</span>
        </div>

        {/* Tour Title */}
        <h3 className="text-lg font-bold text-primary leading-snug">
          {tourTitle}
        </h3>

        {/* Dates */}
        <div className="flex items-center gap-2 text-sm font-medium pb-4 border-b border-border">
          <span>{startDate}</span>
          <ArrowRight className="h-4 w-4" />
          <span>{endDate}</span>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3">
          {/* ... (phần chi tiết giá không đổi) ... */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Người lớn :</span>
            <span className="font-medium">
              {adults} x {formatPrice(adultPrice)} ={" "}
              {formatPrice(totalAdultPrice)} VNĐ
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Trẻ em :</span>
            <span className="font-medium">
              {children} x {formatPrice(childPrice)} ={" "}
              {formatPrice(totalChildPrice)} VNĐ
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Em bé :</span>
            <span className="font-medium">
              {infants} x {formatPrice(infantPrice)} ={" "}
              {formatPrice(totalInfantPrice)} VNĐ
            </span>
          </div>
          <div className="flex justify-between text-sm pb-4 border-b border-border">
            <span className="text-muted-foreground">Phòng đơn :</span>
            <span className="font-medium">{formatPrice(roomPrice)} VNĐ</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold text-accent">Tổng cộng:</span>
          <span className="text-2xl font-bold text-accent">
            {formatPrice(totalPrice)} VNĐ
          </span>
        </div>

        {/* Book Button */}
        <Button
          type="submit"
          form="booking-form" // ID này giờ sẽ trỏ đúng vào <form> trong BookingForm
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg py-6 mt-4"
          disabled={isSubmitting} // Vô hiệu hóa khi đang submit
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : null}
          {isSubmitting ? "Đang xử lý..." : "Đặt Ngay"}
        </Button>
      </div>
    </Card>
  );
};
