"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Clock,
  Award,
  HeartHandshake,
  Headphones,
  Plane,
} from "lucide-react";
import { motion } from "framer-motion";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
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

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-background font-sans">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Tại sao chọn <span className="text-primary">VietTravel</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến cho bạn những trải nghiệm du lịch tuyệt
            vời nhất
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card
                  className="group hover:shadow-travel transition-all duration-300 hover:-translate-y-2 border-0 bg-card/50 backdrop-blur-sm h-full"
                >
                  <CardContent className="p-8 text-center h-full flex flex-col items-center">
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
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-16 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-nature to-ocean rounded-2xl p-8 text-white relative overflow-hidden"
          >
             {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 z-0"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 z-0"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">
                Sẵn sàng khám phá Việt Nam?
              </h3>
              <p className="text-lg mb-6 opacity-90">
                Hãy để chúng tôi giúp bạn tạo nên những kỷ niệm đáng nhớ
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="text-3xl font-bold bg-white/20 px-6 py-2 rounded-lg backdrop-blur-sm">1900 2087</div>
                <div className="text-sm opacity-90 font-medium">Hotline tư vấn miễn phí</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
