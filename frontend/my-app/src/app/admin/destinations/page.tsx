// src/app/admin/destinations/page.tsx

import { CreateDestinationForm } from "@/components/admin/destinations/CreateDestinationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DestinationsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Quản lý Điểm đến</h2>
      <Card>
        <CardHeader>
          <CardTitle>Tạo điểm đến mới</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateDestinationForm />
        </CardContent>
      </Card>
    </div>
  );
}
