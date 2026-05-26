import { useState, useMemo, useCallback } from "react"
import { useMap } from "react-leaflet"
import Fuse from "fuse.js"
import { toast } from "sonner"
//import { haversineDistance } from "../../lib/distance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"
import type { Point } from '@/datatypes/index';


export default function SearchBar({ points }: { points: Point[] }) {
  const map = useMap()

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Point[]>([])
  const [visible, setVisible] = useState(false)

  /* ======================
     FUSE INDEX (ULTRA FAST)
  ====================== */
  const fuse = useMemo(() => {
    return new Fuse(points, {
      keys: ["name"],
      threshold: 0.3, // précision
      ignoreLocation: true,
      minMatchCharLength: 2,
    })
  }, [points])

  /* ======================
     SEARCH
  ====================== */
  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()

      if (!query.trim()) {
        toast.error("Veuillez entrer un nom ou coordonnées.")
        return
      }

      // ---------- GPS SEARCH ----------
      const coordRegex =
        /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/

      if (coordRegex.test(query)) {
        const [lat, lng] = query.split(",").map(Number)

        if (
          isNaN(lat) ||
          isNaN(lng) ||
          lat < -90 ||
          lat > 90 ||
          lng < -180 ||
          lng > 180
        ) {
          toast.error("Coordonnées invalides")
          return
        }

        map.setView([lat, lng], 15)
        toast.success("Carte centrée")
        return
      }

      // ---------- FUZZY SEARCH ----------
      const fuseResults = fuse.search(query).slice(0, 10)

      if (fuseResults.length === 0) {
        toast.error("Aucun résultat")
        return
      }

      const matchedPoints = fuseResults.map((r) => r.item)
      setResults(matchedPoints)
      setVisible(true)

      // Zoom sur premier résultat
      const first = matchedPoints[0]
      map.setView([first.latitude, first.longitude], 15)
    },
    [query, fuse, map]
  )

  return (
    <div className="flex flex-col items-center">
      {/* SEARCH BAR */}
      <form
        onSubmit={handleSearch}
        className="absolute top-4 left-1/4 -translate-x-1/2 z-2000 flex gap-2 items-center shadow-lg bg-white/80 rounded-lg  w-96"
      >
        <ButtonGroup orientation="horizontal" className="w-full">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom du point ou coordonnées (lat,lng)"

        />
        <Button type="submit" variant="outline">
          <SearchIcon />
        </Button>
        </ButtonGroup>
      </form>

      {/* RESULTS */}
      {visible && results.length > 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-2000 w-125">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Résultats ({results.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {results.map((p, index) => (
                  <li
                    key={p._id.toString()}
                    className="cursor-pointer text-sm hover:text-blue-600"
                    onClick={() => {
                      map.setView([p.latitude, p.longitude], 16)
                      setVisible(false)
                    }}
                  >
                    {p.name}
                    {index === 0 && (
                      <span className="ml-2 text-green-600 text-xs">
                        (meilleure correspondance)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}