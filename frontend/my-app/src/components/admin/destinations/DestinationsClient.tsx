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

export default function DestinationsClient() {
  const { toast } = useToast();
  const {
    data: destinations,
    error,
    isLoading,
  } = useSWR("/api/destinations", destinationService.getAll);

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
      // Tự động re-fetch data sau khi xóa
      mutate("/api/destinations");
      toast({ title: "Thành công", description: "Đã xóa điểm đến." });
    } catch (error) {
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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý Điểm đến</h2>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> Thêm Mới
        </Button>
      </div>

      <DataTable columns={columns} data={destinations || []} />

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
