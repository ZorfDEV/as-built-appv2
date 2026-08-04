import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FloatingInput } from "@/components/floating-input"
import { Button } from "@/components/ui/button"
import  ButtonMain  from "@/components/button-main"
import {
  Field,
  FieldDescription,
  FieldLabel,
   FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useNavigate} from "react-router-dom"
import type { CreateMarqueurData } from "@/datatypes"
import { fetchMarqueurById  } from "@/interfaces/marqueurServices"
import { useUpdateMarqueur } from "@/hooks/useUpdateMarqueur"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { extractFileName } from "@/lib/utils"
import { Flag } from "lucide-react"

function EditMarqueur({ id, onSuccess }: { id: string; onSuccess: () => void }) {
  const { update, loading } = useUpdateMarqueur()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [imageFileName, setImageFileName] = useState<string | null>(null)
 const { register, handleSubmit, reset } = useForm<CreateMarqueurData>()

  useEffect(() => {

    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("aucun marqueur trouvé")
      toast.error("aucun marqueur trouvé")
      return
    }
    const loadMarqueur = async () => {
      try {
        const data = await fetchMarqueurById(id)
        setImageFileName(extractFileName(data.file))
        reset({
          name: data.name,
          description: data.description,
          file: data.file, 
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue"
        setError(message)
        toast.error(message)
      }
    }

    loadMarqueur()
  }, [id, reset])

  const onSubmit = async (data: CreateMarqueurData) => {
    await update(id, data)
    onSuccess()
    window.location.reload();
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          <Field>
            <FloatingInput
               label="Nom"
              {...register("name")}
               labelclassName="peer-focus:bg-white  dark:peer-focus:text-emerald-400 dark:peer-focus:bg-background/80 "
              icon={<Flag  className="h-4 w-4 text-emerald-400" />}
            />
          </Field>
          <Field>
      <FieldLabel htmlFor="picture">Image png/svg</FieldLabel>
      <Input id="picture" type="file" {...register("file")} />
      <FieldDescription>{imageFileName || "Aucune image sélectionnée"}</FieldDescription>
    </Field>
          <Field>
            <Textarea
              id="description"
              {...register("description")}
            />
          </Field>
        </FieldGroup>
        <div className="grid grid-cols-2 gap-2">
                  <Field>
                  <Button variant="outline" onClick={() => navigate(-1)} className='w-auto' >
                  Annuler
                </Button>
                  </Field>
        <ButtonMain actioname="main"  disabled={loading} label="Modifier le Marqueur" type="submit" />  
       
        </div>
      </form>

    </div>
  )
}

export default EditMarqueur