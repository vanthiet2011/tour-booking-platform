"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import destinationService from "@/services/destination.service";
import { Destination } from "@/types/destination";
import { useToast } from "@/hooks/use-toast";
import { DestinationForm } from "./DestinationForm";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { PaginationComponent } from "@/components/ui/PaginationComponent";

const ITEMS_PER_PAGE = 10;

export default function DestinationsClient() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const swrKey = ["/destinations/admin", page];
  const {
    data: paginatedData,
    error,
    isLoading,
  } = useSWR(swrKey, ([pageNum]) =>
    destinationService.getAll({
      page: Number(pageNum),
      limit: ITEMS_PER_PAGE,
    })
  );

  const destinations = paginatedData?.items || [];
  const totalPages = paginatedData?.totalPages || 1;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);

  const handleAdd = () => {
    setSelectedDestination(null);
    setIsFormOpen(true);
  };

  const handleEdit = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsFormOpen(true);
  };

  const handleDelete = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDestination) return;
    try {
      await destinationService.delete(selectedDestination.id);
      if (destinations.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        mutate(swrKey);
      }
      toast({ title: "Thành công", description: "Đã xóa điểm đến." });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể xóa điểm đến.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedDestination(null);
    }
  };

  const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete });

  if (isLoading) return <div>Đang tải...</div>;
  if (error) return <div>Không thể tải dữ liệu.</div>;

  return (
    <>
      <div className="flex items-center justify-between ">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Điểm đến</h1>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> Thêm Mới
        </Button>
      </div>

      <DataTable columns={columns} data={destinations} />
      <div className="mt-6">
        <PaginationComponent
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>

      {/* Form Dialog (Thêm/Sửa) */}
      <DestinationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        destination={selectedDestination}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemName={selectedDestination?.name}
      />
    </>
  );
}
