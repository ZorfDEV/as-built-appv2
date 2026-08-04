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
import {
  MapPinned,
  Tag,
  Globe,
  FileText,
  Layers3,
  CircleDot,
  Grid2X2,
  Star,
  ChevronsLeftRight,
  Info,
  MapPinPen,
} from "lucide-react";
import SectionTitle  from "@/components/section-title";
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type SelectOption = {
  value: string
  label: string
}

type EditPointFormValues = CreatePointData

export default function EditPoint() {

  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { sections } = useSections()
  const { marqueurs } = useMarqueurs()
  const { update } = useUpdatePoint()

  const [error, setError] = useState<string | null>(null)

  // Options typées avec SelectOption
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
        const message = err instanceof Error ? err.message : "Erreur inconnue"
        setError(message)
      }
    }

    load()
  }, [id, reset])

  const onSubmit = async (data: EditPointFormValues): Promise<void> => {
    if (!id) {
      setError("ID manquant")
      return
    }
    await update(id, data)
  }

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
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className=" flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-400/10">
                <MapPinned className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                 <CardTitle className='text-axblue-2 dark:text-white/80'>Modifier le  point</CardTitle>
                <p className="mt-1 text-sm md:text-base text-slate-400">
                  Renseignez les nouvelles informations du point .
                </p>
              </div>
            </div>
          </div>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
           <div className="relative z-10">
          <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1fr_auto_1fr]">
              {/* LEFT SIDE */}
            <div className="space-y-6">
             <SectionTitle
             icon={<MapPinPen  className="h-4 w-4"/>}
             title="Informations générales"/>
              <FieldGroup>
                <Field>
                  <FloatingInput
                    label="Nom"
                    {...register("name", { required: "Le nom est requis" })}
                    icon={<Tag className="h-5 w-5 text-emerald-400" />} 
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </Field>

                <Field>
                  <FloatingInput
                    label="Longitude"
                    {...register("longitude", { valueAsNumber: true })}
                    icon={<Globe className="h-5 w-5 text-emerald-400" />} 
                  />
                </Field>

                <Field>
                  <FloatingInput
                    label="Latitude"
                    {...register("latitude", { valueAsNumber: true })}
                    icon={<Globe className="h-5 w-5 text-emerald-400" />} 
                  />
                </Field>

                <Field>
                  <FloatingInput label="Description" {...register("description")} 
                  type="textarea" required  icon={<FileText className="h-5 w-5 text-emerald-400" />}  labelclassName="peer-focus:bg-white  dark:peer-focus:text-emerald-400 dark:peer-focus:bg-background/80 "
                  />
                </Field>
                 </FieldGroup>
                 </div>
                {/* Divider desktop */}
        <div className="hidden xl:flex items-center justify-center">
           <div className="h-full w-px bg-border shrink-0 relative">
               <Button variant="outline" className=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full  flex items-center justify-center ">
                  <ChevronsLeftRight className="h-4 w-4 " />
                            </Button>
                          </div>
                        </div>

            {/* RIGHT SIDE */}
              <div className="space-y-6">
                <SectionTitle
                icon={<Layers3 className="h-4 w-4" />}
                title="Classification"/>
              <FieldGroup>
                <Field>
                  <FloatingSelect
                    label="Nature"
                    onValueChange={(v: string) => setValue("nature", v)}
                    options={[
                      { value: "pt-asbuilt", label: "As Built" },
                       { value: "borne-réperage", label: "Borne de Réperage" },
                        { value: "ct", label: "Centre Technique" },
                      { value: "incident", label: "Incident" },
                      { value: "chambre", label: "Chambre" },
                      { value: "gare", label: "Gare" },
                      { value: "signalisation", label: "Signalisation" },
                    ] satisfies SelectOption[]} 
                    name={"Nature"} 
                    id={"Nature"}
                    icon={<Tag className="h-5 w-5 text-emerald-400" />}/>
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
                    icon={<CircleDot className="h-4 w-4 text-emerald-400" />}

                  />
                </Field>

                <Field>
                  <FloatingSelect
                      name={"section_id"}
                    id={"section_id"}
                    label="Section"
                    onValueChange={(v: string) => setValue("section_id", v)}
                    options={optionsSections}
                    icon={<Grid2X2 className="h-4 w-4 text-emerald-400" />} 
                  />
                </Field>

                <Field>
                  <FloatingSelect
                    name={"marqueur_id"}
                    id={"marqueur_id"}
                    label="Marqueur"
                    onValueChange={(v: string) => setValue("marqueur_id", v)}
                    icon={<Star className="h-5 w-5 text-emerald-400" />}
                    options={optionsMarqueurs}
                  />
                </Field>
              </FieldGroup>
              <div className=" flex flex-col-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 ">
               <Badge className="rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                <Info className='h-4 w-4' />
               </Badge>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Attention de bien vérifier les coordonées lat et lon du point.
                </p>
              </div>
           </div>
           </div>
             {/* Footer actions */}
            <Separator className="my-8" />
           <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
               <Field className='w-40 sm:w-auto'>
                <Button variant="outline" onClick={() => navigate(-1)} className='w-auto' >
                  Annuler
                </Button>
              </Field>
              <Field className='w-40 sm:w-auto'>
                {/* Désactivé pendant la soumission */}
                <ButtonMain actioname="main" type="submit" disabled={isSubmitting} label={isSubmitting ? "Enregistrement..." : "Enregistrer"} / > 
              </Field>
             </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}