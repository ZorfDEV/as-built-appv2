import MapView from "@/components/map/map-view";
import { useMemo } from "react";

const MapPage = () => {
   const token = localStorage.getItem('token');
      const headers = useMemo(() => ({
              Authorization: `Bearer ${token}`
           }), [token]);
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1">
        <MapView header={headers}/>
      </div>
    </div>
  );
}
export default MapPage;