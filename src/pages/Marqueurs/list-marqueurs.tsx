import api from "@/lib/api";
import { toast } from "sonner";
import { useMarqueurs } from "@/hooks/useMarqueurs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ButtonGroup } from "@/components/ui/button-group"
import { PlusIcon,Trash2Icon,SquarePen,Pencil } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import EditMarqueur from "./edit-marqueur"
import AddMarqueur from "./add-marqueur"

function ListMarqueurs() {
  
 const { marqueurs, loading, error } = useMarqueurs()
 const [editingId, setEditingId] = useState<string | null>(null)
 const [openDialog, setOpenDialog] = useState(false);
const navigate = useNavigate();

 const handeleAdd = () => {
  setEditingId(null);
  setOpenDialog(true);
}
const handleEdit = useCallback((id: string) => { 
    if (!id) {
      console.error("ID manquant pour l'édition");
      return;
    }
    setEditingId(id);
    setOpenDialog(true);
  }, []);

 const handelDelete =useCallback((id: string) => {
 console.log("ID à supprimer :", id);
 const confirm = window.confirm(`Êtes-vous sûr de vouloir supprimer ce marqueur ?`);
    if (!confirm) return;
    api.delete(`/marqueurs/${id}`)
        .then(() => {
            toast.success("Marqueur supprimé avec succès");
            navigate("/dashboard/marqueurs");
        })
        .catch(error => {
            if (error?.response?.status === 403) {
                toast.error('Vous devez être administrateur pour supprimer un marqueur');
            } else {
            toast.error("Erreur lors de la suppression du marqueur");
            }
            console.error("Erreur lors de la suppression :", error);
        });
        
}, [navigate]);

  return (
    <div className="flex items-center justify-center bg-muted p-4 rounded-lg">
       {openDialog && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex  items-center justify-center"><span>{editingId ? "Modifier la marqueur" : "Ajouter une marqueur"}</span></DialogTitle>
            
            </DialogHeader>
            {/* Vous pouvez réutiliser le composant de formulaire d'édition ici */}
            {editingId ? (
              <EditMarqueur id={editingId} onSuccess={() => {
                setOpenDialog(false);
                window.location.reload();
              }} />
            ) : (
              <AddMarqueur onSuccess={() => {
                setOpenDialog(false);
                window.location.reload();
              }} />
            )}
          </DialogContent>
        </Dialog>
      )}
        <div className="w-full flex-1">
      <div className="flex w-full items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Marqueurs</h1>
        <Button variant="outline" size="sm" onClick={()=>{handeleAdd()}}>
          <PlusIcon />
          Ajouter
        </Button>
      </div>
      {loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-50">
      <Spinner />
    </div>
  )}

      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-2">
          {marqueurs.map((marqueur) => (
            <div key={marqueur._id} className="aspect-square " >
              <Card className="relative w-full">
                <CardHeader>
                  <div className="flex items-center justify-center p-2" >
                  <img
                    src={`/api${marqueur.file}`}
                    alt={marqueur.name}
                    className="relative h-16 w-16 "
                  />
                </div>
                  <CardAction>
                    <Badge variant="secondary"><Pencil/> Modifier</Badge>
                  </CardAction>
                  <CardTitle>{marqueur.name}</CardTitle>
                </CardHeader>
                 <CardContent>
                <ScrollArea  className="w-full rounded-md border p-4">
                 <CardDescription>
                    {marqueur.description}
                  </CardDescription>
                </ScrollArea>
                </CardContent>
          <CardFooter >
            <div className="absolute bottom-2 right-2">
          <ButtonGroup >
           <Button variant="outline" size="sm" onClick={() => handleEdit(marqueur._id)}>
          <SquarePen />
        </Button>
        <Button variant="outline" size="icon-sm" onClick={() => handelDelete(marqueur._id)}>
          <Trash2Icon  />
        </Button>
      </ButtonGroup>
      </div>
          </CardFooter>
        </Card>
      </div>
      ))}
    </div>
      )}

    </div>
    </div>
      
  )
}

export default ListMarqueurs