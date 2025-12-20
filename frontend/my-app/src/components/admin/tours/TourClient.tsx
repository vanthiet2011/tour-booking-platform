"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import tourService from "@/services/tour.service";
import { PaginationComponent } from "@/components/ui/PaginationComponent";

const ITEMS_PER_PAGE = 10;

export const TourClient: React.FC = () => {
  const [page, setPage] = useState(1);
  const swrKey = ["/tours/admin", page];

  const {
    data: paginatedData,
    error,
    isLoading,
  } = useSWR(swrKey, ([pageNum]) =>
    tourService.getPaginatedTours(
      new URLSearchParams({
        page: pageNum.toString(),
        pageSize: ITEMS_PER_PAGE.toString(),
      })
    )
  );

  const tours = paginatedData?.items || [];
  const totalPages = paginatedData?.totalPages || 1;

  const columns = getColumns(() => mutate(swrKey));

  if (isLoading)
    return <div className="text-center py-10">Đang tải dữ liệu tour...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-500">
        Không thể tải dữ liệu.
      </div>
    );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">
          Quản lý Tour ({paginatedData?.totalCount || 0})
        </h1>
        <Button onClick={() => (window.location.href = "/admin/tours/create")}>
          <Plus className="mr-2 h-4 w-4" /> Thêm mới
        </Button>
      </div>

      <DataTable columns={columns} data={tours} />

      <div className="mt-6">
        <PaginationComponent
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>
    </>
  );
};
