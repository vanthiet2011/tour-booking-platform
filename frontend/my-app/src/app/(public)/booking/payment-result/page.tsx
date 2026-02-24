"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Loader2,
  History,
  Home,
} from "lucide-react";

import { paymentService } from "@/services/payment.service";

type UIStatus =
  | "Pending"
  | "Succeeded"
  | "Failed"
  | "Expired"
  | "Refunded"
  | "OfficePending"
  | "loading"
  | "not_found";

function PaymentResultContent() {
  const params = useSearchParams();
  const router = useRouter();

  const paymentIdFromUrl = params.get("vnp_TxnRef") || params.get("paymentId");
  const responseCode = params.get("vnp_ResponseCode");

  const [status, setStatus] = useState<UIStatus>("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [actualBookingId, setActualBookingId] = useState<string | null>(null);
  const MAX_RETRIES = 20;

  useEffect(() => {
    if (!paymentIdFromUrl) {
      setStatus("not_found");
      return;
    }

    // Trigger backend verification manually (Localhost/Ngrok workaround)
    const triggerBackendVerification = async () => {
        try {
            if (params.toString().includes("vnp_SecureHash")) {
                await paymentService.verifyVnPay(params.toString());
            }
        } catch (err) {
            console.error("Backend verification trigger failed", err);
        }
    };

    triggerBackendVerification().then(() => {
        // Continue with polling logic
        if (responseCode && responseCode !== "00") {
            // Even if backend update failed, we show failed UI
            setStatus("Failed");
            return;
        }
    

        let currentRetry = 0;
    
        const checkPaymentStatus = async () => {
          if (currentRetry >= MAX_RETRIES) {
            setStatus("Expired");
            return;
          }
    
          try {
            const data = await paymentService.getStatusById(paymentIdFromUrl);
            setActualBookingId(data.bookingId);
    
            switch (data.status) {
              case "Succeeded":
              case "Completed":
                setStatus("Succeeded");
                break;
              case "Failed":
                setStatus("Failed");
                break;
              case "AwaitingOffice":
                setStatus("OfficePending");
                break;
              case "Expired":
                setStatus("Expired");
                break;
              case "Refunded":
                setStatus("Refunded");
                break;
              case "Pending":
              default:
                currentRetry++;
                setRetryCount(currentRetry);
                setTimeout(checkPaymentStatus, 3000);
                break;
            }
          } catch {
            currentRetry++;
            setRetryCount(currentRetry);
            setTimeout(checkPaymentStatus, 3000);
          }
        };
    
        checkPaymentStatus();
    });

    return () => {
      // Cleanup logic if needed
    };
  }, [paymentIdFromUrl, responseCode, params]);

  const renderContent = () => {
    switch (status) {
      case "loading":
      case "Pending":
        return (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-gray-700">
              Đang xác nhận thanh toán...
            </h2>
            <p className="text-sm text-gray-500">
              Đang kiểm tra kết quả giao dịch (Lần thử {retryCount}/
              {MAX_RETRIES})
            </p>
          </div>
        );

      case "Succeeded":
        return (
          <div className="space-y-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-800">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600">
              Mã đặt chỗ:{" "}
              <span className="font-bold">{actualBookingId || "..."}</span>
            </p>
            <button
              onClick={() =>
                router.push(`/profile/my-bookings/${actualBookingId}`)
              }
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-2xl hover:bg-green-700 transition-all font-bold shadow-lg active:scale-[0.98]"
            >
              <History className="w-5 h-5" /> Xem lại đơn hàng
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 text-sm text-gray-500 hover:text-primary transition-colors font-medium"
            >
              Quay lại trang chủ
            </button>
          </div>
        );

      case "OfficePending":
        return (
          <div className="space-y-6">
            <Clock className="w-20 h-20 text-yellow-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-800">
              Chờ thanh toán tại văn phòng
            </h1>
            <div className="text-gray-600 space-y-2 text-left bg-yellow-50 p-4 rounded-xl">
              <p>
                <strong>Mã đặt chỗ:</strong> {actualBookingId}
              </p>
              <p>
                Vui lòng đến văn phòng của chúng tôi để hoàn tất thanh toán trong vòng <span className="font-bold text-red-500">24 giờ</span>.
              </p>
              <p className="text-sm italic">
                * Nếu quá thời hạn, đơn đặt chỗ của bạn sẽ tự động bị hủy.
              </p>
            </div>
             <button
              onClick={() =>
                router.push(`/profile/my-bookings/${actualBookingId}`)
              }
              className="w-full bg-yellow-600 text-white py-3 rounded-xl hover:bg-yellow-700 transition font-semibold"
            >
              Xem chi tiết đơn hàng
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full py-2 text-sm text-gray-500 hover:text-primary transition-colors"
            >
             Về trang chủ
            </button>
          </div>
        );

      case "Failed":
        return (
          <div className="space-y-6">
            <XCircle className="w-20 h-20 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-800">
              Thanh toán thất bại
            </h1>
            <p className="text-gray-600">
              Giao dịch không thành công hoặc đã bị hủy.
            </p>
            <button
              onClick={() => router.push("/booking/checkout")}
              className="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition"
            >
              Thử thanh toán lại
            </button>
          </div>
        );

      case "Expired":
        return (
          <div className="space-y-6">
            <Clock className="w-20 h-20 text-orange-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-800">
              Giao dịch hết hạn
            </h1>
            <p className="text-gray-600">
              Hệ thống chưa nhận được xác nhận thanh toán kịp thời.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-800 text-white py-3 rounded-xl transition"
            >
              Quay lại trang chủ
            </button>
          </div>
        );

      case "Refunded":
        return (
          <div className="space-y-6">
            <RotateCcw className="w-20 h-20 text-blue-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-800">Đã hoàn tiền</h1>
            <p className="text-gray-600">
              Giao dịch này đã được hoàn lại tiền.
            </p>
            <button
              onClick={() => router.push("/booking/history")}
              className="w-full bg-blue-600 text-white py-3 rounded-xl transition"
            >
              Xem chi tiết
            </button>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-gray-800">
              ⚠️ Không tìm thấy đơn hàng
            </h1>
            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center gap-2 text-blue-600 mx-auto hover:underline"
            >
              <Home className="w-4 h-4" /> Về trang chủ
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
        {renderContent()}
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Đang tải kết quả...
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
