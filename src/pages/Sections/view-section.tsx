import api from "@/lib/api"
import 'leaflet/dist/leaflet.css';
import type { marqueur, Point, Section} from "@/datatypes"
import { toast } from "sonner"
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect, useMemo, useState } from "react";
import { ScrollArea} from "@/components/ui/scroll-area"
import {
  ArrowLeftIcon,MapPinPen,MapPinPlus,Trash2Icon,} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { fetchSectionById } from "@/interfaces/sectionService";
import MapSections from "@/components/map/map-sections";


function ViewSection() {

    const { id } = useParams<{ id: string }>();
    const [section, setSection] = useState<Section | null>(null);
    const [points, setPoints] = useState<Point[] | null>(null);
    const [marqueurs, setMarqueurs] = useState<marqueur[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
      if (!id) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError("ID manquant");
        return;
      }
      const load = async () => {
        try {
          const res = await fetchSectionById(id);
          console.log("Section chargée :", res.section);
          console.log("Point associé :", res.points);
          setSection(res.section);
          setPoints(res.points);
          setMarqueurs(res.marqueurs);
        } catch (err) {
          setError("Erreur lors du chargement de la section");
          console.error(err);
        }
      };
      load();
    }, [id]);

    const datas: Point[] = useMemo(() => {
          return (points ?? []).map((item) => ({
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

    
    console.log("Marqueurs associés:", marqueurs);

if (error) {
    return <div>{error}</div>;
  }

 const handleDelete = () => {
    const confirm = window.confirm(`Êtes-vous sûr de vouloir supprimer le point ${section?.name} ?`);
    if (!confirm) return;
    //setLoading(true);
    
    api.delete(`/api/sections/${id}`)
        .then(() => {
            toast.success("Section supprimée avec succès");
            navigate(-1); // Retourne à la page précédente
        })
        .catch(error => {
            if (error?.response?.status === 403) {
                toast.error('Vous devez être administrateur pour supprimer une section');
            } else {
            toast.error("Erreur lors de la suppression de la section");
            }
            console.error("Erreur lors de la suppression :", error);
            //setLoading(false);
        });
    };


  return (
    <div className="p-4">
      {section && (
        <Card>
          <CardHeader>
            <CardTitle>{section.name}</CardTitle>
            <div className="absolute  right-20">
             <ButtonGroup>
      <ButtonGroup className="hidden sm:flex">
        <Button variant="outline" size="icon" aria-label="Go Back" onClick={() => window.history.back()}>
          <ArrowLeftIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline"  onClick={() => navigate(`/dashboard/section/edit/${id}`)} >
          <MapPinPen />
         </Button>
        <Button variant="outline" onClick={handleDelete} >
          <Trash2Icon  /></Button>
      </ButtonGroup>
      </ButtonGroup>
          </div>
          </CardHeader>
          <CardContent>
            <ScrollArea  className="w-full rounded-md border p-4">
            <p>{section.description}</p>
            </ScrollArea>
      
          </CardContent>
        </Card>
        
      )}
      {points && points.length > 0 ? (
        <div className="mt-4 p-4 border h-screen rounded-lg">
          <MapSections points={datas} marqueurs={marqueurs ?? []} />
        </div>
      ) : (
        <p className="mt-4 text-center text-gray-500">Aucun point associé à cette section. 
         <Button variant="outline"  onClick={() => navigate(`/dashboard/add-point`)} >
           <MapPinPlus />
         </Button>
        </p>
      )}
      {error && (
        <div className="text-red-500 text-center">{error}</div>
      )}
    </div>

  )
}

export default ViewSection