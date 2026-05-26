import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FloatingInput } from "@/components/floating-input"
import { Button } from "@/components/ui/button"
import ButtonMain  from "@/components/button-main"
import { Field, FieldGroup } from "@/components/ui/field"
import { useNavigate} from "react-router-dom"
import type { Section } from "@/datatypes"
import { fetchSectionById  } from "@/interfaces/sectionService"
import { useUpdateSection } from "@/hooks/useUpdateSection"
import { Textarea } from "@/components/ui/textarea"

type EditSectionFormValues = Section

function EditSection({ id, onSuccess }: { id: string; onSuccess: () => void }) {

  const navigate = useNavigate()
  // const { id } = useParams<{ id: string }>()
  const { update } = useUpdateSection()
  const [error, setError] = useState<string | null>(null)
  const {
      register,
      handleSubmit,
      reset,
      formState: { isSubmitting, errors }, 
    } = useForm<EditSectionFormValues>()

  useEffect(() => {
    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("ID manquant")
      return
    }
    const load = async () => {
      try {
        const { section } = await fetchSectionById(id)
        reset({
          name: section.name,
          description: section.description,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue"
        setError(message)
      }
    }

    load()
  }, [id, reset])

   // Return type explicite sur onSubmit
    const onSubmit = async (data: EditSectionFormValues): Promise<void> => {
      if (!id) {
        setError("ID manquant")
        return
      }

      await update(id, data)
      onSuccess()
    }
  
    // Affichage de l'erreur si ID manquant ou chargement échoué
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4">

              <FieldGroup>
                <Field>
                  <FloatingInput
                    label="Nom"
                    {...register("name", { required: "Le nom est requis" })}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </Field>

                <Field>
                  <Textarea
                    
                    {...register("description")}
                  />
                </Field>
              </FieldGroup>
              <div className="grid grid-cols-2 gap-2">
                  <Field>
                  <Button
                  type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                 >
                    Annuler
                  </Button>
                </Field>
                
               <Field>
                {/*Désactivé pendant la soumission */}
                <ButtonMain actioname="main" type="submit" disabled={isSubmitting} label={isSubmitting ? "Enregistrement..." : "Enregistrer"} />
              </Field>
            </div>
            </div>
          </form>
          </div>
  )
}

export default EditSection