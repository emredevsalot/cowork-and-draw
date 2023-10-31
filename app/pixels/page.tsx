import CanvasUI from "@/components/pixels/CanvasUI";

export default async function PixelsPage() {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">Pixels</h1>
      <CanvasUI />
    </div>
  );
}
