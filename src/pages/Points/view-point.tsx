import type { Point } from "@/datatypes"
import { fetchPointById} from "@/interfaces/pointInterface"
import api from "@/lib/api"
import { toast } from "sonner"
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect, useState } from "react";
import ClusterMap from "@/components/map/cluster-map";
import { ScrollArea} from "@/components/ui/scroll-area"
import {
  ArrowLeftIcon,MapPinPen,Trash2Icon,} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

function ViewPoint() {
  const { id } = useParams<{ id: string }>();
  const [point, setPoint] = useState<Point | null>(null);
  const [error, setError] = useState<string | null>(null);
  //const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
   
  useEffect(() => {
    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("ID manquant");
      return;
    }

    const load = async () => {
      try {
        const data: Point = await fetchPointById(id);
        setPoint(data);
      } catch (err) {
        setError("Erreur de chargement");
        console.error(err);
      }
    };

    load();
  }, [id]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!point) {
    return <div>Chargement...</div>;
  }

  const createdAtText =
    point.createdAt instanceof Date
      ? point.createdAt.toLocaleString()
      : new Date(point.createdAt).toLocaleString();

    const handleDelete = () => {
    const confirm = window.confirm(`Êtes-vous sûr de vouloir supprimer le point ${point.name} ?`);
    if (!confirm) return;
    //setLoading(true);
    
    api.delete(`/api/points/${id}`)
        .then(() => {
            toast.success("Point supprimé avec succès");
            navigate(-1); // Retourne à la page précédente
        })
        .catch(error => {
            if (error?.response?.status === 403) {
                toast.error('Vous devez être administrateur pour supprimer un point');
            } else {
            toast.error("Erreur lors de la suppression du point");
            }
            console.error("Erreur lors de la suppression :", error);
            //setLoading(false);
        });
    };


  return (
    <div className="container mx-auto p-4">

      <Card>
        <CardHeader>
          <CardTitle>Détails du point</CardTitle>
          <div className="absolute  right-20">
             <ButtonGroup>
      <ButtonGroup className="hidden sm:flex">
        <Button variant="outline" size="icon" aria-label="Go Back" onClick={() => window.history.back()}>
          <ArrowLeftIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline"  onClick={() => navigate(`/dashboard/point/edit/${id}`)} >
          <MapPinPen />
         </Button>
        <Button variant="outline" onClick={handleDelete} >
          <Trash2Icon  /></Button>
      </ButtonGroup>
      </ButtonGroup>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
          <div className="border rounded-md overflow-hidden ">
          <ClusterMap points={point} checkpoints={false} />
          </div>
          <div className="p-4">
            <div className=' flex bg-brandgreen justify-center dark:bg-darklayout items-center p-1 mb-8 top-0 w-full'>
        <h2 className="font-semibold text-xl  text-brandblue dark:text-darktext-primary">Détails: {point.name}</h2>
      </div>
          <p className="flex justify-between ml-2 mb-2 gap-4"><span className="font-semibold text-gray-600 dark:text-darktext-primary text-sm">Longitude:</span> <span className="text-gray-500 text-sm dark:text-darktext-secondary">{point.longitude}</span></p>
          <p className="flex justify-between ml-2 mb-2 gap-4"><span className="font-semibold text-gray-600 dark:text-darktext-primary text-sm">Latitude:</span> <span className="text-gray-500 text-sm dark:text-darktext-secondary">{point.latitude}</span></p>
          <p className="flex justify-between ml-2 mb-2 gap-4"><span className="font-semibold text-gray-600 dark:text-darktext-primary text-sm">Nature:</span> <span className="text-gray-500 text-sm dark:text-darktext-secondary">{point.nature}</span></p>
          <p className="flex justify-between ml-2 mb-2 gap-4"><span className="font-semibold text-gray-600 dark:text-darktext-primary text-sm">Status:</span> <span className="text-gray-500 text-sm dark:text-darktext-secondary">{point.status}</span></p>
          <p className="flex justify-between ml-2 mb-2 gap-4"><span className="font-semibold text-gray-600 dark:text-darktext-primary text-sm">Section:</span> <span className="text-gray-500 text-sm dark:text-darktext-secondary">{typeof point.section_id === 'string' ? point.section_id : point.section_id?.name ?? "N/A"}</span></p>
          <p className="flex justify-between ml-2 mb-2 gap-4"><span className="font-semibold text-gray-600 dark:text-darktext-primary text-sm">Marqueur:</span> <span className="text-gray-500 text-sm dark:text-darktext-secondary">{typeof point.marqueur_id === 'string' ? point.marqueur_id : point.marqueur_id?.name ?? "N/A"}</span></p>
          <p className="flex justify-between ml-2 mb-2 gap-4"><span className="font-semibold text-gray-600 dark:text-darktext-primary">Date de création:</span> <span className="text-gray-500 text-sm dark:text-darktext-secondary">{createdAtText}</span></p>
          <ScrollArea  className="w-full rounded-md border p-4">
            <p className="text-gray-500 text-sm dark:text-darktext-secondary">{point.description}</p>
          </ScrollArea>
          </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ViewPoint


