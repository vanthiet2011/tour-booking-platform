"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tour, TourDepartureInfo } from "@/types/tour";

interface BookingFormProps {
  tour: Tour;
  departures: TourDepartureInfo[] | undefined;
}

export function BookingForm({ tour, departures = [] }: BookingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDeparture, setSelectedDeparture] =
    useState<TourDepartureInfo | null>(null);
  const [endDate, setEndDate] = useState("");

  const availableDateStrings = new Set(
    departures.map((dep) => format(parseISO(dep.startDate), "yyyy-MM-dd"))
  );

  const availableDates = Array.from(availableDateStrings).map((d) =>
    parseISO(d)
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const dateString = format(date, "yyyy-MM-dd");
    const departure = departures.find(
      (d) => format(parseISO(d.startDate), "yyyy-MM-dd") === dateString
    );
    setSelectedDeparture(departure || null);
    if (departure) {
      setEndDate(format(parseISO(departure.endDate), "dd/MM/yyyy"));
    } else {
      setEndDate("");
    }
  };

  const handleBookNow = () => {
    if (!selectedDeparture) {
      toast({
        title: "Chưa chọn ngày",
        description: "Vui lòng chọn một ngày khởi hành từ lịch.",
        variant: "destructive",
      });
      return;
    }
    router.push(
      `/booking/checkout?tourId=${tour.id}&departureId=${selectedDeparture.id}`
    );
  };

  return (
    <Card className="sticky top-24 p-4 shadow-lg">
      <CardContent className="space-y-4">
        <div className="grid w-full items-center gap-2">
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Ngày bắt đầu
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDeparture && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDeparture ? (
                  format(parseISO(selectedDeparture.startDate), "dd/MM/yyyy", {
                    locale: vi,
                  })
                ) : (
                  <span>Chọn ngày có sẵn</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  selectedDeparture
                    ? parseISO(selectedDeparture.startDate)
                    : undefined
                }
                onSelect={handleDateSelect}
                modifiers={{ available: availableDates }}
                modifiersClassNames={{
                  available: "bg-primary text-primary-foreground rounded-md",
                }}
                disabled={(date) =>
                  !availableDateStrings.has(format(date, "yyyy-MM-dd"))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Ngày kết thúc
          </label>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            disabled
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDeparture
              ? format(parseISO(selectedDeparture.endDate), "dd/MM/yyyy", {
                  locale: vi,
                })
              : "Chưa có ngày kết thúc"}
          </Button>
        </div>
        {tour.duration && (
          <div className="rounded-lg bg-muted/30 p-3 text-sm">
            <p className="text-muted-foreground">
              Thời gian:{" "}
              <span className="font-semibold text-foreground">
                {tour.duration}
              </span>
            </p>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-card-foreground">
            Giá mỗi khách:
          </span>
          <span className="font-semibold text-primary text-xl">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(tour.pricePerAdult)}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleBookNow}
          className="w-full flex items-center justify-center gap-1"
          size="lg"
        >
          <span className="leading-none">Đặt Ngay</span>
          <ArrowRight className="h-5 w-5 relative top-[2px]" />
        </Button>
      </CardFooter>
    </Card>
  );
}
