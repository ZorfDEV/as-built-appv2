import { useRef,useEffect, useState } from 'react';
import { MapContainer, Marker, Popup,Tooltip, Polyline,TileLayer,LayersControl } from 'react-leaflet';
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
import { haversineDistance , convertDMSToDecimal , generatePointName ,findSectionId , findClosestPoints } from '../../lib/distance';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Point } from '@/datatypes/index';
import { Spinner } from "@/components/ui/spinner"
import BtnMap from './BtnMap';
import { GeoJSON } from 'react-leaflet';
import { Eye} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SharePoint from './share-point';

function getColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color =  "green" //`hsl(${hash % 360}, 70%, 50%)`
  return color
}


export default function MapView() {

 const navigate = useNavigate();
 const { user } = useAuth();
const [points, setPoints] = useState<Point[]>([]);
const [pointDis, setPointDis] = useState<Point[]>([]);
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
const [lastTenpoints, setLastTenpoints] = useState<Point[]>([]);
   
    useEffect(() => {
    const loadBorders = async () => {
      try {
        const res = await axios.get('/datas/ga.geojson');
        setGabonBorders(res.data);
          const layer = L.geoJSON(res.data);
          const geoBounds = layer.getBounds();
          setBounds(geoBounds as LatLngBounds);
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

useEffect(() => {
  const fetchAllPoints = async () => {
    try {
      const res = await api.get('/points/total')
     const allPoints = res.data || [];
      setPointDis(allPoints);                                             
      setPoints(allPoints.filter((p: { nature: string; }) => p.nature !== "incident")); 
      // console.log('points chargés:', allPoints.length);
    } catch (err) {
      console.error('Erreur API carte:', err)
      setPointDis([]) 
    } finally {
      setLoading(false)
    }
  }

  fetchAllPoints()

  const interval = setInterval(fetchAllPoints, 20000)

  return () => clearInterval(interval)
}, [])

 const grouped = points.reduce((acc, point) => {
  const sectionName = point.section_id?.name || 'Unknown'

  if (!acc[sectionName]) acc[sectionName] = []
  acc[sectionName].push(point)

  return acc
}, {} as Record<string, Point[]>)

 const handleSubmit = async (lat: string | null, lon: string | null) => {
  if (!user) {
    toast.error("Utilisateur non authentifié");
    return;
  }
  const map = mapRef.current;
  console.warn('mapReady:', mapReady);
     
  const latDMS = lat ? lat.trim() : '';
  const lonDMS = lon ? lon.trim() : '';

  const latitudeconv = convertDMSToDecimal(latDMS);
  const longitudeconv = convertDMSToDecimal(lonDMS);
  if (latitudeconv === null || longitudeconv === null || isNaN(latitudeconv) || isNaN(longitudeconv) || latitudeconv < -90 || latitudeconv > 90 || longitudeconv < -180 || longitudeconv > 180) {
    toast.error("Coordonnées invalides");
    return;
  }
  // console.log(`Coordonnées converties: Latitude: ${latitudeconv}, Longitude: ${longitudeconv}`);
   const  uniqueId  = await  generatePointName(latitudeconv, longitudeconv,);
  const pointName = `PI-${uniqueId}`;
  // pass empty secteurIncident as an empty string
  const closestPoints = await findClosestPoints(latitudeconv, longitudeconv, points, 10);
  
  setLastTenpoints(closestPoints);

  const sectionId = await findSectionId(latitudeconv, longitudeconv);
  if (!sectionId) {
    toast.error("Veuillez sélectionner une section");
    return;
  }
  const pointData = {
      name: pointName,
      description: `${pointName} ajouté le ${new Date().toLocaleDateString()}`,
      latitude: latitudeconv,
      longitude: longitudeconv,
      section_id:sectionId, 
      marqueur_id: '68331bd8c567b12828fc1066',
      user_id: user.id
    };

    try {
      await api.post('/points/pointsincident', pointData);
      toast.success('Point ajouté avec succès');
      setPiName(pointData.name);
    } catch (error) {
       toast.error('Erreur lors de l\'ajout du point');
      console.error(error);
     
    }
if (map) {
  map.setView([latitudeconv, longitudeconv], 15);
}
setAddedPoint({ lat: latitudeconv, lng: longitudeconv });
setCenter([latitudeconv, longitudeconv]);

};

  const redIcon = new L.Icon({
    iconUrl: '/api/uploads/ic-markers/file-1748179928428-572680519.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

 const getCoordinates = (name: string) => {
    const point = pointDis.find(p => p.name === name);
    return point ? [point.longitude, point.latitude] : null;
  };
  //Trace route
  const handleRoute = async (pointAName: string , pointBName: string) => {
    const coordsA = getCoordinates(pointAName);
    const coordsB = getCoordinates(pointBName);
    

  if (!coordsA || !coordsB) {
      toast.error('Veuillez saisir des noms de points valides.');
      return;
    }
setRouteCoords([
  [coordsA[1], coordsA[0]],
  [coordsB[1], coordsB[0]]
]);
const [lonA, latA] = coordsA;
const [lonB, latB] = coordsB;
setDistance(Number(haversineDistance(latA, lonA, latB, lonB)));

    setDuration(null); 
  };

// ✅ Génère un DivIcon avec icône + label
const createMarkerIcon = (iconUrl: string, label: string) => {
  const html = `
    <div style="
      display:        flex;
      flex-direction: column;
      align-items:    center;
      gap:            4px;
    ">
      <img
        src="${iconUrl}"
        style="
          width:       60px;   
          height:      60px;   
          object-fit:  contain;
        "
      />
      <span style="
        font-size:   11px;
        font-weight: 600;
        color:       #ffffff;
        text-shadow: -1px -1px 0 #000,
                      1px -1px 0 #000,
                     -1px  1px 0 #000,
                      1px  1px 0 #000;
        white-space: nowrap;
        line-height: 1;
      ">${label}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className:  "",
    iconSize:   [60, 60],    // ✅ zone de clic
    iconAnchor: [15, 30],    // ✅ bas-centre de l'image
  });
};
 
  return (
  <div className="h-full w-full "  onWheel={(e) => e.stopPropagation()}>
       
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
      <SearchBar points={pointDis} />
      {lastTenpoints.length > 0 && <PanelPoints listpoints={lastTenpoints} />}
      <BtnMap  handleSubmit ={handleSubmit} handleRoute={handleRoute} />
       <CustomZoomControl />
       <LayersControl position="topright">
         <LayersControl.BaseLayer checked name="Plan standard">
           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
         </LayersControl.BaseLayer>
         <LayersControl.BaseLayer  name="Satellite">
           <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
         </LayersControl.BaseLayer>
       </LayersControl>
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
      iconSize: [0, 0], 
    });
  }}
>
        {points.map((point ,index) => (
            
   <Marker
  key={index}
  position={[point.latitude, point.longitude]}
  icon={createMarkerIcon(
    point.marqueur_id?.file
      ? `/api${point.marqueur_id.file}`
      : '/default.png',
    point.name)}
    interactive={true}
    >
            <Popup>
              <span className="text-xs text-gray-500">{point.description}</span><br />
              <div className='flex items-center  space-x-4'>
                <div className='flex-1  justify-between  p-2'>
                  <Button className=" mr-2 bg-[#00AED1] text-white text-xs cursor-pointer rounded-xl hover:bg-blue-700 " onClick={() => { navigate(`/dashboard/point/view/${point.publicId}`); }}>
                    <Eye className="h-4 w-4" />
                   </Button>
                   <SharePoint latitude={point.latitude} longitude={point.longitude} />
 
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
             <SharePoint latitude={addedPoint.lat} longitude={addedPoint.lng} />
            </Popup>
          </Marker>
        )}
      {routeCoords.length > 0 && (
        <Polyline
          positions={routeCoords} 
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