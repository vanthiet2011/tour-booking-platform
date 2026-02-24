"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function StorySection() {
  return (
    <section className="py-8 bg-background overflow-hidden font-sans">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Câu Chuyện Đằng Sau{" "}
              <span className="text-primary">VietNature</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed">
              Được thành lập bởi những du khách yêu Việt Nam, VietNature sinh ra
              từ đam mê khám phá và mong muốn chia sẻ những trải nghiệm thực sự
              với du khách khác.
            </p>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Chúng tôi không chỉ tạo tour du lịch — chúng tôi tạo những khoảnh
              khắc được ghi nhớ, những kết nối có nghĩa, và những câu chuyện sẽ
              kéo dài cả đời.
            </p>
            <div className="flex gap-4">
              {[
                { number: "50K+", label: "Du khách hạnh phúc" },
                { number: "4.9★", label: "Đánh giá trung bình" },
                { number: "12+", label: "Năm kinh nghiệm" }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-primary mb-1">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>


          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-64 md:h-96 rounded-xl overflow-hidden shadow-xl"
          >
            <Image
              src="/images/sapa-terraced-rice-fields.jpg"
              alt="Sapa"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
