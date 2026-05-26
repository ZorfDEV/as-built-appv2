import { useEffect, useState } from "react"
import { fetchMarqueurs } from "@/interfaces/marqueurServices"
import type { marqueur } from "@/datatypes"

export function useMarqueurs() {
  const [marqueurs, setMarqueurs] = useState<marqueur[]>([])

  useEffect(() => {
    fetchMarqueurs().then(setMarqueurs).catch(console.error)
  }, [])

  return { marqueurs, loading: marqueurs.length === 0, error: null }
}