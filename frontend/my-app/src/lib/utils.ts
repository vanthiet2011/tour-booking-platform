import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function getFullImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "/placeholder.png";

  // If it's already a blob or https, return as is
  if (imagePath.startsWith("https://") || imagePath.startsWith("blob:")) {
    return imagePath;
  }

  // If it is http localhost 5003, strip the domain to use the proxy (avoids mixed content)
  if (imagePath.startsWith("http://localhost:5003")) {
    return imagePath.replace("http://localhost:5003", "");
  }

  // If it's another http url, return as is (mixed content warning might still occur for external http, but likely intended)
  if (imagePath.startsWith("http://")) {
    return imagePath;
  }

  // If it starts with /uploads, return as is (uses proxy)
  if (imagePath.startsWith("/uploads")) {
    return imagePath;
  }

  // If it starts with uploads/ (without leading slash), prepend /
  if (imagePath.startsWith("uploads/")) {
    return `/${imagePath}`;
  }

  // If it starts with /, assuming it's a local public asset
  if (imagePath.startsWith("/")) {
    return imagePath;
  }

  // Finally, assume it needs /uploads prepended
  return `/uploads/${imagePath}`;
}
