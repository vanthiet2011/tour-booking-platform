import { Badge } from "@/components/ui/badge"; // Giả định dùng Shadcn UI
import { BookingStatus } from "@/types/booking";

export const BookingStatusBadge = ({ status }: { status: BookingStatus }) => {
  const statusStyles: Record<BookingStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    Confirmed: "bg-green-100 text-green-800 hover:bg-green-100",
    Cancelled: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    Failed: "bg-red-100 text-red-800 hover:bg-red-100",
    Completed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  };

  return <Badge className={statusStyles[status] || ""}>{status}</Badge>;
};
