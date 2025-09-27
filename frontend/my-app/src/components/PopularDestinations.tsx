import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";
import hoiAnImage from "@/assets/hoi-an.jpg";
import phuQuocImage from "@/assets/phu-quoc.jpg";
import sapaImage from "@/assets/sapa.jpg";

const destinations = [
  {
    id: 1,
    name: "Hội An",
    location: "Quảng Nam",
    image: hoiAnImage,
    rating: 4.8,
    price: "1,200,000",
    description: "Phố cổ với kiến trúc độc đáo và văn hóa đặc sắc",
  },
  {
    id: 2,
    name: "Phú Quốc",
    location: "Kiên Giang",
    image: phuQuocImage,
    rating: 4.9,
    price: "2,500,000",
    description: "Đảo ngọc với bãi biển tuyệt đẹp và hải sản tươi ngon",
  },
  {
    id: 3,
    name: "Sapa",
    location: "Lào Cai",
    image: sapaImage,
    rating: 4.7,
    price: "1,800,000",
    description: "Ruộng bậc thang và văn hóa dân tộc thiểu số",
  },
];

const PopularDestinations = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Điểm đến <span className="text-primary">phổ biến</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá những địa điểm du lịch được yêu thích nhất tại Việt Nam
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <Card
              key={destination.id}
              className="group overflow-hidden hover:shadow-travel transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative overflow-hidden">
                <img
                  src={
                    typeof destination.image === "string"
                      ? destination.image
                      : destination.image.src
                  }
                  alt={destination.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">
                    {destination.rating}
                  </span>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{destination.location}</span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  {destination.name}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {destination.description}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">Từ </span>
                    <span className="text-lg font-bold text-primary">
                      {destination.price}đ
                    </span>
                  </div>
                  <Button variant="default" size="sm">
                    Xem chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Xem tất cả điểm đến
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
