import { Suspense } from "react";
import { notFound } from "next/navigation";
import tourService from "@/services/tour.service";
import destinationService from "@/services/destination.service";
import { EditTourForm } from "@/components/admin/tours/EditTourForm";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 0;

interface EditTourPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function EditTourPageContent({ id }: { id: string }) {
  let tourData;
  let destinationsData;

  try {
    const tourDataPromise = tourService.getById(id);
    const destinationsDataPromise = destinationService.getAll({
      page: 1,
      pageSize: 999,
    });

    [tourData, destinationsData] = await Promise.all([
      tourDataPromise,
      destinationsDataPromise,
    ]);
  } catch (error) {
    console.error("Failed to fetch edit data:", error);
    return notFound();
  }

  if (!tourData) {
    return notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <EditTourForm
        initialData={tourData}
        destinations={destinationsData?.items || []}
      />
    </div>
  );
}

export default async function EditTourPage({ params }: EditTourPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<AdminTourEditSkeleton />}>
      <EditTourPageContent id={id} />
    </Suspense>
  );
}

function AdminTourEditSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
