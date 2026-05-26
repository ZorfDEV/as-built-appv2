import api from "@/lib/api"
import { useEffect, useState } from "react"
import {TableBase} from "@/components/table-base"
import { USER_COLUMNS } from "@/components/table/column-presets"
import { toast } from "sonner";
import Register from "./register";
import EditUser from "./edit-user.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { useNavigate } from "react-router-dom";

function ListUsers() {

  const [users, setUsers] = useState([])
 const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  //const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await api.get("/auth/users")
      setUsers(response.data)
      setLoading(false)

    }

    fetchUsers()
  }, [])

  //add user
  const handleAdd = () => {
    // Logique pour ajouter un utilisateur (ex: ouvrir un formulaire)
    console.log("Ajouter un utilisateur")
     setEditingId(null);
  setOpenDialog(true);
  }

//delete user
const handleDelete = (id: string) => {
  // Logique pour supprimer un utilisateur
  console.log("Supprimer l'utilisateur avec ID :", id)
    const confirm = window.confirm(`Êtes-vous sûr de vouloir supprimer cet utilisateur ?`)
    if (confirm) {
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
    }
}

  

  //view user details
  const handleView = (id: string) => {
    // Logique pour afficher les détails d'un utilisateur
    console.log("Afficher les détails de l'utilisateur avec ID :", id)
    navigate(`/dashboard/user/view/${id}`)
  }

  //edit user
  const handleEdit = (id: string) => {
    // Logique pour éditer un utilisateur (ex: ouvrir un formulaire pré-rempli)
    console.log("Éditer l'utilisateur avec ID :", id)
     setEditingId(id);
  setOpenDialog(true);
  }

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
 // Suppression de plusieurs utilisateurs
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

  return (
    <div className="p-4">
      {loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-50">
      <Spinner />
    </div>
  )}
  {openDialog && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex  items-center justify-center"><span>{editingId ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</span></DialogTitle>
            
            </DialogHeader>
            {/* Vous pouvez réutiliser le composant de formulaire d'édition ici */}
            {editingId ? (
              <EditUser id={editingId} onSuccess={() => {
                setOpenDialog(false);
                window.location.reload();
              }} />
            ) : (
              <Register onSuccess={() => {
                setOpenDialog(false);
                window.location.reload();
              }} />
            )}
          </DialogContent>
        </Dialog>
      )}
      <TableBase columnConfigs={USER_COLUMNS} data={users} actionadd={() =>handleAdd ()}  handleDelete={handleDelete} handleView={handleView} handleEdit={handleEdit} title="Liste des utilisateurs"
      fileNames="Tableau des utilisateurs"
      handleDeleteSelected={handleDeleteSelected} 
      toggleSelect={toggleSelect}
      selectAll={selectAll} clearSelection={clearSelection}  />
    </div>
  )
}

export default ListUsers