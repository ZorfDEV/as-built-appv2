import {
  Share2,
  Copy,
  MapPinned,
  ExternalLink,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { toast } from "sonner";
import whatsappIcon from "../../assets/img/WhatsApp-Logo.wine.svg";
import ShareMenuItem from "./ShareMenuItem";

type SharePointProps = {
  latitude: number;
  longitude: number;
};

export default function SharePoint({
  latitude,
  longitude,
}: SharePointProps) {
  const googleLink = `https://maps.google.com/?q=${latitude},${longitude}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(googleLink);
    toast.success("Lien copié dans le presse-papiers");
  };

  const copyCoordinates = async () => {
    await navigator.clipboard.writeText(
      `${latitude}, ${longitude}`
    );

    toast.success("Coordonnées copiées");
  };

  const openGoogleMaps = () => {
    window.open(googleLink, "_blank");
  };

  const shareWhatsapp = () => {
    const message = `📍 Point d'intervention

Latitude : ${latitude}
Longitude : ${longitude}

Google Maps :
${googleLink}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className=" bg-green-400 rounded-xl text-white text-xs cursor-pointer hover:bg-green-600"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="center"
        sideOffset={12}
        className="w-64 rounded-2xl p-2 shadow-xl"
      >
        <div className="mb-2 px-3 py-2 text-sm font-semibold">
          Partager ce point
        </div>

        <div className="space-y-1">
          <ShareMenuItem
            icon={<Copy className="h-6 w-6" />}
            label="Copier le lien"
            onClick={copyLink}
          />

          <ShareMenuItem
            icon={
              <img
                src={whatsappIcon}
                alt="WhatsApp"
                className="h-6 w-6"
              />
            }
            label="Partager sur WhatsApp"
            onClick={shareWhatsapp}
          />

          <ShareMenuItem
            icon={<MapPinned className="h-6 w-6" />}
            label="Copier les coordonnées"
            onClick={copyCoordinates}
          />

          <div className="my-1 border-t" />

          <ShareMenuItem
            icon={<ExternalLink className="h-4 w-4" />}
            label="Ouvrir Google Maps"
            onClick={openGoogleMaps}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}