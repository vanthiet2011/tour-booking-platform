"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

interface TourFiltersProps {
  className?: string;
  hideRegion?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const DURATION_OPTIONS = [
  { label: "3 ngày 2 đêm", value: "3" },
  { label: "4 ngày 3 đêm", value: "4" },
  { label: "5 ngày 4 đêm", value: "5" },
  { label: "6 ngày 5 đêm", value: "6" },
];

export function TourFilters({ hideRegion = false }: TourFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialMin = Number(searchParams.get("minPrice")) || 0;
  const MAX_PRICE = 50000000;
  const initialMax = Number(searchParams.get("maxPrice")) || MAX_PRICE;

  const initialMinDays = searchParams.get("minDays");
  const initialMaxDays = searchParams.get("maxDays");
  const initialDuration =
    initialMinDays && initialMinDays === initialMaxDays
      ? initialMinDays
      : undefined;

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [budget, setBudget] = useState([initialMin, initialMax]);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedBudget = useDebounce(budget, 500);
  const [duration, setDuration] = useState<string | undefined>(initialDuration);

  const initialRegion = searchParams.get("region") || "all";
  const [region, setRegion] = useState<string>(initialRegion);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    const currentSearch = searchParams.get("search") || "";
    const currentMinPrice = Number(searchParams.get("minPrice")) || 0;
    const currentMaxPrice = Number(searchParams.get("maxPrice")) || MAX_PRICE;
    const currentDuration = searchParams.get("minDays") || "all";
    const currentRegion = searchParams.get("region") || "all";

    const newSearch = debouncedSearch;
    const newMinPrice = debouncedBudget[0];
    const newMaxPrice = debouncedBudget[1];
    const newDuration = duration && duration !== "all" ? duration : "all";
    const newRegion = region && region !== "all" ? region : "all";

    const isFilterChanged =
      newSearch !== currentSearch ||
      newMinPrice !== currentMinPrice ||
      newMaxPrice !== currentMaxPrice ||
      newDuration !== currentDuration ||
      newRegion !== currentRegion;

    if (!isFilterChanged) return;

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    if (debouncedBudget[0] > 0) {
      params.set("minPrice", debouncedBudget[0].toString());
    } else {
      params.delete("minPrice");
    }

    if (debouncedBudget[1] < MAX_PRICE) {
      params.set("maxPrice", debouncedBudget[1].toString());
    } else {
      params.delete("maxPrice");
    }

    if (duration && duration !== "all") {
      params.set("minDurationDays", duration);
      params.set("maxDurationDays", duration);
    } else {
      params.delete("minDurationDays");
      params.delete("maxDurationDays");
    }

    if (region && region !== "all") {
      params.set("region", region);
    } else {
      params.delete("region");
    }

    params.set("page", "1");

    router.push(`?${params.toString()}`, { scroll: false });
  }, [
    debouncedSearch,
    debouncedBudget,
    duration,
    region,
    router,
    searchParams,
  ]);

  const handleReset = () => {
    setSearchTerm("");
    setBudget([0, MAX_PRICE]);
    setDuration("all");
    setRegion("all");
    router.push("?");
  };

  return (
    <div className="p-6 bg-card border rounded-lg shadow-sm space-y-6">
      <div>
        <Label htmlFor="search" className="text-lg font-semibold">
          Tìm kiếm
        </Label>
        <Input
          id="search"
          placeholder="Tìm kiếm tour..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-2"
        />
      </div>

      {!hideRegion && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">Khám phá theo miền</h4>
              {region !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRegion("all")}
                  className="h-auto p-0 text-xs text-muted-foreground"
                >
                  Xóa
                </Button>
              )}
            </div>

            <RadioGroup
              value={region}
              onValueChange={setRegion}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="r-all" />
                <Label htmlFor="r-all" className="font-normal cursor-pointer">
                  Tất cả
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="north" id="r-north" />
                <Label htmlFor="r-north" className="font-normal cursor-pointer">
                  Miền Bắc
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="central" id="r-central" />
                <Label
                  htmlFor="r-central"
                  className="font-normal cursor-pointer"
                >
                  Miền Trung
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="south" id="r-south" />
                <Label htmlFor="r-south" className="font-normal cursor-pointer">
                  Miền Nam
                </Label>
              </div>
            </RadioGroup>
          </div>
        </>
      )}
      <Separator />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Thời lượng</Label>
          {duration && duration !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
              onClick={() => setDuration("all")}
            >
              Xóa
            </Button>
          )}
        </div>
        <Select value={duration || "all"} onValueChange={setDuration}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn thời lượng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {DURATION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-lg font-semibold">Ngân sách</Label>
        <Slider
          value={budget}
          onValueChange={setBudget}
          min={0}
          max={MAX_PRICE}
          step={500000}
          className="py-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(budget[0])}</span>
          <span>{formatCurrency(budget[1])}</span>
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-4 border-t">
        <Button className="w-full" disabled>
          Tự động áp dụng...
        </Button>

        <Button variant="outline" className="w-full" onClick={handleReset}>
          Xóa bộ lọc
        </Button>
      </div>
    </div>
  );
}
