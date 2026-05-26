import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FloatingInput } from "@/components/floating-input"
import { FloatingSelect } from "@/components/floating-select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import  ButtonMain  from "@/components/button-main"
import { Field, FieldGroup } from "@/components/ui/field"
import { useNavigate, useParams } from "react-router-dom"
import type { CreatePointData, Point } from "@/datatypes"
import { fetchPointById } from "@/interfaces/pointInterface"
import { useSections } from "@/hooks/useSections"
import { useMarqueurs } from "@/hooks/useMarqueurs"
import { useUpdatePoint } from "@/hooks/useUpdatePoint"

// ✅ Type générique pour les options de select
type SelectOption = {
  value: string
  label: string
}

// ✅ Alias clair pour le formulaire
type EditPointFormValues = CreatePointData

export default function EditPoint() {

  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { sections } = useSections()
  const { marqueurs } = useMarqueurs()
  const { update } = useUpdatePoint()

  const [error, setError] = useState<string | null>(null)

  // ✅ Options typées avec SelectOption
  const optionsSections: SelectOption[] = sections.map((section) => ({
    value: section._id,
    label: section.name,
  }))

  const optionsMarqueurs: SelectOption[] = marqueurs.map((marqueur) => ({
    value: marqueur._id,
    label: marqueur.name,
  }))

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, errors }, 
  } = useForm<EditPointFormValues>()

  // Charge les données du point et pré-remplit le formulaire
  useEffect(() => {
    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("ID manquant")
      return
    }

    const load = async (): Promise<void> => {
      try {
        const data: Point = await fetchPointById(id)
        console.debug("Point chargé :", data)

        reset({
          name: data.name,
          longitude: data.longitude,
          latitude: data.latitude,
          description: data.description,
          nature: data.nature,
          status: data.status,
          // ✅ Guard au cas où section_id / marqueur_id seraient null ou déjà une string
          section_id:
            typeof data.section_id === "string"
              ? data.section_id
              : data.section_id?._id ?? "",
          marqueur_id:
            typeof data.marqueur_id === "string"
              ? data.marqueur_id
              : data.marqueur_id?._id ?? "",
          user_id: data.user_id,
        })
      } catch (err) {
        // ✅ Typage explicite de l'erreur
        const message = err instanceof Error ? err.message : "Erreur inconnue"
        setError(message)
      }
    }

    load()
  }, [id, reset])

  // ✅ Return type explicite sur onSubmit
  const onSubmit = async (data: EditPointFormValues): Promise<void> => {
    if (!id) {
      setError("ID manquant")
      return
    }
    await update(id, data)
  }

  // ✅ Affichage de l'erreur si ID manquant ou chargement échoué
  if (error) {
    return (
      <div className="p-4">
        <p className="text-destructive">{error}</p>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Modifier le point</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-3 gap-4">

              <FieldGroup>
                <Field>
                  {/* ✅ Message d'erreur affiché si le champ est requis */}
                  <FloatingInput
                    label="Nom"
                    {...register("name", { required: "Le nom est requis" })}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </Field>

                <Field>
                  <FloatingInput
                    label="Longitude"
                    {...register("longitude", { valueAsNumber: true })}
                  />
                </Field>

                <Field>
                  <FloatingInput
                    label="Latitude"
                    {...register("latitude", { valueAsNumber: true })}
                  />
                </Field>

                <Field>
                  <FloatingInput label="Description" {...register("description")} />
                </Field>
              </FieldGroup>

              <div className="separator-v ml-30 h-auto w-0 border border-gray-200 dark:border-darkborder" />

              <FieldGroup>
                <Field>
                  <FloatingSelect
                    label="Nature"
                    onValueChange={(v: string) => setValue("nature", v)}
                    options={[
                      { value: "pt-asbuilt", label: "As Built" },
                      { value: "incident", label: "Incident" },
                      { value: "chambre", label: "Chambre" },
                    ] satisfies SelectOption[]} // ✅ satisfies vérifie le type sans le widener
                    name={"Nature"} 
                    id={"Nature"}                  />
                </Field>

                <Field>
                  <FloatingSelect
                   name={"status"} 
                    id={"status"}  
                    label="Statut"
                    onValueChange={(v: string) => setValue("status", v)}
                    options={[
                      { value: "active", label: "Actif" },
                      { value: "inactive", label: "Inactif" },
                    ] satisfies SelectOption[]}
                  />
                </Field>

                <Field>
                  <FloatingSelect
                      name={"section_id"}
                    id={"section_id"}
                    label="Section"
                    onValueChange={(v: string) => setValue("section_id", v)}
                    options={optionsSections}
                  />
                </Field>

                <Field>
                  <FloatingSelect
                    name={"marqueur_id"}
                    id={"marqueur_id"}
                    label="Marqueur"
                    onValueChange={(v: string) => setValue("marqueur_id", v)}
                    options={optionsMarqueurs}
                  />
                </Field>
              </FieldGroup>

              <Field>
                <Button
                  type="button" // explicitement "button" pour éviter un submit accidentel
                  variant="ghost"
                  onClick={() => navigate(-1)}
                >
                  Annuler
                </Button>
              </Field>

              <div />

              <Field>
                {/* Désactivé pendant la soumission */}
                <ButtonMain actioname="main" type="submit" disabled={isSubmitting} label={isSubmitting ? "Enregistrement..." : "Enregistrer"} / > 
              </Field>

            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}