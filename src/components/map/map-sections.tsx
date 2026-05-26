import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, GeoJSON } from 'react-leaflet'
import L, { type LatLngBounds, type LatLngTuple } from 'leaflet'
// ✅ Ne pas importer Map depuis leaflet — utiliser le type de react-leaflet
import { useMap } from 'react-leaflet'
import type { marqueur, Point } from "@/datatypes"
import axios from 'axios'
import { toast } from "sonner"
import { useEffect, useState } from 'react'

// ✅ Composant interne pour accéder à la carte via le contexte react-leaflet
function BoundsController({ bounds }: { bounds: LatLngBounds | null }) {
  const map = useMap()  // ✅ méthode correcte pour accéder à l'instance de la carte

  useEffect(() => {
    if (!bounds) return
    map.fitBounds(bounds)
    map.setMaxBounds(bounds)
  }, [map, bounds])

  return null
}

// ✅ Fix des icônes Leaflet (cassées par défaut avec Vite/Webpack)
const DEFAULT_ICON = L.icon({
  iconUrl: "/default.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],  // ✅ popup au-dessus du marker
})

function MapSections({ points, marqueurs }: { points: Point[]; marqueurs: marqueur[] }) {
  const center = [-0.602957760686725, 11.912091195294634] as LatLngTuple

  const [bounds, setBounds] = useState<LatLngBounds | null>(null)
  const [gabonBorders, setGabonBorders] = useState<GeoJSON.GeoJsonObject | null>(null)

  useEffect(() => {
    const loadBorders = async (): Promise<void> => {
      try {
        const res = await axios.get<GeoJSON.GeoJsonObject>('/datas/ga.geojson')
        setGabonBorders(res.data)

        const layer = L.geoJSON(res.data)
        const geoBounds = layer.getBounds()
        setBounds(geoBounds)
      } catch (err) {
        console.error("Erreur chargement frontières :", err)
        toast.error("Erreur lors du chargement des frontières du Gabon")
      }
    }

    loadBorders()
  }, [])

  function resolveId(value: string | { _id: string }): string {
  return typeof value === "string" ? value : value._id
}

  return (
    <MapContainer
      center={center}
      zoom={7}
      maxZoom={20}
      minZoom={5}
      maxBoundsViscosity={1.0}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      {/* ✅ BoundsController accède à la carte via useMap() — ref n'est plus nécessaire */}
      <BoundsController bounds={bounds} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {gabonBorders && (
        <GeoJSON
          data={gabonBorders}
          style={{ color: 'blue', weight: 2, fillOpacity: 0.1 }}
        />
      )}

      {points.map((point) => {
  const marqueurFound = marqueurs.find(
    (m) => m._id === resolveId(point.marqueur_id)  
  )
  const icon = marqueurFound
    ? L.icon({
        iconUrl: `/api${marqueurFound.file}`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41],
      })
    : DEFAULT_ICON

  return (
    <Marker
      key={String(point._id)}
      position={[point.latitude, point.longitude]}
      icon={icon}
    >
      <Popup>
        <p className="font-medium">{point.name}</p>
      </Popup>
    </Marker>
  )
})}
    </MapContainer>
  )
}

export default MapSections