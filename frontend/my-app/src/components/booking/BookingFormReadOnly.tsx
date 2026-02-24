import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookingFormReadOnlyProps } from "@/types/booking";
import { CheckCircle2, CreditCard } from "lucide-react";
import { TouristCounter } from "./TouristCounter";
import { PaymentMethod } from "@/types/payment";
import Image from "next/image";

export const BookingFormReadOnly = ({
  formData,
  tourists,
  paymentMethod,
}: BookingFormReadOnlyProps) => {
  const paymentOptions = [
    {
      id: PaymentMethod.AtOffice,
      label: "Tiền mặt",
      desc: "Tại văn phòng",
      logo: "/images/cash_logo.jpg",
    },
    {
      id: PaymentMethod.VnPay,
      label: "VNPay",
      desc: "Thẻ ATM / QR Code",
      logo: "/images/vnpay_logo.jpg",
    },
    {
      id: PaymentMethod.PayPal,
      label: "PayPal",
      desc: "Visa / MasterCard",
      logo: "/images/paypal_logo.jpg",
    },
  ];

  // Logic to find the mathing option based on the string name returned from backend
  const selectedOption = paymentOptions.find(
    (opt) => PaymentMethod[opt.id] === paymentMethod || opt.id.toString() === paymentMethod
  );
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Thông Tin Liên Lạc
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Họ và tên</Label>
            <Input value={formData.name} readOnly className="mt-1.5 bg-card" />
          </div>

          <div>
            <Label>Email</Label>
            <Input value={formData.email} readOnly className="mt-1.5 bg-card" />
          </div>

          <div>
            <Label htmlFor="phone">Số điện thoại</Label>
            <div className="flex gap-2 mt-1.5">
              <div className="w-24">
                <Input value="+84" readOnly className="text-center bg-card" />
              </div>
              <Input
                value={formData.phone}
                readOnly
                className="flex-1 bg-card"
              />
            </div>
          </div>

          <div>
            <Label>Địa chỉ</Label>
            <Input
              value={formData.address}
              readOnly
              className="mt-1.5 bg-card"
            />
          </div>
        </div>
      </div>

      {/* Tourists */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-foreground">Hành Khách</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TouristCounter label="Người lớn" value={tourists.adults} readOnly />

          <TouristCounter
            label="Trẻ em"
            subtitle="(Từ 5 → 11)"
            value={tourists.children}
            readOnly
          />

          <TouristCounter
            label="Em bé"
            subtitle="(Dưới 5 tuổi)"
            value={tourists.infants}
            readOnly
          />
        </div>
      </div>

      {/* Note */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-foreground">Ghi Chú</h2>
        <div>
          <Label htmlFor="note" className="text-foreground mb-2">
            Yêu cầu đặc biệt (nếu có)
          </Label>
          <Textarea
            value={formData.note || ""}
            readOnly
            className="mt-1.5 min-h-[80px] resize-none bg-card"
          />
        </div>
      </div>

      {/* Payment */}
      {paymentMethod && (
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Phương thức thanh toán
          </h3>

          <div className="mt-4 space-y-3">
             {paymentOptions.map((option) => {
               const isSelected = PaymentMethod[option.id] === paymentMethod || option.id.toString() === paymentMethod;
               
               return (
                <div 
                  key={option.id}
                  className={`
                    relative flex items-center px-5 py-3 rounded-lg border transition-all
                    ${isSelected 
                      ? "bg-primary/5 border-primary ring-1 ring-primary" 
                      : "bg-card border-border opacity-60"
                    }
                  `}
                >
                  {/* ICON */}
                  <div className="relative w-10 h-10 rounded-full mr-4 flex-shrink-0">
                    <Image
                      src={option.logo}
                      alt={option.label}
                      fill
                      sizes="(min-width: 768px) 48px, 40px"
                      className="object-contain"
                    />
                  </div>

                  {/* TEXT */}
                  <div className="flex-1">
                    <p className={`font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {option.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                  </div>

                  {/* CHECK */}
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-primary ml-2" />
                  )}
                </div>
               );
             })}
          </div>
        </div>
      )}
    </div>
  );
};
