import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TouristCounter } from "./TouristCounter";
import { Textarea } from "@/components/ui/textarea";
import { PaymentMethod } from "@/types/payment";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { CheckCircle2, CreditCard } from "lucide-react";
import Image from "next/image";

interface FormDataState {
  name: string;
  email: string;
  phone: string;
  address: string;
  note: string;
}

interface TouristsState {
  adults: number;
  children: number;
  infants: number;
}

interface BookingFormProps {
  formData: FormDataState;
  setFormData: React.Dispatch<React.SetStateAction<FormDataState>>;
  tourists: TouristsState;
  onTouristChange: (type: keyof TouristsState, value: number) => void;
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const BookingForm = ({
  formData,
  setFormData,
  tourists,
  onTouristChange,
  selectedMethod,
  onMethodChange,
  onSubmit,
}: BookingFormProps) => {
  const handleContactChange = (field: keyof FormDataState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
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

  return (
    <form id="booking-form" onSubmit={onSubmit} className="space-y-6">
      {/* Contact Information */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Thông Tin Liên Lạc
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="name" className="text-foreground">
              Họ và tên <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Nhập Họ và tên"
              value={formData.name}
              onChange={(e) => handleContactChange("name", e.target.value)}
              className="mt-1.5 bg-card"
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-foreground">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="sample@gmail.com"
              value={formData.email}
              onChange={(e) => handleContactChange("email", e.target.value)}
              className="mt-1.5 bg-card"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-foreground">
              Số điện thoại <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2 mt-1.5">
              <div className="w-24">
                <Input value="+84" readOnly className="text-center bg-card" />
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="Nhập số điện thoại liên hệ"
                value={formData.phone}
                onChange={(e) => handleContactChange("phone", e.target.value)}
                className="flex-1 bg-card"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address" className="text-foreground">
              Địa chỉ <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              placeholder="Nhập địa chỉ liên hệ"
              value={formData.address}
              onChange={(e) => handleContactChange("address", e.target.value)}
              className="mt-1.5 bg-card"
              required
            />
          </div>
        </div>
      </div>

      {/* Tourist Counters */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-foreground">Hành Khách</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TouristCounter
            label="Người lớn"
            value={tourists.adults}
            onChange={(value) => onTouristChange("adults", value)}
          />

          <TouristCounter
            label="Trẻ em"
            subtitle="(Từ 5 → 11)"
            value={tourists.children}
            onChange={(value) => onTouristChange("children", value)}
          />

          <TouristCounter
            label="Em bé"
            subtitle="(Dưới 5 tuổi)"
            value={tourists.infants}
            onChange={(value) => onTouristChange("infants", value)}
          />
        </div>
      </div>

      {/* Note Field */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-foreground">Ghi Chú</h2>
        <div>
          <Label htmlFor="note" className="text-foreground mb-2">
            Yêu cầu đặc biệt (nếu có)
          </Label>
          <Textarea
            id="note"
            placeholder="Ví dụ: Ăn chay, cần hỗ trợ xe lăn..."
            value={formData.note}
            onChange={(e) => handleContactChange("note", e.target.value)}
            className="mt-1.5 min-h-[80px] resize-none bg-card"
          />
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Phương thức thanh toán
        </h3>

          <div className="mt-4 space-y-3">
            <RadioGroup
              value={selectedMethod?.toString() ?? ""}
              onValueChange={(v) => onMethodChange(Number(v) as PaymentMethod)}
              className="space-y-3"
            >
              {paymentOptions.map((item) => {
                const value = item.id.toString();
                const isSelected = selectedMethod === item.id;

                return (
                  <Label
                    key={item.id}
                    htmlFor={value}
                    className={`
                      relative flex items-center px-5 py-3 rounded-lg border cursor-pointer
                      transition-all
                      ${
                        isSelected
                          ? "bg-primary/5 border-primary ring-1 ring-primary"
                          : "bg-card border-border hover:bg-muted/40 opacity-60 hover:opacity-100"
                      }
                    `}
                  >
                    {/* RADIO (Hidden visually but functional) */}
                    <RadioGroupItem value={value} id={value} className="sr-only" />

                    {/* ICON */}
                    <div className="relative w-10 h-10 rounded-full mr-4 flex-shrink-0">
                      <Image
                        src={item.logo}
                        alt={item.label}
                        fill
                        sizes="(min-width: 768px) 48px, 40px"
                        className="object-contain"
                      />
                    </div>

                    {/* TEXT */}
                    <div className="flex-1">
                      <p
                        className={`font-semibold ${
                          isSelected ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>

                    {/* CHECK */}
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-primary ml-2" />
                    )}
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
      </div>
    </form>
  );
};
