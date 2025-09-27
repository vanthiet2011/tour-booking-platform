import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import heroImage from "@/assets/hero-vietnam.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage.src})` }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Khám phá <span className="text-sand">Việt Nam</span>
          <br />
          cùng chúng tôi
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
          Trải nghiệm những điểm đến tuyệt vời nhất Việt Nam với dịch vụ chuyên
          nghiệp và giá cả hợp lý
        </p>

        {/* Search Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto shadow-travel">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Điểm đến"
                className="pl-10 h-12 text-foreground"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Ngày đi"
                className="pl-10 h-12 text-foreground"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Ngày về"
                className="pl-10 h-12 text-foreground"
              />
            </div>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <select className="w-full h-12 pl-10 pr-4 border border-input rounded-md bg-background text-foreground">
                <option>1 người</option>
                <option>2 người</option>
                <option>3 người</option>
                <option>4+ người</option>
              </select>
            </div>
          </div>
          <Button variant="default" size="lg" className="w-full md:w-auto mt-4">
            <Search className="h-5 w-5" />
            Tìm kiếm tour
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
