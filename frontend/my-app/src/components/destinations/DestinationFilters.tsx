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
  { id: "north", label: "Miền Bắc" },
  { id: "central", label: "Miền Trung" },
  { id: "south", label: "Miền Nam" },
];

export function DestinationFilters({
  searchTerm,
  onSearchChange,
  selectedRegions,
  allCategories,
  selectedCategory,
  onCategoryChange,
  onRegionChange,
}: DestinationFiltersProps) {
  const handleRegionToggle = (regionId: string, checked: boolean) => {
    const newRegions = checked
      ? [...selectedRegions, regionId]
      : selectedRegions.filter((r) => r !== regionId);
    onRegionChange(newRegions);
  };

  return (
    <div className="p-6 bg-card border rounded-lg shadow-sm space-y-6">
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

      <div>
        <h3 className="text-lg font-semibold mb-3">Vùng miền</h3>
        <div className="space-y-3">
          {regionOptions.map((region) => (
            <div key={region.id} className="flex items-center space-x-2">
              <Checkbox
                id={region.id}
                checked={selectedRegions.includes(region.id)}
                onCheckedChange={(checked) =>
                  handleRegionToggle(region.id, !!checked)
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

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          onSearchChange("");
          onRegionChange([]);
          onCategoryChange("all");
        }}
      >
        Đặt lại bộ lọc
      </Button>
    </div>
  );
}
