/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useUpdatePoint.ts

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { updateSection } from "@/interfaces/sectionService"
import { toast } from "sonner"
import type { Section } from "@/datatypes"

export function useUpdateSection() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const update = async (id: string, data: Section) => {
    setLoading(true)
    setError(null)

    try {
      await updateSection(id, data)

      toast.success("Section mise à jour avec succès")

      //redirect automatique
      navigate('dashboard/sections')

    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Erreur lors de la mise à jour"

      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return { update, loading, error }
}