"use client";

import { Smile, Star, ShieldCheck, Phone } from "lucide-react";
import { motion } from "framer-motion";

export function TrustSignals() {
  const signals = [
    {
      number: "50K+",
      label: "Du Khách Hạnh Phúc",
      icon: Smile,
    },
    {
      number: "4.9★",
      label: "Đánh Giá Trung Bình",
      icon: Star,
    },
    {
      number: "100%",
      label: "Đảm Bảo Hài Lòng",
      icon: ShieldCheck,
    },
    {
      number: "24/7",
      label: "Hỗ Trợ Khách Hàng",
      icon: Phone,
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-background font-sans">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {signals.map((signal, index) => (
            <motion.div 
              key={signal.label} 
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
              className="text-center"
            >
              <signal.icon className="h-12 w-12 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-primary mb-2">
                {signal.number}
              </div>
              <p className="text-muted-foreground font-medium">
                {signal.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
