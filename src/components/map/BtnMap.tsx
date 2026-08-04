import { useState } from 'react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Scissors, Route, Globe } from "lucide-react"

function BtnMap({
  handleSubmit,
  handleRoute,
}: {
  handleSubmit: (lat: string | null, lon: string | null) => void
  handleRoute: (pointA: string, pointB: string) => void
}) {
  const [lat, setLat] = useState<string | null>(null)
  const [lon, setLon] = useState<string | null>(null)
  const [pointAName, setPointAName] = useState("")
  const [pointBName, setPointBName] = useState("")

  return (
    <div className="absolute top-4 right-40 z-2000">

      {/* ── Groupe de boutons ── */}
      <div className="flex items-center rounded-[10px] overflow-hidden border border-border bg-background shadow-sm">

        {/* Bouton Créer PI */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="
                flex items-center gap-2 px-4 h-10
                bg-[#D85A30] hover:bg-[#993C1D]
                text-white text-sm font-medium
                transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D85A30]/50
              "
            >
              <Scissors className="h-4 w-4 shrink-0" />
              Créer PI
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <span className="relative flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-red-500" />
                </span>
              </AlertDialogMedia>
              <AlertDialogTitle>Ajouter un point d'incident</AlertDialogTitle>
              <AlertDialogDescription>
                Saisissez les coordonnées du point d'incident à ajouter.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-3 px-4 py-2">
              <div className="relative">
                <Input
                  placeholder="Latitude (N/S)"
                  className="pr-10"
                  onChange={(e) => setLat(e.target.value)}
                />
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <Input
                  placeholder="Longitude (E/W)"
                  className="pr-10"
                  onChange={(e) => setLon(e.target.value)}
                />
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleSubmit(lat, lon)}>
                Ajouter
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Séparateur vertical */}
        <div className="w-px h-10 bg-border" />

        {/* Bouton Itinéraire */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="
                flex items-center gap-2 px-4 h-10
                bg-background hover:bg-muted
                text-sm font-medium text-foreground
                transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              "
            >
              <Route className="h-4 w-4 shrink-0 text-emerald-600" />
              Itinéraire
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <span className="relative flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
                </span>
              </AlertDialogMedia>
              <AlertDialogTitle>Itinéraire</AlertDialogTitle>
              <AlertDialogDescription>
                Saisissez le point de départ et d'arrivée pour calculer l'itinéraire.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-3 px-4 py-2">
              <Input
                placeholder="Point de départ"
                onChange={(e) => setPointAName(e.target.value)}
              />
              <Input
                placeholder="Point d'arrivée"
                onChange={(e) => setPointBName(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleRoute(pointAName, pointBName)}>
                Calculer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  )
}

export default BtnMap