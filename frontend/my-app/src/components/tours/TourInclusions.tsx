// components/tour-inclusions.tsx

import { Tour } from "@/lib/api";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";

export function TourInclusions({ tour }: { tour: Tour }) {
  const { included, notIncluded } = tour.inclusions || {};

  return (
    <div>
      <div className="mb-12">
        <h2 className="mb-4 font-sans text-2xl font-bold text-foreground lg:text-3xl">
          Bao Gồm & Không Bao Gồm
        </h2>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
          Thông tin chi tiết về những gì có trong gói tour
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-card-foreground">
              Bao Gồm
            </h3>
          </div>
          <ul className="space-y-3">
            {included && included.length > 0 ? (
              included.map((item, index) => (
                <li key={index} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="leading-relaxed text-card-foreground">
                    {item}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">Chưa có thông tin.</li>
            )}
          </ul>
        </Card>

        <Card className="border-border/50 bg-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <X className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-card-foreground">
              Không Bao Gồm
            </h3>
          </div>
          <ul className="space-y-3">
            {notIncluded && notIncluded.length > 0 ? (
              notIncluded.map((item, index) => (
                <li key={index} className="flex gap-3">
                  <X className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                  <span className="leading-relaxed text-card-foreground">
                    {item}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">Chưa có thông tin.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
