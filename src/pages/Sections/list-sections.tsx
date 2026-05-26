import { useSections } from "@/hooks/useSections"
import {TableBase} from "@/components/table-base"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import EditSection from "@/pages/Sections/edit-section"
import AddSection from "@/pages/Sections/add-section"
import {useMemo,useCallback, useState } from 'react';
import type { Section } from '@/datatypes/index';
import { Spinner } from "@/components/ui/spinner"
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { SECTION_COLUMNS } from "@/components/table/column-presets"

function ListSections() {
 const [selectedIds, setSelectedIds] = useState<string[]>([])
 const [openDialog, setOpenDialog] = useState(false);
 const [editingId, setEditingId] = useState<string | null>(null);
const fileNamesExcel = "Sections_As-built";
 const { sections, loading, error } = useSections();
const datas: Section[] = useMemo(() => {
      return sections.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updatedAt: (item as any).updatedAt ? new Date((item as any).updatedAt) : new Date(item.createdAt),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nature: (item as any).nature ?? '',
      })) as unknown as Section[];
    }, [sections]);
const navigate = useNavigate();
 
 
 // supprimer un Section
 const handelDelete =useCallback((id: string) => {
 console.log("ID à supprimer :", id);
 const confirm = window.confirm(`Êtes-vous sûr de vouloir supprimer le Section ?`);
    if (!confirm) return;
    api.delete(`/sections/${id}`)
        .then(() => {
            toast.success("Section supprimé avec succès");
            navigate("/dashboard/sections");
        })
        .catch(error => {
            if (error?.response?.status === 403) {
                toast.error('Vous devez être administrateur pour supprimer un Section');
            } else {
            toast.error("Erreur lors de la suppression du Section");
            }
            console.error("Erreur lors de la suppression :", error);
        });
        
}, [navigate]);

// Afficher les détails du Section
const handleView = useCallback((id: string) => {
  //console.log("ID à afficher :", id);
  navigate(`/dashboard/Section/view/${id}`);
}, [navigate]);

// Implémentez la logique pour éditer le Section
const handleEdit = useCallback((id: string) => {
  //console.log("ID à éditer :", id);
  setEditingId(id);
  setOpenDialog(true);
}, []);
 

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
 // Suppression de plusieurs sections
  const handleDeleteSelected = async () => {
  if (selectedIds.length === 0) {
    toast.error("Aucun Section sélectionné")
    return
  }

  const confirm = window.confirm(
    `Supprimer ${selectedIds.length} sections ?`
  )
  if (!confirm) return

  try {
    await api.delete("/sections/deletemultiple", {
      data: { ids: selectedIds }, // ← axios.delete envoie le body via `data`
    })
    
    toast.success("sections supprimés avec succès")

    clearSelection()

    window.location.reload() // simple & efficace

  } catch (error) {
    toast.error("Erreur lors de la suppression multiple")
    console.error(error)
  }
}

const addsectionform = () => {
  setEditingId(null);
  setOpenDialog(true);
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
  {openDialog && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex  items-center justify-center"><span>{editingId ? "Modifier la section" : "Ajouter une section"}</span></DialogTitle>
            
            </DialogHeader>
            {/* Vous pouvez réutiliser le composant de formulaire d'édition ici */}
            {editingId ? (
              <EditSection id={editingId} onSuccess={() => {
                setOpenDialog(false);
                window.location.reload();
              }} />
            ) : (
              <AddSection onSuccess={() => {
                setOpenDialog(false);
                window.location.reload();
              }} />
            )}
          </DialogContent>
        </Dialog>
      )}
      
      <TableBase data={datas} columnConfigs={SECTION_COLUMNS} title="Liste de sections As-built" actionadd={() => addsectionform()} fileNames={fileNamesExcel} handleDelete={handelDelete} handleView={handleView} handleEdit={handleEdit} handleDeleteSelected={handleDeleteSelected} toggleSelect={toggleSelect}
      selectAll={selectAll} clearSelection={clearSelection} />
    </div>
  )
}

export default ListSections