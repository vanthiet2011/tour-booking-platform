import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export function TourPricing() {
  const packages = [
    {
      name: "Phòng Tiêu Chuẩn",
      price: "4.500.000",
      description: "Phòng đôi hoặc phòng đơn với đầy đủ tiện nghi cơ bản",
      features: [
        "Phòng điều hòa",
        "Phòng tắm riêng",
        "Cửa sổ nhìn ra vịnh",
        "Wifi miễn phí",
      ],
      popular: false,
    },
    {
      name: "Phòng Deluxe",
      price: "6.200.000",
      description: "Phòng rộng rãi với ban công riêng và tầm nhìn tuyệt đẹp",
      features: [
        "Tất cả tiện nghi phòng Tiêu Chuẩn",
        "Ban công riêng",
        "Phòng rộng hơn",
        "Minibar miễn phí",
        "Dịch vụ phòng 24/7",
      ],
      popular: true,
    },
    {
      name: "Suite VIP",
      price: "9.800.000",
      description:
        "Phòng cao cấp nhất với không gian sang trọng và dịch vụ đặc biệt",
      features: [
        "Tất cả tiện nghi phòng Deluxe",
        "Phòng khách riêng",
        "Bồn tắm jacuzzi",
        "Bữa tối riêng tư",
        "Massage miễn phí",
        "Đưa đón riêng",
      ],
      popular: false,
    },
  ];

  return (
    <section className="bg-secondary/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Bảng Giá Tour
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Chọn gói phù hợp với nhu cầu và ngân sách của bạn
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {packages.map((pkg, index) => (
            <Card
              key={index}
              className={`relative border-border/50 bg-card p-8 transition-all hover:shadow-xl ${
                pkg.popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                    Phổ Biến Nhất
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-2 text-2xl font-semibold text-card-foreground">
                  {pkg.name}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {pkg.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">
                    {pkg.price}
                  </span>
                  <span className="text-muted-foreground">₫</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">/ người</p>
              </div>

              <ul className="mb-8 space-y-3">
                {pkg.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="leading-relaxed text-card-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  pkg.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Chọn Gói Này
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            * Giá có thể thay đổi tùy theo mùa. Liên hệ để biết thêm chi tiết và
            ưu đãi nhóm.
          </p>
        </div>
      </div>
    </section>
  );
}
