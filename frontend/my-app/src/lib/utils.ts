import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFullImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "/placeholder.png";

  if (
    imagePath.startsWith("http") ||
    imagePath.startsWith("https") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  const baseUrl = "http://localhost:5003";

  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  return `${baseUrl}${path}`;
}
