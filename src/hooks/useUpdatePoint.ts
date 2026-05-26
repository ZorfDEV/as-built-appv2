/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useUpdatePoint.ts

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { updatePoint } from "@/interfaces/pointInterface"
import { toast } from "sonner"
import type { CreatePointData } from "@/datatypes"

export function useUpdatePoint() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const update = async (id: string, data: CreatePointData) => {
    setLoading(true)
    setError(null)

    try {
      await updatePoint(id, data)

      toast.success("Point mis à jour avec succès")

      // 🔥 redirect automatique
      navigate(-1)

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