import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Clock,
  Award,
  HeartHandshake,
  Headphones,
  Plane,
} from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Đảm bảo an toàn",
    description:
      "Cam kết mang đến trải nghiệm du lịch an toàn và chất lượng cao nhất",
    color: "text-nature",
  },
  {
    icon: Clock,
    title: "Hỗ trợ 24/7",
    description:
      "Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi",
    color: "text-ocean",
  },
  {
    icon: Award,
    title: "Giá tốt nhất",
    description:
      "Cam kết giá cả cạnh tranh và minh bạch, không phát sinh chi phí ẩn",
    color: "text-sunset",
  },
  {
    icon: HeartHandshake,
    title: "Dịch vụ tận tâm",
    description:
      "Đội ngũ hướng dẫn viên chuyên nghiệp, nhiệt tình và am hiểu địa phương",
    color: "text-primary",
  },
  {
    icon: Headphones,
    title: "Tư vấn miễn phí",
    description:
      "Nhận tư vấn chi tiết và lập kế hoạch du lịch phù hợp hoàn toàn miễn phí",
    color: "text-nature",
  },
  {
    icon: Plane,
    title: "Đa dạng tour",
    description:
      "Hàng trăm tour đa dạng từ trong nước đến quốc tế, phù hợp mọi nhu cầu",
    color: "text-ocean",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Tại sao chọn <span className="text-primary">VietTravel</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến cho bạn những trải nghiệm du lịch tuyệt
            vời nhất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-travel transition-all duration-300 hover:-translate-y-2 border-0 bg-card/50 backdrop-blur-sm"
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className={`h-8 w-8 ${benefit.color}`} />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-nature to-ocean rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Sẵn sàng khám phá Việt Nam?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Hãy để chúng tôi giúp bạn tạo nên những kỷ niệm đáng nhớ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="text-3xl font-bold">1900 2087</div>
              <div className="text-sm opacity-80">Hotline tư vấn miễn phí</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
