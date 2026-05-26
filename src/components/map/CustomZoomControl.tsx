import { useMap } from 'react-leaflet';
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { MinusIcon, PlusIcon } from "lucide-react"

export default function CustomZoomControl() {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
   <ButtonGroup
      orientation="vertical"
      aria-label="Media controls"
      className="h-fit"
    >
      <Button onClick={handleZoomIn} title="Zoom In" variant="outline" size="icon">
        <PlusIcon className="h-5 w-5 text-gray-700 dark:text-darktext-primary" />
      </Button>
      <Button onClick={handleZoomOut} title="Zoom Out" variant="outline" size="icon">
        <MinusIcon className="h-5 w-5 text-gray-700 dark:text-darktext-primary" />
      </Button>
    </ButtonGroup>
  );
}
