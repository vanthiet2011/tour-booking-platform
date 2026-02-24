export interface RegionStat {
  name: string;
  value: number;
}

export interface RecentBooking {
  bookingId: string;
  customerName: string;
  totalPrice: number;
  status: "Pending" | "Confirmed" | "Cancelled" | "Failed";
  createdAt: string;
}

export interface DashboardStats {
  id: number;
  totalTours: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  lastUpdated: string;
  regionData: RegionStat[];
  paymentMethodData: RegionStat[];
  recentBookings: RecentBooking[];
  topBookedTours: TopTour[];
}

export interface TopTour {
  tourId: string;
  tourName: string;
  bookedCount: number;
  totalSlots: number;
}

export interface TopToursTableProps {
  data: TopTour[];
}
