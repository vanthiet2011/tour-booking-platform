"use client";

import React from "react";

export default function StorySection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Câu Chuyện Đằng Sau VietNature
            </h2>
            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
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
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">50K+</div>
                <div className="text-sm text-muted-foreground">
                  Du khách hạnh phúc
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">4.9★</div>
                <div className="text-sm text-muted-foreground">
                  Đánh giá trung bình
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">12+</div>
                <div className="text-sm text-muted-foreground">
                  Năm kinh nghiệm
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-96 rounded-xl overflow-hidden shadow-xl">
            <img
              src="/images/sapa-terraced-rice-fields.jpg"
              alt="Sapa"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
