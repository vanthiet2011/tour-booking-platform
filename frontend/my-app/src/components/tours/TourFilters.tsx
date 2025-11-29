"use client";

import { useState } from "react";
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
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function TourFilters({ searchTerm, onSearchChange }: TourFiltersProps) {
  const [budget, setBudget] = useState([500000, 20000000]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN").format(value);
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
          onChange={(e) => onSearchChange(e.target.value)}
          className="mt-2"
        />
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="font-semibold text-sm">Loại tour</h4>
        <RadioGroup defaultValue="domestic" className="space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="abroad" id="abroad" />
            <Label htmlFor="abroad" className="font-normal">
              Tour Nước Ngoài
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="domestic" id="domestic" />
            <Label htmlFor="domestic" className="font-normal">
              Tour Trong Nước
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="premium" id="premium" />
            <Label htmlFor="premium" className="font-normal">
              Tour Cao Cấp
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label className="font-semibold text-sm">Điểm đến</Label>
        <Select defaultValue="danang">
          <SelectTrigger>
            <SelectValue placeholder="Chọn điểm đến" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hue">Huế</SelectItem>
            <SelectItem value="danang">Đà Nẵng</SelectItem>
            <SelectItem value="hoian">Hội An</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="font-semibold text-sm">Số ngày</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Chọn số ngày" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-3">1-3 ngày</SelectItem>
            <SelectItem value="4-7">4-7 ngày</SelectItem>
            <SelectItem value="8-14">8-14 ngày</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="font-semibold text-sm">Ngân sách</Label>
        <Slider
          value={budget}
          onValueChange={setBudget}
          min={0}
          max={50000000}
          step={500000}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(budget[0])}đ</span>
          <span>{formatCurrency(budget[1])}đ</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t">
        <Button className="w-full">Áp dụng</Button>
        <Button variant="outline" className="w-full">
          Xóa bộ lọc
        </Button>
      </div>
    </div>
  );
}
