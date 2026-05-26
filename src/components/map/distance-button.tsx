import {useState} from 'react'
import { Button } from "@/components/ui/button" 
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Scissors,ChevronsLeftRightEllipsis} from "lucide-react"
import { Input } from "../ui/input"


function BtnMap({ handleSubmit, handleRoute }: { handleSubmit: (lat: string | null, lon: string | null) => void; handleRoute: (pointA: string , pointB: string ) => void }) {

  const [pointAName, setPointAName] = useState<string>('');
  const [pointBName, setPointBName] = useState<string>('');
  //const user = JSON.parse(localStorage.getItem("user") || "null");
  const [lat, setLat] = useState<string | null>(null);
  const [lon, setLon] = useState<string | null>(null);
  return (
    <div className="absolute top-4 right-40 z-2000  ">
    <div className="flex flex-col sm:flex-row gap-4 sm:justify-center ">
    <ButtonGroup orientation="horizontal" className="w-full" >
      <AlertDialog>
      <AlertDialogTrigger asChild>
    <Button variant='destructive'> 
    <Scissors className="mr-2 h-4 w-4" />
    Ajouter PI
    </Button>
    </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
           <span className="relative flex size-3 cursor-pointer" >
               <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex  items-center justify-center text-[8px] text-white p-1 size-3 rounded-full bg-red-500"></span>
              </span>
          </AlertDialogMedia>
          <AlertDialogTitle>Ajouter un point d'incident</AlertDialogTitle>
          <AlertDialogDescription>
            Saisissez les coordonnées du point d'incident à ajouter.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form className="p-4 items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-3 p-3">
          <Input name='lat' type="text"  placeholder="Latitude"  onChange={e => setLat(String(e.target.value))} required />
          <Input name='lon' type="text" placeholder="Longitude" onChange={e => setLon(String(e.target.value))}/>
                </div>
              </form>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleSubmit(lat, lon)} type="submit">Ajouter</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <ButtonGroupSeparator />
  <AlertDialog>
      <AlertDialogTrigger asChild>
    <Button variant='outline'> 
    <ChevronsLeftRightEllipsis className="mr-2 h-4 w-4" />
    Itineraire 
    </Button>
    </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
           <span className="relative flex size-3 cursor-pointer" >
               <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex  items-center justify-center text-[8px] text-white p-1 size-3 rounded-full bg-green-500"></span>
              </span>
          </AlertDialogMedia>
          <AlertDialogTitle>Itinéraire</AlertDialogTitle>
          <AlertDialogDescription>
           Saisissez les coordonnées du point de départ et d'arrivée pour calculer l'itinéraire.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-3 p-3">
              <Input name='pointAName' type="text"  placeholder="Point de départ" 
              onChange={e => setPointAName(String(e.target.value))} required />
              <Input name='pointBName' type="text" placeholder="Point d'arrivée"
               onChange={e => setPointBName(String(e.target.value))}/>
            </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleRoute(pointAName, pointBName)} type="submit">Calculer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
</ButtonGroup>
    </div>
    </div>

  )
}

export default BtnMap