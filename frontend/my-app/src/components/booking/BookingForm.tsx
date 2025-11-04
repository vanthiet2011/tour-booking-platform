// src/components/booking/BookingForm.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TouristCounter } from "./TouristCounter";
import { Textarea } from "@/components/ui/textarea"; // Thêm Textarea

// Định nghĩa kiểu cho state
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
  onSubmit: (e: React.FormEvent) => void;
}

export const BookingForm = ({
  formData,
  setFormData,
  tourists,
  onTouristChange,
  onSubmit,
}: BookingFormProps) => {
  // Hàm helper để cập nhật form data
  const handleContactChange = (field: keyof FormDataState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    // Gán ID cho form và dùng onSubmit từ props
    <form id="booking-form" onSubmit={onSubmit} className="space-y-8">
      {/* Contact Information */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-foreground">
          Thông Tin Liên Lạc
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-foreground">
              Họ và tên <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Nhập Họ và tên"
              value={formData.name}
              onChange={(e) => handleContactChange("name", e.target.value)}
              className="mt-1.5"
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
              className="mt-1.5"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-foreground">
              Số điện thoại <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2 mt-1.5">
              <div className="w-24">
                <Input value="+84" readOnly className="text-center" />
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="Nhập số điện thoại liên hệ"
                value={formData.phone}
                onChange={(e) => handleContactChange("phone", e.target.value)}
                className="flex-1"
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
              className="mt-1.5"
              required
            />
          </div>
        </div>
      </div>

      {/* Tourist Counters */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-foreground">Hành Khách</h2>
        <div className="space-y-3">
          <TouristCounter
            label="Người lớn"
            value={tourists.adults}
            onChange={(value) => onTouristChange("adults", value)}
          />
          <TouristCounter
            label="Trẻ em"
            subtitle="(Từ 5 -> 11)"
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

      {/* Note Field (Thêm mới) */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-foreground">Ghi Chú</h2>
        <div>
          <Label htmlFor="note" className="text-foreground">
            Yêu cầu đặc biệt (nếu có)
          </Label>
          <Textarea
            id="note"
            placeholder="Ví dụ: Ăn chay, cần hỗ trợ xe lăn..."
            value={formData.note}
            onChange={(e) => handleContactChange("note", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>
    </form>
  );
};
