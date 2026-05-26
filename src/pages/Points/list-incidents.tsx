//import React from 'react'
import { usePointsIncidents } from "@/hooks/usePointsIncident "
import {TableBase} from "@/components/table-base"
import {useCallback, useMemo, useState } from 'react';
import type { Point } from '@/datatypes/index';
import { AnalyticsChartBar } from "@/components/analytics-chart-bar"
import { AnalyticsChartPie } from "@/components/analytics-chart-pie"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner";
import {  useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { POINT_COLUMNS } from "@/components/table/column-presets"
import WidgetContainer from "@/components/widget-container";
import { Info ,TriangleAlert,ClockFading,ShieldCheck } from "lucide-react";

const duree = 60000; // 1 minute en millisecondes

function ListIncidents() {

  const fileNamesExcel = "Points_As-built";
  const { points, loading, error } = usePointsIncidents();
  const [selectedIds, setSelectedIds] = useState<string[]>([])
   const datas: Point[] = useMemo(() => {
      return points.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        // ensure required fields exist on the mapped object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updatedAt: (item as any).updatedAt ? new Date((item as any).updatedAt) : new Date(item.createdAt),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nature: (item as any).nature ?? '',
        //section_id: (item as any).section_id ?? { name: 'N/A' },
      })) as unknown as Point[];
    }, [points]);
//const columns = [ "name", "nature"] as (keyof Point)[];
const navigate = useNavigate();
 
 // supprimer un point
 const handelDelete =useCallback((id: string) => {
 console.log("ID à supprimer :", id);
 const confirm = window.confirm(`Êtes-vous sûr de vouloir supprimer le point ?`);
    if (!confirm) return;
    api.delete(`/points/${id}`)
        .then(() => {
            toast.success("Point supprimé avec succès");
            navigate("/dashboard/incidents");
        })
        .catch(error => {
            if (error?.response?.status === 403) {
                toast.error('Vous devez être administrateur pour supprimer un point');
            } else {
            toast.error("Erreur lors de la suppression du point");
            }
            console.error("Erreur lors de la suppression :", error);
        });
        
}, [navigate]);

// Afficher les détails du point
const handleView = useCallback((id: string) => {
  //console.log("ID à afficher :", id);
  navigate(`/dashboard/point/view/${id}`);
}, [navigate]);

// Implémentez la logique pour éditer le point
const handleEdit = useCallback((id: string) => {
  //console.log("ID à éditer :", id);
  navigate(`/dashboard/point/edit/${id}`);
}, [navigate]);
 

// Sélection de lignes
const toggleSelect = (id: string) => {
  setSelectedIds(prev =>
    prev.includes(id)
      ? prev.filter(i => i !== id)
      : [...prev, id]
  )
}

const selectAll = (ids: string[]) => {
  setSelectedIds(ids)
}

const clearSelection = () => {
  setSelectedIds([])
}
 // Suppression de plusieurs points
  const handleDeleteSelected = async () => {
  if (selectedIds.length === 0) {
    toast.error("Aucun point sélectionné")
    return
  }

  const confirm = window.confirm(
    `Supprimer ${selectedIds.length} points ?`
  )
  if (!confirm) return

   try {
    await api.delete("/points/deletemultiple", {
      data: { ids: selectedIds }, // ← axios.delete envoie le body via `data`
    })

    toast.success("Points supprimés avec succès")

    clearSelection()

    window.location.reload() // simple & efficace

  } catch (error) {
    toast.error("Erreur lors de la suppression multiple")
    console.error(error)
  }
}
  
  return (
    <>
    { loading && (
    <div className="absolute p-4 inset-0 flex items-center justify-center bg-white/60 z-50">
      <Spinner />
    </div>
  )}
  { error && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-50">
      <p className="text-red-500">Error: {error}</p>
    </div>
  )}
    <div className="flex flex-1 flex-col gap-4 p-4">
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <WidgetContainer link="points/incidents/total" title="Total coupures BNG"  refreshInterval={duree} icon={ <Info className="h-4 w-4"/> }  variant="purple" />

              <WidgetContainer link="points/incidents/active" title="Incidents actifs"  refreshInterval={duree} icon={ <TriangleAlert  className="h-4 w-4"/> }  variant="red" />

              <WidgetContainer link="points/incidents/pending" title="Incidents en traitement"   refreshInterval={duree} icon={ <ClockFading className=" h-4 w-4"/> }  variant="yellow" />
                <WidgetContainer link="points/incidents/resolved" title="Incidents résolus"  refreshInterval={duree} icon={ <ShieldCheck className=" h-4 w-4"/> }  variant="green" />
          </div>
            <div className='grid gap-4 sm:grid-cols-1 lg:grid-cols-2'>
              <AnalyticsChartBar dataincidents={datas} />
              <AnalyticsChartPie dataincidents={datas} />
            </div>
         <TableBase data={datas} columnConfigs={POINT_COLUMNS} title="Liste de Pts As-built" actionadd={() => navigate("/dashboard/add-point")} fileNames={fileNamesExcel} handleDelete={handelDelete} handleView={handleView} handleEdit={handleEdit} handleDeleteSelected={handleDeleteSelected} toggleSelect={toggleSelect} 
      selectAll={selectAll} clearSelection={clearSelection}/>
    </div>
    </>
  )
}

export default ListIncidents

