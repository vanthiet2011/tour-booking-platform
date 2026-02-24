import { LucideIcon } from "lucide-react";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { PageHeaderBackground } from "./PageHeaderBackground";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badgeLabel: string;
  badgeIcon: LucideIcon;
  backgroundImage: string;
  breadcrumbItems: BreadcrumbItem[];
}

export const PageHeader = ({
  title,
  subtitle,
  badgeLabel,
  badgeIcon: BadgeIcon,
  backgroundImage,
  breadcrumbItems,
}: PageHeaderProps) => {
  return (
    <section className="relative h-[300px] overflow-hidden text-white">
      <PageHeaderBackground backgroundImage={backgroundImage} title={title} />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 md:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/90 px-4 py-2 text-sm font-medium text-primary-foreground backdrop-blur-sm">
            <BadgeIcon className="h-4 w-4" />
            {badgeLabel}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold drop-shadow-md">
            {title}
          </h1>

          {subtitle && (
            <p className="text-white/90 text-base md:text-lg max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        <div className="absolute bottom-6 right-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>
    </section>
  );
};
