import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}
export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav
      className="inline-flex items-center gap-2
                 rounded-full bg-white/10 backdrop-blur-md
                 px-4 py-2 text-sm font-medium
                 text-white shadow-lg"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4 text-white/60" />}

            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center gap-1 text-white/90">
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};
