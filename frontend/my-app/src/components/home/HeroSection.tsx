"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Users } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const SLIDES = [
  {
    id: 1,
    image: "/images/hoi-an-danang-vietnam-central.jpg",
    title: "Khám Phá Việt Nam",
    subtitle: "Trải nghiệm những điểm đến tuyệt vời nhất với dịch vụ chuyên nghiệp."
  },
  {
    id: 2,
    image: "/images/halong-bay-limestone-boats.jpg",
    title: "Kỳ Quan Hạ Long",
    subtitle: "Du thuyền thượng hạng giữa lòng di sản thiên nhiên thế giới."
  },
  {
    id: 3,
    image: "/images/sapa-rice-terraces-mountains.jpg",
    title: "Sắc Màu Tây Bắc",
    subtitle: "Chinh phục đỉnh Fansipan và khám phá văn hóa bản địa độc đáo."
  }
];

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative h-screen w-full overflow-hidden font-sans">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="h-full w-full"
      >
        {SLIDES.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div 
              className="relative h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-[5000ms] ease-out"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                transform: activeIndex === index ? 'scale(1.1)' : 'scale(1)' 
              }}
            >
              {/* Overlay làm tối để text nổi bật */}
              <div className="absolute inset-0 bg-black/40" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Content Layer */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white text-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full">
            <AnimatePresence mode="wait">
            <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-8"
            >
                <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg leading-tight">
                {SLIDES[activeIndex].title}
                </h1>
                <p className="text-lg md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-md opacity-90">
                {SLIDES[activeIndex].subtitle}
                </p>
            </motion.div>
            </AnimatePresence>

            {/* Search Form - Glassmorphism */}
            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 max-w-4xl mx-auto shadow-2xl"
            >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative group">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/80 group-focus-within:text-white transition-colors" />
                <Input
                    placeholder="Điểm đến"
                    className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white transition-all backdrop-blur-sm"
                />
                </div>
                <div className="relative group">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/80 group-focus-within:text-white transition-colors" />
                <Input
                    type="date"
                    placeholder="Ngày đi"
                    className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white transition-all backdrop-blur-sm [&::-webkit-calendar-picker-indicator]:invert"
                />
                </div>
                <div className="relative group">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/80 group-focus-within:text-white transition-colors" />
                <Input
                    type="date"
                    placeholder="Ngày về"
                    className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white transition-all backdrop-blur-sm [&::-webkit-calendar-picker-indicator]:invert"
                />
                </div>
                <div className="relative group">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/80 group-focus-within:text-white transition-colors" />
                <select className="w-full h-12 pl-10 pr-4 border border-white/20 rounded-md bg-white/10 text-white focus:bg-white/20 focus:border-white transition-all backdrop-blur-sm outline-none appearance-none cursor-pointer">
                    <option className="text-black">1 người</option>
                    <option className="text-black">2 người</option>
                    <option className="text-black">3 người</option>
                    <option className="text-black">4+ người</option>
                </select>
                </div>
            </div>
            <Button variant="default" size="lg" className="w-full md:w-auto mt-6 bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <Search className="h-5 w-5 mr-2" />
                Tìm kiếm tour
            </Button>
            </motion.div>
        </div>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet { background: white; opacity: 0.5; }
        .swiper-pagination-bullet-active { background: #fff; opacity: 1; width: 24px; border-radius: 4px; transition: all 0.3s; }
      `}</style>
    </section>
  );
};

export default Hero;
