import { useEffect, useState } from "react"
import { toast } from "sonner"
import { fetchIncidentPoints } from "@/interfaces/pointInterface"
import type { Point } from "@/datatypes"

export function usePointsIncidents() {
  const [points, setPoints] = useState<Point[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchIncidentPoints()
        setPoints(data)
      } catch {
        setError("Erreur chargement points")
        toast.error("Erreur chargement points")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { points, loading, error }
}