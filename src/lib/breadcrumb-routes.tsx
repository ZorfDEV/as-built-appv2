import { Home, Users,Network, Map,TriangleAlert, Layers, MapPin } from "lucide-react"

export const routeConfig: Record<
  string,
  { label: string; icon?: React.ReactNode }
> = {
  dashboard: {
    label: "Dashboard",
    icon: <Home className="w-4 h-4" />,
  },
  users: {
    label: "Utilisateurs",
    icon: <Users className="w-4 h-4" />,
  },
  points: {
    label: "Points-as-built",
    icon: <Network className="w-4 h-4" />,
  },
  map: {
    label: "Map Page",
    icon: <Map className="w-4 h-4" />,
  },
  incidents: {
    label: "Incidents",
    icon: <TriangleAlert className="w-4 h-4" />,
  },
  sections: {
    label: "Sections",
    icon: <Layers className="w-4 h-4" />,
  },
  marqueurs: {
    label: "Marqueurs",
    icon: <MapPin  className="w-4 h-4" />,
  },
}