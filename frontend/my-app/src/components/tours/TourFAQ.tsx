import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function TourFAQ() {
  const faqs = [
    {
      question: "Tour này có bao gồm vé máy bay không?",
      answer:
        "Hầu hết các tour nội địa của chúng tôi không bao gồm vé máy bay để tạo sự linh hoạt cho quý khách. Vui lòng kiểm tra mục 'Bao gồm' để biết chi tiết.",
    },
    {
      question: "Tôi có cần đặt cọc trước không?",
      answer:
        "Có, bạn cần thanh toán một khoản đặt cọc để xác nhận giữ chỗ. Số tiền còn lại sẽ được thanh toán trước ngày khởi hành. Vui lòng liên hệ nhân viên tư vấn để biết thêm chi tiết.",
    },
    {
      question: "Chính sách hủy tour như thế nào?",
      answer:
        "Chính sách hủy tour phụ thuộc vào thời điểm bạn thông báo hủy. Chúng tôi có các mốc thời gian khác nhau với các mức phí tương ứng. Vui lòng tham khảo điều khoản dịch vụ của chúng tôi.",
    },
    {
      question: "Tôi cần chuẩn bị gì cho chuyến đi?",
      answer:
        "Bạn nên mang theo: quần áo thoải mái, giày thể thao, áo khoác nhẹ, kem chống nắng, mũ, kính râm, thuốc cá nhân, và máy ảnh. Đừng quên mang theo đồ bơi nếu muốn tắm biển!",
    },
    {
      question: "Tour có phù hợp với trẻ em không?",
      answer:
        "Có! Tour rất phù hợp cho gia đình có trẻ em. Tuy nhiên, trẻ dưới 2 tuổi được miễn phí, trẻ từ 2-10 tuổi được giảm 50% giá vé. Chúng tôi có áo phao và thiết bị an toàn cho trẻ em.",
    },
    {
      question: "Tôi có thể hủy hoặc thay đổi đặt chỗ không?",
      answer:
        "Bạn có thể hủy hoặc thay đổi đặt chỗ trước 7 ngày mà không mất phí. Hủy từ 3-7 ngày trước khởi hành mất 50% phí, hủy trong vòng 3 ngày mất 100% phí đặt cọc.",
    },
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Câu Hỏi Thường Gặp
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Những thắc mắc phổ biến về tour du lịch
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="overflow-hidden rounded-xl border border-border/50 bg-card px-6"
            >
              <AccordionTrigger className="py-4 text-left hover:no-underline">
                <span className="font-semibold text-card-foreground">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <p className="leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 rounded-xl bg-primary/10 p-8 text-center">
          <h3 className="mb-2 text-xl font-semibold text-foreground">
            Còn câu hỏi khác?
          </h3>
          <p className="mb-4 text-muted-foreground">
            Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="tel:+84912345678"
              className="font-medium text-primary hover:underline"
            >
              📞 0389 781 308
            </a>
            <span className="text-muted-foreground">|</span>
            <a
              href="mailto:info@vietnaturetours.com"
              className="font-medium text-primary hover:underline"
            >
              ✉️ info@vietnaturetours.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
