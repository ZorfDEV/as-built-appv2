import {useState} from 'react'
//import { Button } from "@/components/ui/button" 
import  ButtonMain  from "@/components/button-main"
import {
  ButtonGroup
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
import {Globe, Scissors} from "lucide-react"
import { Input } from "../ui/input"


function BtnMap({ handleSubmit }: { handleSubmit: (lat: string | null, lon: string | null) => void; handleRoute: (pointA: string , pointB: string ) => void }) {

  //const user = JSON.parse(localStorage.getItem("user") || "null");
  const [lat, setLat] = useState<string | null>(null);
  const [lon, setLon] = useState<string | null>(null);
  return (
    <div className="absolute top-4 right-40 z-2000  ">
    <div className="flex flex-col sm:flex-row gap-4 sm:justify-center ">
    <ButtonGroup orientation="horizontal" className="w-full" >
      <AlertDialog>
      <AlertDialogTrigger asChild>
    <ButtonMain actioname="destructive" type="button" label='Ajouter incident'> 
     <div className="flex items-center -space-x-3 translate-x-3">
     <Scissors className="h-5 w-5 font-bold -translate-x-2 transition duration-300 group-hover:translate-x-0" />
    <div className="w-2.5 h-[1.6px] rounded bg-white origin-left scale-x-0 transition duration-300 group-hover:scale-x-100"></div>
    </div>
    </ButtonMain>
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
  <div className="grid grid-cols-1 gap-3 p-3">

    {/* Latitude */}
    <div className="relative">
      <Input
        name="lat"
        type="text"
        placeholder="Latitude"
        className="pr-10"
        onChange={(e) => setLat(e.target.value)}
        required
      />

      <Globe
        className="
          absolute right-3 top-1/2
          h-4 w-4
          -translate-y-1/2
          text-muted-foreground
          pointer-events-none
        "
      />
    </div>

    {/* Longitude */}
    <div className="relative">
      <Input
        name="lon"
        type="text"
        placeholder="Longitude"
        className="pr-10"
        onChange={(e) => setLon(e.target.value)}
      />

      <Globe
        className="
          absolute right-3 top-1/2
          h-4 w-4
          -translate-y-1/2
          text-muted-foreground
          pointer-events-none
        "
      />
    </div>

  </div>
</form>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleSubmit(lat, lon)} type="submit">Ajouter</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
</ButtonGroup>
    </div>
    </div>

  )
}

export default BtnMap