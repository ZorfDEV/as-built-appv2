/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useUpdatePoint.ts

import { useState } from "react"
//import { useNavigate } from "react-router-dom"
import { updateMarqueur } from "@/interfaces/marqueurServices"
import { toast } from "sonner"
import type { CreateMarqueurData } from "@/datatypes"

export function useUpdateMarqueur() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
 // const navigate = useNavigate()

  const update = async (id: string, data: CreateMarqueurData) => {
    setLoading(true)
    setError(null)

    try {
      await updateMarqueur(id, data)

      toast.success("Marqueur mis à jour avec succès")
     // window.location.reload() // Recharge la page pour afficher les changements
      console.log("Marqueur mis à jour avec succès")
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