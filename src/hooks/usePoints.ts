import { useEffect, useState } from "react"
import { toast } from "sonner"
import { fetchPoints } from "@/interfaces/pointInterface"
import type { Point } from "@/datatypes"

export function usePoints() {
  const [points, setPoints] = useState<Point[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

   useEffect(() => {
    fetchPoints()
      .then((data) => {
        setPoints(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Erreur fetchPoints:", err);
        setError(err.message ?? "Erreur inconnue");
         toast.error("Erreur chargement points")
        setPoints([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { points, loading, error };
}

 




 