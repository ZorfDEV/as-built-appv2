import { useForm } from "react-hook-form"
import { createMarqueur } from "@/interfaces/marqueurServices"
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
//import type { CreateMarqueurData } from "@/datatypes"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useState } from "react"

type FormValues = {
  name: string
  description: string
  file: FileList // ✅ FileList pour input type="file"
}

function AddMarqueur({ onSuccess }: { onSuccess: () => void }) {

const { register, handleSubmit } = useForm<FormValues>()
const [error, setError] = useState<string | null>(null)
const navigate = useNavigate()

  const handleSubmitForm = async (data: FormValues): Promise<void> => {
    try {
    await createMarqueur({
      name: data.name,
      description: data.description,
      file: data.file[0],  // ✅ FileList → File
    })
   onSuccess()
   toast.success("Marqueur créé avec succès")
   navigate("/dashboard/marqueurs")
    } catch (err) {
      console.error(err)
      setError("Erreur lors de la création du marqueur")
      toast.error("Erreur lors de la création du marqueur")
    }
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
        <FieldGroup>
          <Field>
            <FloatingInput
              label="Nom"
              {...register("name", { required: "Le nom est requis" })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="picture">Image png/svg</FieldLabel>
            <Input id="picture" type="file" {...register("file", { required: "L'image est requise" })} />
            <FieldDescription>Select a picture to upload.</FieldDescription>
          </Field>
          <Field>
            <Textarea
              id="description"
              {...register("description", { required: "La description est requise" })}
            />
          </Field>
        </FieldGroup>
       {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}  >
          Annuler
        </Button>
        <ButtonMain actioname="main"  label="Valider" type="submit" />
        </div>
      </form>
    </div>
  )
}

export default AddMarqueur


