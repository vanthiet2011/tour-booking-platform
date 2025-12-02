"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PaginationComponent } from "@/components/ui/PaginationComponent";

interface TourPaginationProps {
  totalPages: number;
  currentPage: number;
}

export function TourPagination({
  totalPages,
  currentPage,
}: TourPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <PaginationComponent
      totalPages={totalPages}
      currentPage={currentPage}
      onPageChange={handlePageChange}
    />
  );
}
