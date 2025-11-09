"use client";

import { Category } from "@/types/destination";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface DestinationFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;

  selectedRegions: string[];
  onRegionChange: (regions: string[]) => void;

  allCategories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const regionOptions = [
  { id: "bắc", label: "Miền Bắc" },
  { id: "trung", label: "Miền Trung" },
  { id: "nam", label: "Miền Nam" },
];

export function DestinationFilters({
  searchTerm,
  onSearchChange,
  selectedRegions,
  onRegionChange,
  allCategories,
  selectedCategory,
  onCategoryChange,
}: DestinationFiltersProps) {
  const handleRegionChange = (regionId: string, checked: boolean) => {
    let newRegions: string[];
    if (checked) {
      newRegions = [...selectedRegions, regionId];
    } else {
      newRegions = selectedRegions.filter((id) => id !== regionId);
    }
    onRegionChange(newRegions);
  };
  const handleResetFilters = () => {
    onSearchChange("");
    onRegionChange([]);
    onCategoryChange("all");
  };

  return (
    <div className="p-6 bg-card border rounded-lg shadow-sm space-y-6">
      {/* 1. BỘ LỌC TÌM KIẾM */}
      <div>
        <Label htmlFor="search" className="text-lg font-semibold">
          Tìm kiếm
        </Label>
        <Input
          id="search"
          placeholder="Nhập tên điểm đến..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="mt-2"
        />
      </div>

      <Separator />

      {/* 2. BỘ LỌC VÙNG MIỀN */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Vùng miền</h3>
        <div className="space-y-3">
          {regionOptions.map((region) => (
            <div key={region.id} className="flex items-center space-x-2">
              <Checkbox
                id={region.id}
                checked={selectedRegions.includes(region.id)}
                onCheckedChange={(checked) =>
                  handleRegionChange(region.id, !!checked)
                }
              />
              <Label htmlFor={region.id} className="cursor-pointer">
                {region.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* 3. BỘ LỌC DANH MỤC */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Danh mục</h3>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {allCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* 4. NÚT ĐẶT LẠI */}
      <Button variant="outline" className="w-full" onClick={handleResetFilters}>
        Đặt lại bộ lọc
      </Button>
    </div>
  );
}
