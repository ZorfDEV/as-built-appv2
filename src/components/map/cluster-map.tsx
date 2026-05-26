import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
//import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Point } from "@/datatypes"

type MarkerObj = {
  _id: string;
  file?: string;
};

type ClusterMapProps = {
  points: Point[] | Point;
  checkpoints: boolean;
  markers?: MarkerObj[];
};

export default function ClusterMap({ points, checkpoints, markers }: ClusterMapProps) {

  if (checkpoints === false) {
    const point = Array.isArray(points) ? points[0] : points;
    if (!point) return <div>Point introuvable</div>;

    return (
      <MapContainer center={[point.latitude, point.longitude]} zoom={12} style={{ height: "400px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[point.latitude, point.longitude]}>
          <Popup>{point.description}</Popup>
        </Marker>
      </MapContainer>
    );
  }

  const list = Array.isArray(points) ? points : [points];
  const mapCenter = list.length > 0 ? [list[0].latitude, list[0].longitude] : [0.4069, 9.4686];

  return (
    <MapContainer center={mapCenter as [number, number]} zoom={12} style={{ height: "600px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {list.map(point => {
        const marker = markers?.find(m => m._id === point.marqueur_id?._id);
        const iconUrl = marker?.file ? `/api${marker.file}` : "/default.png";
        return (
          <Marker key={point.name} position={[point.latitude, point.longitude]} icon={L.icon({ iconUrl, iconSize: [25, 41], iconAnchor: [12, 41] })}>
            <Popup>
              <strong>{point.name}</strong><br />
              {point.description}
            </Popup>
          </Marker>
        );
      })}
      ...
    </MapContainer>
  );
}
