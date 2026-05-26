import api from "@/lib/api"
import type {  marqueur,CreateMarqueurData} from "@/datatypes"
//import { toast } from "sonner"

export const fetchMarqueurs = async (): Promise<marqueur[]> => {
  const res = await api.get("/marqueurs")
  return res.data
}


// Création avec fichier
export const createMarqueur = async (data: {
  name: string
  description?: string
  file: File
}): Promise<CreateMarqueurData> => {
  const formData = new FormData()
  formData.append("name", data.name)
  formData.append("description", data.description ?? "")
  formData.append("file", data.file)  

  const res = await api.post<CreateMarqueurData>("/marqueurs", formData)
  return res.data
}

// ✅ Mise à jour avec fichier optionnel
export const updateMarqueur = async (
  id: string,
  data: { name?: string; description?: string; file?: string|File }
): Promise<CreateMarqueurData> => {
  const formData = new FormData()
  if (data.name)        formData.append("name", data.name)
  if (data.description !== undefined) formData.append("description", data.description)
  if (data.file)        formData.append("file", data.file)  // ✅ seulement si un nouveau fichier
  console.log("Données envoyées pour mise à jour du marqueur :", {
    name: data.name,
    description: data.description,
    file: data.file instanceof File ? data.file.name : data.file, // Affiche le nom du fichier ou l'URL
  })
  const res = await api.put<CreateMarqueurData>(`/marqueurs/${id}`, formData)
  return res.data
}

export const deleteMarqueur = async (id: string): Promise<void> => {
  await api.delete(`/marqueurs/${id}`)
}

//fetch marqueur by id
export const fetchMarqueurById = async (id: string): Promise<marqueur> => {
  const res = await api.get(`/marqueurs/${id}`)
  return res.data
}












































