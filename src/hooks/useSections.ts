import { useEffect, useState } from "react"
import { fetchSections } from "@/interfaces/pointInterface"
import type { Section } from "@/datatypes"

export function useSections() {
  const [sections, setSections] = useState<Section[]>([])

  useEffect(() => {
    fetchSections().then(setSections).catch(console.error)
  }, [])

  return { sections, loading: sections.length === 0, error: null }
}