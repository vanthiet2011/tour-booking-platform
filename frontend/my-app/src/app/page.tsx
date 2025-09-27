// src/app/page.tsx - NỘI DUNG MỚI

import Hero from "@/components/Hero";
import PopularDestinations from "@/components/PopularDestinations"; // Đã sửa tên file
import WhyChooseUs from "@/components/WhyChooseUs";
// Bỏ qua Categories vì nó là trang Profile
// Header và Footer sẽ được quản lý bởi layout.tsx

export default function HomePage() {
  return (
    // Header và Footer sẽ được tự động thêm vào bởi layout, không cần gọi ở đây
    <main>
      <Hero />
      <PopularDestinations />
      <WhyChooseUs />
    </main>
  );
}
