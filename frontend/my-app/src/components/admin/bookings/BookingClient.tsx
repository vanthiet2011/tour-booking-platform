// components/admin/bookings/BookingClient.tsx
"use client";

import { useEffect, useState } from "react";
import bookingService from "@/services/booking.service"; // Import service mới
import { Booking, BookingPaginationResponse } from "@/types/booking";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { PaginationComponent } from "@/components/ui/PaginationComponent";

export default function BookingClient() {
  const [response, setResponse] = useState<BookingPaginationResponse | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Sử dụng service đã cập nhật
        const data = await bookingService.getAllAdmin(page, 10);
        setResponse(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách booking:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [page]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          Quản lý Booking ({response?.totalCount || 0})
        </h1>
      </div>

      <DataTable
        columns={columns}
        data={response?.items || []}
      />

      {/* Pagination component sử dụng setPage */}
      <div className="py-4">
        <PaginationComponent
          totalPages={response?.totalPages || 0}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
