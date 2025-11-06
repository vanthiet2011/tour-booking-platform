// src/components/destinations/DestinationFilters.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface DestinationFiltersProps {
  onSearchChange: (searchTerm: string) => void;
  onRegionChange: (regions: string[]) => void;
}

const MOCK_REGIONS = [
  { id: "bắc", name: "Miền Bắc" },
  { id: "trung", name: "Miền Trung" },
  { id: "nam", name: "Miền Nam" },
];

export function DestinationFilters({
  onSearchChange,
  onRegionChange,
}: DestinationFiltersProps) {
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  useEffect(() => {
    onRegionChange(selectedRegions);
  }, [selectedRegions, onRegionChange]);

  const handleRegionChange = (regionId: string) => {
    setSelectedRegions((prev) =>
      prev.includes(regionId)
        ? prev.filter((id) => id !== regionId)
        : [...prev, regionId]
    );
  };

  return (
    <Card className="sticky top-20">
      {" "}
      <CardHeader>
        <CardTitle className="text-lg">Tìm kiếm & Lọc</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên..."
            className="pl-10"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="font-semibold text-md">Lọc theo Miền</h3>
        <div className="space-y-3">
          {MOCK_REGIONS.map((region) => (
            <div key={region.id} className="flex items-center space-x-2">
              <Checkbox
                id={region.id}
                onCheckedChange={() => handleRegionChange(region.id)}
                checked={selectedRegions.includes(region.id)}
              />
              <Label htmlFor={region.id} className="font-normal cursor-pointer">
                {region.name}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
