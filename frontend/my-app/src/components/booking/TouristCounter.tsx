import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface TouristCounterProps {
  label: string;
  subtitle?: string;
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  readOnly?: boolean; // NEW
}

export const TouristCounter = ({
  label,
  subtitle,
  value,
  onChange,
  min = 0,
  max = 20,
  readOnly = false,
}: TouristCounterProps) => {
  const handleIncrement = () => {
    if (readOnly) return;
    if (value < max) {
      onChange?.(value + 1);
    }
  };

  const handleDecrement = () => {
    if (readOnly) return;
    if (value > min) {
      onChange?.(value - 1);
    }
  };

  return (
    <div className="flex items-center justify-between border border-border rounded-lg p-4 bg-card">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={readOnly || value <= min}
          className="h-7 w-7 rounded-full"
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>

        <span className="w-6 text-center font-semibold text-lg">{value}</span>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={readOnly || value >= max}
          className="h-7 w-7 rounded-full"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
