import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

export function TourReviews() {
  const reviews = [
    {
      name: "Nguyễn Thị Mai",
      location: "Hà Nội",
      rating: 5,
      date: "Tháng 3, 2024",
      comment:
        "Chuyến đi tuyệt vời! Hướng dẫn viên nhiệt tình, phong cảnh đẹp không thể tả. Đặc biệt ấn tượng với bữa tối hải sản trên tàu. Chắc chắn sẽ quay lại!",
      avatar: "/vietnamese-woman-smiling-portrait.jpg",
    },
    {
      name: "Trần Văn Hùng",
      location: "TP. Hồ Chí Minh",
      rating: 5,
      date: "Tháng 2, 2024",
      comment:
        "Tour được tổ chức rất chuyên nghiệp. Lịch trình hợp lý, không bị gấp rút. Phòng nghỉ sạch sẽ, thoải mái. Rất đáng giá tiền!",
      avatar: "/vietnamese-man-smiling-portrait.jpg",
    },
    {
      name: "Lê Thị Hương",
      location: "Đà Nẵng",
      rating: 5,
      date: "Tháng 1, 2024",
      comment:
        "Trải nghiệm tuyệt vời cho cả gia đình. Các bạn nhỏ rất thích chèo kayak và bơi lội. Cảm ơn đội ngũ đã chăm sóc chu đáo!",
      avatar: "/vietnamese-woman-happy-portrait.jpg",
    },
  ];

  return (
    <section className="bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Đánh Giá Từ Khách Hàng
          </h2>
          <div className="mx-auto flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-accent text-accent" />
              ))}
            </div>
            <span className="text-lg font-semibold text-foreground">5.0</span>
            <span className="text-muted-foreground">(127 đánh giá)</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <Card key={index} className="border-border/50 bg-card p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex gap-3">
                  <img
                    src={review.avatar || "/placeholder.svg"}
                    alt={review.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-card-foreground">
                      {review.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {review.location}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <div className="flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {review.date}
                </span>
              </div>

              <p className="leading-relaxed text-card-foreground">
                {review.comment}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
