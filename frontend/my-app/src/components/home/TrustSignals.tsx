import { Smile, Star, ShieldCheck, Phone } from "lucide-react";

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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {signals.map((signal) => (
            <div key={signal.label} className="text-center">
              <signal.icon className="h-12 w-12 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-primary mb-2">
                {signal.number}
              </div>
              <p className="text-muted-foreground font-medium">
                {signal.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
