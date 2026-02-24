import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import destinationService from "@/services/destination.service";
import { Destination } from "@/types/destination";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let destinations: Destination[] = [];

  try {
    const paginatedData = await destinationService.getAll({ pageSize: 999 });
    destinations = paginatedData.items;
  } catch {
    console.warn(
      "⚠️ Build warning: Could not fetch destinations for layout. Ignoring."
    );
  }

  return (
    <>
      <Header destinations={destinations} />
      {children}
      <Footer />
    </>
  );
}
