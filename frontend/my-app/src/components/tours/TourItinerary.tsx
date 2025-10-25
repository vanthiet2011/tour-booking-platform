import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TourSchedule } from "@/types/tour";
import ReactMarkdown from "react-markdown";

interface TourItineraryProps {
  schedules: TourSchedule[];
}

export function TourItinerary({ schedules = [] }: TourItineraryProps) {
  if (schedules.length === 0) {
    return null;
  }

  const sortedSchedules = [...schedules].sort(
    (a, b) => a.dayNumber - b.dayNumber
  );

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
        {sortedSchedules.map((schedule, index) => (
          <AccordionItem
            value={`item-${index}`}
            key={schedule.id || index}
            className="overflow-hidden rounded-lg border-border/50 bg-card"
          >
            <AccordionTrigger className="px-4 py-2 text-left hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                  {schedule.dayNumber}
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Ngày {schedule.dayNumber}
                  </div>
                  <div className="text-base font-semibold text-card-foreground">
                    {schedule.title}
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="border-t border-border/30 px-6 pb-6 pt-4 pl-[76px]">
              <div className="prose prose-sm max-w-none text-muted-foreground prose-p:my-2">
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
