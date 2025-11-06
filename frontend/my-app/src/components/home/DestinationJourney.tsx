// src/components/home/DestinationJourney.tsx
import Image from "next/image";

export function DestinationJourney() {
  return (
    <section className="py-8 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block text-primary text-sm font-semibold tracking-wider mb-3">
            KHÁM PHÁ VIỆT NAM
          </span>
          <h2 className="text-4xl lg:text-4xl font-bold mb-4">
            Từ Miền Bắc Đến Miền Nam
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              region: "Miền Bắc",
              description:
                "Nơi có Hà Nội cổ kính, Hạ Long Bay huyền ảo, và Sapa với những ruộng bậc thang tuyệt đẹp",
              highlights: ["Hà Nội", "Hạ Long", "Sapa", "Ninh Bình"],
              image: "/images/vietnam-northern-mountains-hanoi.jpg",
            },
            {
              region: "Miền Trung",
              description:
                "Nơi gặp gỡ di sản, văn hóa truyền thống, và những bãi biển hoang sơ",
              highlights: ["Huế", "Hội An", "Đà Nẵng", "Phong Nha"],
              image: "/images/hoi-an-danang-vietnam-central.jpg",
            },
            {
              region: "Miền Nam",
              description:
                "Nơi Sài Gòn sôi động, Mekong Delta yên tĩnh, và những hòn đảo thiên đường",
              highlights: ["Sài Gòn", "Cần Thơ", "Phú Quốc", "Bến Tre"],
              image: "/images/ho-chi-minh-mekong-delta.jpg",
            },
          ].map((region) => (
            <div key={region.region} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl h-72 mb-4 shadow-lg">
                <Image
                  src={region.image || "/placeholder.svg"}
                  alt={region.region}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition"></div>
              </div>
              <h3 className="text-2xl font-bold mb-2">{region.region}</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {region.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {region.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-block bg-primary/10 text-primary text-xs font-semibold px-4 py-1 rounded-full"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
