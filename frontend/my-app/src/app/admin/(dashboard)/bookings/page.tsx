import BookingClient from "@/components/admin/bookings/BookingClient";

export default function AdminBookingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-50/50 dark:bg-slate-950 min-h-screen">
      <BookingClient />
    </div>
  );
}
