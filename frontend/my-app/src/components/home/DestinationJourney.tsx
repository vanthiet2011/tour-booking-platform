"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export function DestinationJourney() {
  const regions = [
    {
      region: "Miền Bắc",
      description:
        "Nơi có Hà Nội cổ kính, Hạ Long Bay huyền ảo, và Sapa với những ruộng bậc thang tuyệt đẹp",
      highlights: ["Hà Nội", "Hạ Long", "Sapa", "Ninh Bình"],
      image: "/images/vietnam-northern-mountains-hanoi.jpg",
      regionParam: "north",
    },
    {
      region: "Miền Trung",
      description:
        "Nơi gặp gỡ di sản, văn hóa truyền thống, và những bãi biển hoang sơ",
      highlights: ["Huế", "Hội An", "Đà Nẵng", "Phong Nha"],
      image: "/images/hoi-an-danang-vietnam-central.jpg",
      regionParam: "central",
    },
    {
      region: "Miền Nam",
      description:
        "Nơi Sài Gòn sôi động, Mekong Delta yên tĩnh, và những hòn đảo thiên đường",
      highlights: ["Sài Gòn", "Cần Thơ", "Phú Quốc", "Bến Tre"],
      image: "/images/ho-chi-minh-mekong-delta.jpg",
      regionParam: "south",
    },
  ];

  return (
    <section className="py-8 bg-secondary/20 font-sans">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <span className="inline-block text-primary text-sm font-semibold tracking-wider mb-3">
            KHÁM PHÁ VIỆT NAM
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Từ Miền Bắc Đến Miền Nam
          </h2>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {regions.map((region) => (
            <motion.div key={region.region} variants={itemVariants}>
              <Link
                href={`/tours?region=${region.regionParam}`}
                className="group cursor-pointer block h-full"
              >
                <div className="relative overflow-hidden rounded-xl h-72 mb-4 shadow-lg">
                  <Image
                    src={region.image}
                    alt={region.region}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
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
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
