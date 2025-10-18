import { Tour } from "@/lib/api";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";

type InclusionCardProps = {
  title: string;
  items: string[] | undefined;
  variant: "included" | "excluded";
};

const InclusionCard = ({ title, items, variant }: InclusionCardProps) => {
  const config = {
    included: {
      Icon: Check,
      className: "text-primary",
    },
    excluded: {
      Icon: X,
      className: "text-red-500",
    },
  };

  const { Icon, className } = config[variant];

  return (
    <Card className="flex flex-col gap-2 border-border/50 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className={`h-6 w-6 ${className}`} />
        </div>
        <h3 className="text-xl font-semibold text-card-foreground lg:text-2xl">
          {title}
        </h3>
      </div>
      <hr className="border-border/50" />
      <ul className="flex-1 space-y-2 -ml-6">
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <Icon className={`h-5 w-5 shrink-0 ${className}`} />
              <span className="leading-relaxed text-muted-foreground">
                {item}
              </span>
            </li>
          ))
        ) : (
          <p className="text-muted-foreground ml-6">
            {" "}
            Chưa có thông tin chi tiết.
          </p>
        )}
      </ul>
    </Card>
  );
};

export function TourInclusions({ tour }: { tour: Tour }) {
  const { included, notIncluded } = tour.inclusions || {};

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 font-sans text-2xl font-bold text-foreground lg:text-3xl">
          Bao Gồm & Không Bao Gồm
        </h2>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Thông tin chi tiết về những gì được và không được bao gồm trong gói
          tour.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InclusionCard title="Bao Gồm" items={included} variant="included" />
        <InclusionCard
          title="Không Bao Gồm"
          items={notIncluded}
          variant="excluded"
        />
      </div>
    </div>
  );
}
