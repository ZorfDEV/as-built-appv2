import { useRef,useEffect, useState } from 'react';
import { MapContainer, Marker, Popup,Tooltip, Polyline,TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L, { LatLngBounds, type LatLngTuple } from 'leaflet';
import { Map } from 'leaflet';
import axios from 'axios';
import { toast } from "sonner";
import { Button } from "@/components/ui/button"
import SearchBar from './SearchBar';
import PanelPoints from './PanelPoints';
import CustomZoomControl from './CustomZoomControl';
import 'leaflet/dist/leaflet.css';
import { haversineDistance,convertDMSToDecimal,generatePointName,findSectionId,findClosestPoints } from '../../lib/distance';
import { useAuth } from '../../contexts/AuthContext';
import type { Point } from '@/datatypes/index';
import { Spinner } from "@/components/ui/spinner"
import BtnMap from './BtnMap';
import { GeoJSON } from 'react-leaflet';
import { Eye,Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function getColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color =  "green" //`hsl(${hash % 360}, 70%, 50%)`
  return color
}


export default function MapView({ header }: { header: Record<string, string> }) {

  //const { darkMode} = useOutletContext();
 const navigate = useNavigate();
 const { user } = useAuth();
const [points, setPoints] = useState<Point[]>([]);
const [center, setCenter] = useState<LatLngTuple>([-0.602957760686725, 11.912091195294634]); 
const [gabonBorders, setGabonBorders] = useState(null);

  const [loading, setLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [duration, setDuration] = useState(null);
  const [distance, setDistance] = useState<number | null>(null);
  const mapRef = useRef<Map>(null);
  const [mapReady, setMapReady] = useState(false);
  const [addedPoint, setAddedPoint] = useState<{ lat: number; lng: number } | null>(null);
const [piName, setPiName] = useState<string | null>(null);
const [boundsFitted, setBoundsFitted] = useState(false);
const [bounds, setBounds] = useState<LatLngBounds | null>(null);
const [lastTenpoints, setLastTenpoints] = useState([]);
   // chargement des frontières du Gabon
    useEffect(() => {
    const loadBorders = async () => {
      try {
        const res = await axios.get('/datas/ga.geojson');
        setGabonBorders(res.data);
         // Création des limites à partir du GeoJSON
          const layer = L.geoJSON(res.data);
          const geoBounds = layer.getBounds();
          setBounds(geoBounds as LatLngBounds);

        // Appliquer fitBounds une fois la carte prête
        if (mapRef.current) {
          mapRef.current.fitBounds(geoBounds);
          mapRef.current.setMaxBounds(geoBounds);
        }
    } catch (err) {
      console.error("Erreur lors du chargement des frontières du Gabon :", err);
    }
  };
  loadBorders();
}, []);

// Récupération de tous les points
 useEffect(() => {
  if (!header) {
    setLoading(false)
    return
  }
  const fetchPoints = async () => {
    try {
      const res = await axios.get('/api/points/map', { headers: header })
      setPoints(res.data || [])
      console.log('Points chargés:', res.data)
    } catch (err) {
      console.error('Erreur API carte:', err)
      setPoints([]) // très important
    } finally {
      setLoading(false)
    }
  }

  fetchPoints()

  const interval = setInterval(fetchPoints, 20000)

  return () => clearInterval(interval)
}, [header])

  /* Mise à jour du calque actif en fonction du mode sombre
 useEffect(() => {
    setActiveLayer(darkMode ? "satellite" : "standard");
  }, [darkMode]);*/

 const grouped = points.reduce((acc, point) => {
  const sectionName = point.section_id?.name || 'Unknown'

  if (!acc[sectionName]) acc[sectionName] = []
  acc[sectionName].push(point)

  return acc
}, {} as Record<string, Point[]>)


  
//creation point incident
 const handleSubmit = async (lat: string | null, lon: string | null) => {
  if (!user) {
    toast.error("Utilisateur non authentifié");
    return;
  }
  
  const map = mapRef.current;
  console.log('mapRef:', mapRef.current);
  console.log('mapReady:', mapReady);
  /*const formData = new FormData(e.target as HTMLFormElement);
  const latDMS = formData.get('latitude')?.toString().trim() || '';
  const lonDMS = formData.get('longitude')?.toString().trim() || '';*/
     
  const latDMS = lat ? lat.trim() : '';
  const lonDMS = lon ? lon.trim() : '';

  const latitudeconv = convertDMSToDecimal(latDMS);
  const longitudeconv = convertDMSToDecimal(lonDMS);
  console.log('Valeurs saisies:', { lat: latitudeconv, lng: longitudeconv });
  if (latitudeconv === null || longitudeconv === null || isNaN(latitudeconv) || isNaN(longitudeconv) || latitudeconv < -90 || latitudeconv > 90 || longitudeconv < -180 || longitudeconv > 180) {
    toast.error("Coordonnées invalides");
    return;
  }
   const  uniqueId  = await  generatePointName(latitudeconv, longitudeconv, header);
  const pointName = `PI-${uniqueId}`;
  const closestPoints = await findClosestPoints(latitudeconv, longitudeconv, header, 10);
  setLastTenpoints(closestPoints);
  console.log('10 points les plus proches et leur distance:', closestPoints);
  const sectionId = await findSectionId(latitudeconv, longitudeconv, header);
  if (!sectionId) {
    toast.error("Veuillez sélectionner une section");
    return;
  }
  const pointData = {
      name: pointName,
      description: `${pointName} ajouté le ${new Date().toLocaleDateString()}`,
      latitude: latitudeconv,
      longitude: longitudeconv,
      section_id:sectionId, //formData.get('section_id'),
      marqueur_id: '68331bd8c567b12828fc1066',
      user_id: user.id
    };

    try {
      await axios.post('/api/points/pointsincident', pointData, { headers: header });
      console.log('Point ajouté avec succès', pointData);
      toast.success('Point ajouté avec succès');
      setPiName(pointData.name);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du point', error);
      console.log('Erreur datas send', pointData);

      toast.error("Erreur lors de l'ajout du point");
    }

// centrage + ajout du marker
if (map) {
  map.setView([latitudeconv, longitudeconv], 15);
}
setAddedPoint({ lat: latitudeconv, lng: longitudeconv });
setCenter([latitudeconv, longitudeconv]);
//console.log('Nouveau point ajouté:', { lat: latitudeconv, lng: longitudeconv });
};
  const redIcon = new L.Icon({
    iconUrl: '/api/uploads/ic-markers/file-1748179928428-572680519.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
 //  votre clé API ORS
 // const ORS_API_KEY = '5b3ce3597851110001cf6248d10b88622627a47934615c52671cfb8959a9befa537aa376f8adc900'; 
 const getCoordinates = (name: string) => {
    const point = points.find(p => p.name === name);
    return point ? [point.longitude, point.latitude] : null;
  };
  //Trace route
  const handleRoute = async (pointAName: string , pointBName: string) => {
    //const nameA = pointAName;
    //const nameB = pointBName;
    const coordsA = getCoordinates(pointAName);
    const coordsB = getCoordinates(pointBName);
    console.log('Coordonnées A:', coordsA);
    console.log('Coordonnées B:', coordsB);

  if (!coordsA || !coordsB) {
      toast.error('Veuillez saisir des noms de points valides.');
      return;
    }
setRouteCoords([
  [coordsA[1], coordsA[0]],
  [coordsB[1], coordsB[0]]
]);

// calcul distance haversine
const [lonA, latA] = coordsA;
const [lonB, latB] = coordsB;
setDistance(Number(haversineDistance(latA, lonA, latB, lonB)));

    setDuration(null); 
  };

  return (
  <div className="h-full w-full">
       
  {loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-50">
      <Spinner />
    </div>
  )}
<MapContainer
  center={center}
  zoom={7}
  maxZoom={20} 
  minZoom={5}  
  maxBounds={bounds || undefined}
  maxBoundsViscosity={1.0}
  zoomControl={false}
  style={{ height: '100%', width: '100%' }}
  ref={mapRef}
  whenReady={() => {
    setMapReady(true);
  }}
>
      <SearchBar points={points} />
      {lastTenpoints.length > 0 && <PanelPoints listpoints={lastTenpoints} />}
      <BtnMap  handleSubmit ={handleSubmit} handleRoute={handleRoute} />
       <CustomZoomControl />
      <TileLayer
  attribution='&copy; OpenStreetMap contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
  <MarkerClusterGroup
  chunkedLoading
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  iconCreateFunction={(cluster: { getChildCount: () => any; }) => {
    const count = cluster.getChildCount();
    const sizeClass = count < 10
      ? 'w-8 h-8 text-xs'
      : count < 100
      ? 'w-10 h-10 text-sm'
      : 'w-12 h-12 text-base';

    const colorClass = count < 10
      ? 'bg-green-500'
      : count < 100
      ? 'bg-yellow-500'
      : 'bg-blue-500';

    return L.divIcon({
      html: `
        <div class="tw-cluster ${sizeClass} ${colorClass}">
          <span>${count}</span>
        </div>`,
      className: '',
      iconSize: [0, 0], // pour éviter les conflits avec leaflet
    });
  }}
>
        {points.map((point ,index) => (
            
          <Marker
            key={index}
            position={[point.latitude, point.longitude]}
            
            icon={new L.Icon({
              iconUrl: point.marqueur_id?.file ? `/api${point.marqueur_id.file}` : '/default.png',
              iconSize: [30, 30],
              iconAnchor: [15, 30],
            })}
          >
            <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent>
              <span className="text-xs font-semibold">{point.name}</span> 
            </Tooltip>
            <Popup>
              <span className="text-xs text-gray-500">{point.description}</span><br />
              <div className='flex items-center  space-x-4'>
                <div className='flex-1'>
                  <Button className="mt-2 bg-[#00AED1] text-white text-xs px-2 py-1 cursor-pointer rounded hover:bg-blue-700 " onClick={() => { navigate(`/dashboard/point/view/${point._id}`); }}>
                    <Eye />
                  </Button>
                </div>
                <div className="flex-1">
              <Button
        onClick={() => {
      const shareLink = `https://maps.google.com?q=${point.latitude},${point.longitude}`;
      navigator.clipboard.writeText(shareLink);
      toast.success("Lien copié dans le presse-papier !");
    }}
    className="mt-2 bg-brandgreen text-white text-xs px-2 py-1 cursor-pointer rounded hover:bg-blue-700"
  >
    <Share2 />
  </Button>
  </div>
              </div>
            </Popup>
          </Marker>
        ))}

    {/* Polylines colorées + popup */}
      {Object.entries(grouped).map(([sectionName, sectionPoints], idx) => {
        const sorted = [...sectionPoints].sort((a, b) => a._id.localeCompare(b._id))
        const color = getColorFromString(sectionName)

        return (
          <Polyline
            key={idx}
            positions={sorted.map(p => [p.latitude, p.longitude])}
            pathOptions={{ color, weight: 4 }}
          >
            <Popup>
              <strong>{sectionName}</strong>
            </Popup>
          </Polyline>
        )
      })}
      </MarkerClusterGroup>
       
      {addedPoint && (
          <Marker position={[addedPoint.lat, addedPoint.lng]} icon={redIcon}>
            <Tooltip permanent>
              <span>{piName}</span>
            </Tooltip>
            <Popup>
              <strong>{piName}</strong><br />
            </Popup>
          </Marker>
        )}
      {routeCoords.length > 0 && (
        <Polyline
          positions={routeCoords} // Inverser l'ordre pour Leaflet
          color="red"
          weight={4}
        >
          <Tooltip>
            <span>Distance: {distance} km</span><br />
            <span>Durée: {duration} minutes</span>
          </Tooltip>
          <Popup>
              <strong>{distance} km</strong><br />
            </Popup>
        </Polyline>
      )}
     {gabonBorders && (
  <GeoJSON
    data={gabonBorders}
    style={{
      color: "#101010",
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.05,
    }}
   onEachFeature={(_, layer) => {
  if (!boundsFitted && mapRef.current) {
    mapRef.current.fitBounds((layer as L.FeatureGroup).getBounds());
    setBoundsFitted(true);
  }
}}
  />
)}
    </MapContainer> 
  </div>
  );
}