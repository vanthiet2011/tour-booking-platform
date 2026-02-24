import { CreateTourForm } from "@/components/admin/tours/CreateTourForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateTourPage() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tạo Tour Mới</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTourForm />
        </CardContent>
      </Card>
    </div>
  );
}
