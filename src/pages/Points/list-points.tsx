import { usePoints } from "@/hooks/usePoints"
import {TableBase} from "@/components/table-base"
import {useMemo,useCallback, useState } from 'react';
import type { Point } from '@/datatypes/index';
import { Spinner } from "@/components/ui/spinner"
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { POINT_COLUMNS } from "@/components/table/column-presets"
import { sleep } from '@/lib/utils'
function ListPoints() {

const [selectedIds, setSelectedIds] = useState<string[]>([])
const fileNamesExcel = "Points_As-built";
 const { points, loading, error } = usePoints();
   const datas: Point[] = useMemo(() => {
      return points.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updatedAt: (item as any).updatedAt ? new Date((item as any).updatedAt) : new Date(item.createdAt),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nature: (item as any).nature ?? '',
      })) as unknown as Point[];
    }, [points]);

// const columns = [ "name", "longitude", "latitude", "nature"] as (keyof Point)[];
const navigate = useNavigate();

 
 // supprimer un point
 const handelDelete =useCallback((id: string) => {
 console.log("ID à supprimer :", id);
 const confirm = window.confirm(`Êtes-vous sûr de vouloir supprimer le point ?`);
    if (!confirm) return;
    api.delete(`/points/${id}`)
        .then(() => {
            toast.success("Point supprimé avec succès");
            //navigate("/dashboard/points");
            window.location.reload()
        })
        .catch(error => {
            if (error?.response?.status === 403) {
                toast.error('Vous devez être administrateur pour supprimer un point');
            } else {
            toast.error("Erreur lors de la suppression du point");
            }
            console.error("Erreur lors de la suppression :", error);
        });
        
}, []);

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
  console.log("ID sélectionné :", id);
  
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

/*  const confirm = window.confirm(
    `Supprimer ${selectedIds.length} points ?`
  )
  if (!confirm) return
*/
  try {
    await api.delete("/points/deletemultiple", {
      data: { ids: selectedIds }, // ← axios.delete envoie le body via `data`
    })
    
    //toast.success("Points supprimés avec succès")
     toast.promise(sleep(2000), {
      loading: 'Deleting tasks...',
      success: () => {
        return `Deleted ${selectedIds.length} ${
          selectedIds.length > 1 ? 'points' : 'point'
        }`
      },
      error: 'Error',
    })

    clearSelection()

    window.location.reload() // simple & efficace

  } catch (error) {
    toast.error("Erreur lors de la suppression multiple")
    console.log(error)
  }
}

  return (
    <div className="p-4">
      {loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-50">
      <Spinner />
    </div>
  )}

  {error && (
    <div className="text-red-500 text-center">{error}</div>
  )}
      
      <TableBase data={datas} columnConfigs={POINT_COLUMNS} title="Liste de Pts As-built" actionadd={() => navigate("/dashboard/add-point")} fileNames={fileNamesExcel} handleDelete={handelDelete} handleView={handleView} handleEdit={handleEdit} handleDeleteSelected={handleDeleteSelected} toggleSelect={toggleSelect}
      selectAll={selectAll} clearSelection={clearSelection}/>
      
    </div>
  )
}

export default ListPoints