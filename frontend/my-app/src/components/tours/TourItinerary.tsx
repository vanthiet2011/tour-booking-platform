import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TourSchedule } from "@/lib/api";
import ReactMarkdown from "react-markdown";

interface TourItineraryProps {
  schedules: TourSchedule[];
}

export function TourItinerary({ schedules = [] }: TourItineraryProps) {
  if (schedules.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="mb-4 font-sans text-2xl font-bold text-foreground lg:text-3xl">
          Lịch Trình Chi Tiết
        </h2>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
          Hành trình được sắp xếp chu đáo để bạn trải nghiệm trọn vẹn
        </p>
      </div>

      <Accordion
        type="single"
        collapsible
        defaultValue="item-0"
        className="space-y-4"
      >
        {schedules.map((schedule, index) => (
          <AccordionItem
            value={`item-${index}`}
            key={index}
            className="overflow-hidden rounded-lg border-border/50 bg-card"
          >
            <AccordionTrigger className="px-4 py-2 text-left hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                  {schedule.dayNumber || index + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Ngày {schedule.dayNumber || index + 1}
                  </div>
                  <div className="text-base font-semibold text-card-foreground">
                    {schedule.title}
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pl-16">
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <ReactMarkdown>
                  {schedule.description || "Chưa có mô tả chi tiết."}
                </ReactMarkdown>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
