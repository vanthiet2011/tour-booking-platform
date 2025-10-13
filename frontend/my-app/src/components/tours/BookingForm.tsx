"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export function BookingForm() {
  const [startDate, setStartDate] = useState("2025-01-10");
  const [endDate, setEndDate] = useState("2025-01-14");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const calculateDuration = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const nights = diffDays - 1;
    return { days: diffDays, nights };
  };

  const duration = calculateDuration();
  const adultPrice = 3990000;
  const childPrice = 2090000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking submitted:", { startDate, endDate, adults, children });
  };

  return (
    <Card className="sticky top-24 border-border/50 bg-card p-6 shadow-lg">
      <h3 className="mb-6 text-2xl font-bold text-card-foreground">
        Tour Booking
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-card-foreground">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-card-foreground">
              Ngày kết thúc
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="rounded-lg bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">Thời gian :</p>
          <p className="mt-1 font-medium text-card-foreground">
            {duration.days} ngày {duration.nights} đêm
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-card-foreground">Vé:</h4>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-card-foreground">
                Người lớn
              </p>
              <p className="text-sm text-muted-foreground">
                {adultPrice.toLocaleString("vi-VN")} VND
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAdults(Math.max(0, adults - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-muted"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{adults}</span>
              <button
                type="button"
                onClick={() => setAdults(adults + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-muted"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-card-foreground">Trẻ em</p>
              <p className="text-sm text-muted-foreground">
                {childPrice.toLocaleString("vi-VN")} VND
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setChildren(Math.max(0, children - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-muted"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{children}</span>
              <button
                type="button"
                onClick={() => setChildren(children + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background hover:bg-muted"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-card-foreground">Tổng cộng:</p>
            <p className="text-xl font-bold text-primary">
              {(adults * adultPrice + children * childPrice).toLocaleString(
                "vi-VN"
              )}{" "}
              VND
            </p>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-[#5a9f5e] text-white hover:bg-[#4a8f4e] transition-colors"
        >
          Đặt Ngay
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Bạn cần trợ giúp không?
        </p>
      </form>
    </Card>
  );
}
