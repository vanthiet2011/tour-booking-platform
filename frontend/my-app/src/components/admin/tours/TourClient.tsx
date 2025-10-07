"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { getTours, deleteTour, Tour } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TourForm } from "./TourForm";
// Import DeleteConfirmationDialog bạn đã có
import { DeleteConfirmationDialog } from "../destinations/DeleteConfirmationDialog";

export default function TourClient() {
  const { toast } = useToast();
  const { data: tours, error, isLoading } = useSWR("/api/tours", getTours);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  const handleAdd = () => {
    setSelectedTour(null);
    setIsFormOpen(true);
  };
  const handleEdit = (tour: Tour) => {
    setSelectedTour(tour);
    setIsFormOpen(true);
  };
  const handleDelete = (tour: Tour) => {
    setSelectedTour(tour);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTour) return;
    try {
      await deleteTour(selectedTour.id);
      mutate("/api/tours");
      toast({ title: "Thành công", description: "Đã xóa tour." });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa tour.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedTour(null);
    }
  };

  const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete });

  if (isLoading) return <div>Đang tải...</div>;
  if (error) return <div>Không thể tải dữ liệu.</div>;

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý Tours</h2>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> Thêm Mới
        </Button>
      </div>

      <DataTable columns={columns} data={tours || []} />

      <TourForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        tour={selectedTour}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemName={selectedTour?.name}
      />
    </>
  );
}
