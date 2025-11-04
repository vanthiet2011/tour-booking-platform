import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface TouristCounterProps {
  label: string;
  subtitle?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const TouristCounter = ({
  label,
  subtitle,
  value,
  onChange,
  min = 0,
  max = 20,
}: TouristCounterProps) => {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  return (
    <div className="flex items-center justify-between border border-border rounded-lg p-4 bg-card">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={value <= min}
          className="h-8 w-8 rounded-full"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center font-semibold text-lg">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={value >= max}
          className="h-8 w-8 rounded-full"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
