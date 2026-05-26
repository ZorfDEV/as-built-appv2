import api from "@/lib/api"
import type { Point, Section,marqueur,CreatedSectionData } from "@/datatypes"
//import { toast } from "sonner"

// GET
export const fetchSections = async (): Promise<Section[]> => {
  const res = await api.get("/sections")
  return res.data
}
export const fetchSectionById = async (id: string ): Promise<{ section: Section; points: Point[]; marqueurs: marqueur[] }> => {
  if (!id) throw new Error("ID requis")

  const res = await api.get(`/sections/${id}`)
  console.log("Données de la section :", res.data);
  return res.data
}

// ACTIONS (IMPORTANT: pas des hooks)
export const createSection = async (data: CreatedSectionData): Promise<Section> => {
  const res = await api.post("/sections", data)
  return res.data
}

export const updateSection = async (id: string, data: Section): Promise<Section> => {
  const res = await api.put(`/sections/${id}`, data)
  return res.data
}