"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tour } from "@/lib/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function TourContent({ tour }: { tour: Tour }) {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
        <TabsTrigger value="schedule">Lịch trình</TabsTrigger>
        <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
      </TabsList>

      <TabsContent
        value="overview"
        className="mt-6 prose max-w-none dark:prose-invert"
      >
        <h2>Mô tả tour</h2>
        <p>{tour.description || "Chưa có mô tả cho tour này."}</p>

        {/* Cải tiến: Hiển thị thêm thông tin Bao gồm / Không bao gồm */}
        {tour.inclusions && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="text-lg font-semibold">Bao gồm</h3>
              <ul className="list-disc pl-5">
                {tour.inclusions.included?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Không bao gồm</h3>
              <ul className="list-disc pl-5">
                {tour.inclusions.notIncluded?.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="schedule" className="mt-6">
        {!tour.schedules || tour.schedules.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {tour.schedules.map((schedule) => (
              <AccordionItem
                value={`day-${schedule.dayNumber}`}
                key={schedule.id}
              >
                <AccordionTrigger>
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {schedule.dayNumber}
                    </div>
                    <span className="font-semibold text-lg">
                      {schedule.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="prose max-w-none dark:prose-invert pl-16">
                  {schedule.description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p>Chưa có lịch trình chi tiết cho tour này.</p>
        )}
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <p className="text-muted-foreground">
          Tính năng đánh giá sẽ được phát triển sau.
        </p>
      </TabsContent>
    </Tabs>
  );
}
