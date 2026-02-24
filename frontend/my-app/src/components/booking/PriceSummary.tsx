import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ticket, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceSummaryProps {
  tourCode: string;
  tourTitle: string;
  startDate: string;
  endDate: string;

  adultPrice: number;
  childPrice: number;
  infantPrice: number;

  adults: number;
  numChildren: number;
  infants: number;

  showAction?: boolean;
  customAction?: React.ReactNode;
  actionLabel?: string;
  actionFormId?: string;
  isSubmitting?: boolean;
  onActionClick?: () => void;
}

export const PriceSummary = ({
  tourCode,
  tourTitle,
  startDate,
  endDate,
  adultPrice,
  childPrice,
  infantPrice,
  adults,
  numChildren,
  infants,
  showAction = true,
  customAction,
  actionLabel = "Đặt ngay",
  actionFormId,
  isSubmitting = false,
  onActionClick,
}: PriceSummaryProps) => {
  const totalAdultPrice = adults * adultPrice;
  const totalChildPrice = numChildren * childPrice;
  const totalInfantPrice = infants * infantPrice;

  const totalPrice = totalAdultPrice + totalChildPrice + totalInfantPrice;

  const formatPrice = (price: number) => price.toLocaleString("vi-VN");

  const isCancel = actionLabel === "Hủy tour";

  return (
    <Card className="p-6 sticky top-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Ticket className="h-4 w-4" />
          <span>Mã tour: {tourCode}</span>
        </div>

        <h3 className="text-lg font-bold text-primary leading-snug">
          {tourTitle}
        </h3>

        <div className="flex items-center gap-2 text-sm font-medium pb-4 border-b border-border">
          <span>{startDate}</span>
          <ArrowRight className="h-4 w-4" />
          <span>{endDate}</span>
        </div>

        <div className="space-y-3">
          <PriceRow
            label="Người lớn"
            qty={adults}
            unitPrice={adultPrice}
            total={totalAdultPrice}
          />

          <PriceRow
            label="Trẻ em"
            qty={numChildren}
            unitPrice={childPrice}
            total={totalChildPrice}
          />

          <PriceRow
            label="Em bé"
            qty={infants}
            unitPrice={infantPrice}
            total={totalInfantPrice}
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold text-accent">Tổng cộng:</span>
          <span className="text-2xl font-bold text-accent">
            {formatPrice(totalPrice)} VNĐ
          </span>
        </div>

        {showAction && (
          <div className="mt-6 space-y-4">
            {customAction ? (
              <div className="animate-in fade-in slide-in-from-top-2">
                {customAction}
              </div>
            ) : (
              <Button
                type={onActionClick ? "button" : "submit"}
                form={actionFormId}
                disabled={isSubmitting}
                onClick={onActionClick}
                className={cn(
                  "w-full h-12 text-lg font-bold",
                  actionLabel === "Hủy tour" &&
                    "bg-destructive hover:bg-destructive/90",
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  actionLabel
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

interface PriceRowProps {
  label: string;
  qty: number;
  unitPrice: number;
  total: number;
}

const PriceRow = ({ label, qty, unitPrice, total }: PriceRowProps) => {
  const formatPrice = (price: number) => price.toLocaleString("vi-VN");

  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label} :</span>
      <span className="font-medium">
        {qty} x {formatPrice(unitPrice)} = {formatPrice(total)} VNĐ
      </span>
    </div>
  );
};
