import DestinationsClient from "@/components/admin/destinations/DestinationsClient";

export default function DestinationsPage() {
  return (
    <div className="flex-1 space-y-6 bg-slate-50/50 dark:bg-slate-950 min-h-screen">
      <DestinationsClient />
    </div>
  );
}
