"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const stories = [
  {
    name: "Trần Văn An",
    location: "Tour Hạ Long 2 ngày 1 đêm",
    story:
      "Chuyến đi thật tuyệt vời! Du thuyền sang trọng, đồ ăn ngon và hướng dẫn viên rất nhiệt tình. Vịnh Hạ Long đẹp ngoài sức tưởng tượng.",
    rating: 5,
    image: "/images/halong-bay-limestone-boats.jpg",
  },
  {
    name: "Lê Thị Bích",
    location: "Khám phá Sapa",
    story:
      "Tôi rất thích trải nghiệm trekking và ở homestay. Không khí trong lành, cảnh vật hùng vĩ. Một chuyến đi đáng nhớ để thoát khỏi thành phố.",
    rating: 5,
    image: "/images/mekong-delta-floating-market.jpg",
  },
  {
    name: "Nguyễn Hoàng Minh",
    location: "Phố cổ Hội An",
    story:
      "Hội An thật huyền ảo vào ban đêm. Dịch vụ của công ty rất tốt, sắp xếp xe đưa đón và khách sạn rất chu đáo. Sẽ quay lại!",
    rating: 4,
    image: "/images/sapa-rice-terraces-mountains.jpg",
  },
];

export function Testimonials() {
  return (
    <section className="py-8 bg-background font-sans">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-primary text-sm font-semibold tracking-wider mb-3">
            CÂU CHUYỆN CỰC THỊ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Những Trải Nghiệm Thực Sự Từ Du Khách
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((story, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-40">
                <Image
                  src={story.image || "/placeholder.svg"}
                  alt={story.name}
                  fill
                  className="object-cover opacity-50"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
              </div>
              <div className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(story.rating)].map((_, i) => (
                    <Star
                      key={`filled-${i}`}
                      className="text-yellow-500 fill-yellow-500 h-5 w-5"
                    />
                  ))}
                  {[...Array(5 - story.rating)].map((_, i) => (
                    <Star
                      key={`empty-${i}`}
                      className="text-gray-300 h-5 w-5"
                    />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed italic">
                  &ldquo;{story.story}&rdquo;
                </p>
                <div className="border-t border-border pt-4">
                  <p className="font-bold text-sm">{story.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {story.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
