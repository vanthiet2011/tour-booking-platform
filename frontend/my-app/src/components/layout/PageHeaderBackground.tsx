"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface PageHeaderBackgroundProps {
  backgroundImage: string;
  title: string;
}

export const PageHeaderBackground = ({
  backgroundImage,
  title,
}: PageHeaderBackgroundProps) => {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="absolute inset-0"
      style={{ transform: `translateY(${offsetY * 0.5}px)` }}
    >
      <Image
        src={backgroundImage}
        alt={title}
        fill
        priority
        sizes="100vw"
        className="object-cover object-bottom"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
    </div>
  );
};
