/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api"
import type { Point, CreatePointData, Section} from "@/datatypes"
import { toast } from "sonner"
//import { set } from "date-fns"

// GET
export const fetchPoints = async (): Promise<Point[]> => {
  const res = await api.get("/points")
  return res.data
}

export const fetchIncidentPoints = async (): Promise<Point[]> => {
  const res = await api.get("/points/pointsofcup")
  return res.data
}

export const fetchPointById = async (id: string ): Promise<Point> => {
  if (!id) throw new Error("ID requis")

  const res = await api.get(`/points/${id}`)
  return res.data
}

export const fetchSections = async (): Promise<Section[]> => {
  const res = await api.get("/sections")
  return res.data
}

// ACTIONS (IMPORTANT: pas des hooks)
export const createPoint = async (data: CreatePointData): Promise<Point> => {
  const res = await api.post("/points", data)
  return res.data
}

export const deletePoint = async (id: string): Promise<void> => {
  await api.delete(`/points/${id}`)
}

// src/api/points.ts


export const updatePoint = async (
  id: string,
  data: CreatePointData
): Promise<Point> => {
  try {
    const res = await api.put(`/points/${id}`, data)

    if (res.status !== 200) {
      throw new Error(
        res.data?.message || "Erreur lors de la mise à jour"
      )
    }

    toast.success("Point mis à jour avec succès")

    return res.data
  } catch (error: any) {
    console.error("UPDATE ERROR:", error)
    toast.error(
      error?.response?.data?.message || "Erreur serveur"
    )
    throw error
  }
}

export function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  if (!value || typeof value !== "string") {
    toast.error(`Champ ${key} invalide`)
    throw new Error(`Champ ${key} invalide`)
  }
  return value
}