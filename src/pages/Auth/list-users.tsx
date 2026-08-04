import api from "@/lib/api"
import { useCallback, useEffect, useState } from "react"
import {TableBase} from "@/components/table-base"
import { USER_COLUMNS } from "@/components/table/column-presets"
import { toast } from "sonner";
import Register from "./register.tsx";
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
  useEffect(() => {
    const fetchUsers = async () => {
      const response = await api.get("/auth/users")
      setUsers(response.data)
      setLoading(false)

    }

    fetchUsers()
  }, [])

 

//delete user
const handleDelete = (id: string) => {
  console.log("Supprimer l'utilisateur avec ID :", id)
    const confirm = window.confirm(`Êtes-vous sûr de vouloir supprimer cet utilisateur ?`)
    if (confirm) {
      api.delete(`/auth/users/${id}`)
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
  const handleView = (id: string) => {
    navigate(`/dashboard/user/view/${id}`)
  }

   //add user
  const handleAddUser = () => {
   setEditingId(null);
  setOpenDialog(true);
  }

  //edit user
  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
    setOpenDialog(true);
  }, []);
   

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
   await api.delete("/auth/deletemultiple", {
      data: { ids: selectedIds },
    })
    toast.success("sections supprimés avec succès")
    clearSelection()
    window.location.reload() 

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
              <DialogTitle className="flex  items-center justify-center font-semibold text-axblue-2 dark:text-white/80"><span>{editingId ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</span></DialogTitle>
            
            </DialogHeader>
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
      <TableBase columnConfigs={USER_COLUMNS} data={users} actionadd={handleAddUser}  handleDelete={handleDelete} handleView={handleView} handleEdit={handleEdit} title="Liste des utilisateurs"
      fileNames="Tableau des utilisateurs"
      handleDeleteSelected={handleDeleteSelected} 
      toggleSelect={toggleSelect}
      selectAll={selectAll} clearSelection={clearSelection}  />
    </div>
  )
}

export default ListUsers