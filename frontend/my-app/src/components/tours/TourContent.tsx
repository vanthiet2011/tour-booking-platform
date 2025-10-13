"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tour } from "@/lib/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Cần add component này

export function TourContent({ tour }: { tour: Tour }) {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
        <TabsTrigger value="schedule">Lịch trình</TabsTrigger>
        <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 prose max-w-none">
        <h2>Mô tả tour</h2>
        <p>{tour.description}</p>
        {/* Thêm các thông tin khác như "Bao gồm", "Không bao gồm"... */}
      </TabsContent>

      <TabsContent value="schedule" className="mt-6">
        <Accordion type="single" collapsible className="w-full">
          {tour.tourSchedules.map((schedule) => (
            <AccordionItem
              value={`day-${schedule.dayNumber}`}
              key={schedule.id}
            >
              <AccordionTrigger>
                Ngày {schedule.dayNumber}: {schedule.title}
              </AccordionTrigger>
              <AccordionContent className="prose max-w-none">
                {schedule.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <p>Tính năng đánh giá sẽ được phát triển sau.</p>
      </TabsContent>
    </Tabs>
  );
}
