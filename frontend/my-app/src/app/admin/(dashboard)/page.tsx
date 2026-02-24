"use client";

import { DashboardStats, TopToursTableProps } from "@/types/dashboard";
import { getDashboardStats } from "@/services/dashboard.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plane,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

const COLORS = {
  "Miền Bắc": "#3b82f6",
  "Miền Trung": "#f59e0b",
  "Miền Nam": "#ef4444",
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
  "AtOffice": { label: "Tại văn phòng", color: "#f59e0b" }, // Amber
  "VnPay": { label: "VNPay", color: "#005baa" }, // Blue
  "PayPal": { label: "PayPal", color: "#003087" }, // PayPal Blue
  "UnKnown": { label: "Không xác định", color: "#94a3b8" }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "Confirmed":
      return {
        label: "Đã xác nhận",
        class: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
      };
    case "Completed":
      return {
        label: "Hoàn thành",
        class: "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
      };
    case "Cancelled":
      return {
        label: "Đã hủy",
        class: "bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400",
      };
    case "Failed":
      return {
        label: "Thất bại",
        class: "bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400",
      };
    default: // Pending
      return {
        label: "Chờ xử lý",
        class: "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
      };
  }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <span className="ml-2 text-slate-500 dark:text-slate-400">Đang tải dữ liệu thực tế...</span>
      </div>
    );
  }
  return (
    <div className="space-y-6 bg-slate-50/50 dark:bg-slate-950 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Tổng quan hệ thống</h1>

      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng số tours"
          value={stats?.totalTours || 0}
          icon={<Plane />}
          color="text-emerald-600 dark:text-emerald-400"
          bgColor="bg-slate-100 dark:bg-slate-800"
        />
        <StatCard
          title="Tổng lượt booking"
          value={stats?.totalBookings || 0}
          icon={<CalendarCheck />}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-slate-100 dark:bg-slate-800"
        />
        <StatCard
          title="Người dùng đăng ký"
          value={stats?.totalUsers || 0}
          icon={<Users />}
          color="text-purple-600 dark:text-purple-400"
          bgColor="bg-slate-100 dark:bg-slate-800"
        />
        <StatCard
          title="Tổng doanh thu"
          value={`${(stats?.totalRevenue || 0).toLocaleString("vi-VN")} VNĐ`}
          icon={<DollarSign />}
          color="text-rose-600 dark:text-rose-400"
          bgColor="bg-slate-100 dark:bg-slate-800"
          isMoney
        />
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Phân bố Tours theo vùng miền"
          data={stats?.regionData || []}
          colors={COLORS}
        />
        {/* Prepare Data with colors and labels */}
        {(() => {
          const processedPaymentData = (stats?.paymentMethodData || []).map((item) => {
             const config = PAYMENT_CONFIG[item.name] || { label: item.name, color: "#94a3b8" };
             return {
               ...item,
               name: config.label,
               color: config.color,
               value: item.value
             };
          });

          return (
            <ChartCard 
              title="Phương thức thanh toán" 
              data={processedPaymentData} 
              // colors prop is no longer strictly needed if we inject color into data, 
              // but we keep it for fallback or if ChartCard relies on it for something else
            />
          );
        })()}
      </div>

      {/* 3. Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopToursTable data={stats?.topBookedTours || []} />
        <RecentBookingsTable data={stats?.recentBookings || []} />
      </div>
    </div>
  );
}

// --- Các Component hỗ trợ ---

function StatCard({ title, value, icon, trend, color, bgColor, isMoney }: { title: string; value: string | number; icon: React.ReactNode; trend?: React.ReactNode; color?: string; bgColor?: string; isMoney?: boolean }) {
  return (
    <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all dark:bg-slate-900 dark:border dark:border-slate-800">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div
            className={`p-2 rounded-lg ${bgColor || "bg-slate-100 dark:bg-slate-800"} ${color} group-hover:scale-110 transition-transform`}
          >
            {icon}
          </div>
          <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={14} className="mr-1" /> {trend}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
          <h3
            className={`text-xl font-bold mt-1 ${
              isMoney ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {value}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, data, colors }: { title: string; data: { name: string; value: number; color?: string }[]; colors?: Record<string, string> }) {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center justify-between gap-6">
          <div className="h-[200px] w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {data.map((entry: { name: string; value: number; color?: string }, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || colors?.[entry.name] || "#cbd5e1"}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', color: 'var(--popover-foreground)' }}
                  itemStyle={{ color: 'var(--popover-foreground)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-1/2 space-y-4">
            {data.map((entry: { name: string; value: number; color?: string }, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{
                      backgroundColor: entry.color || colors?.[entry.name] || "#cbd5e1",
                    }}
                  />
                  <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
                    {entry.name}
                  </span>
                </div>
                <span className="text-slate-400 dark:text-slate-500 font-bold ml-2">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentBookingsTable({ data }: { data: { bookingId: string; customerName: string; totalPrice: number; status: string }[] }) {
  return (
    <Card className="border-none shadow-sm dark:bg-slate-900 dark:border dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          Đơn đặt mới
        </CardTitle>
        <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300">
          Xem tất cả
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow className="dark:border-slate-800">
              <TableHead className="w-[100px] dark:text-slate-400">Mã đơn</TableHead>
              <TableHead className="dark:text-slate-400">Khách hàng</TableHead>
              <TableHead className="dark:text-slate-400">Tổng tiền</TableHead>
              <TableHead className="dark:text-slate-400">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data || data.length === 0 ? (
              <TableRow className="dark:border-slate-800">
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground dark:text-slate-500"
                >
                  Chưa có đơn hàng nào.
                </TableCell>
              </TableRow>
            ) : (
              data.map((booking) => {
                const statusConfig = getStatusConfig(booking.status);

                return (
                  <TableRow
                    key={booking.bookingId}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors dark:border-slate-800"
                  >
                    <TableCell className="font-medium text-slate-500 dark:text-slate-400">
                      #{booking.bookingId}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-200">
                      {booking.customerName}
                    </TableCell>
                    <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                      {new Intl.NumberFormat("vi-VN").format(
                        booking.totalPrice
                      )}{" "}
                      đ
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-none ${statusConfig.class}`}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function TopToursTable({ data }: TopToursTableProps) {
  return (
    <Card className="border-none shadow-sm dark:bg-slate-900 dark:border dark:border-slate-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          Tours được đặt nhiều nhất
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow className="dark:border-slate-800">
              <TableHead className="dark:text-slate-400">Tên Tour</TableHead>
              <TableHead className="text-center w-[150px] dark:text-slate-400">
                Số chỗ đã đặt
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((tour) => (
                <TableRow key={tour.tourId} className="dark:border-slate-800">
                  <TableCell className="max-w-[250px] truncate font-medium dark:text-slate-300">
                    {tour.tourName}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {tour.bookedCount}/{tour.totalSlots}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">
                          {Math.round(
                            (tour.bookedCount / tour.totalSlots) * 100
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={(tour.bookedCount / tour.totalSlots) * 100}
                        className="h-1.5"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="dark:border-slate-800">
                <TableCell
                  colSpan={2}
                  className="text-center py-8 text-slate-400 dark:text-slate-600"
                >
                  Chưa có dữ liệu đặt tour
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}

