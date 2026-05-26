import {useState } from "react"
import { useForm } from "react-hook-form"
import { FloatingInput } from "@/components/floating-input"
import { Button } from "@/components/ui/button"
import ButtonMain  from "@/components/button-main"
import { Field, FieldGroup } from "@/components/ui/field"
import type { CreatedSectionData } from "@/datatypes"
import { createSection  } from "@/interfaces/sectionService"
import { useAuth } from '../../contexts/AuthContext';
import { Textarea } from "@/components/ui/textarea"
import { useNavigate} from "react-router-dom"
import { toast } from "sonner"

function AddSection({ onSuccess }: { onSuccess: () => void }) {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { register } = useForm<CreatedSectionData>()
  const { user } = useAuth()


  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

  const formData = new FormData(e.currentTarget)
      const data: CreatedSectionData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        user_id: user?.id || "",
      }
    try {
      await createSection(data)
      onSuccess()
    } catch (err) {
      console.error(err)
      setError("Erreur lors de la création de la section")
      toast.error("Erreur lors de la création de la section")
    }
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmitForm} className="space-y-4">
        <FieldGroup>
          <Field >
            <FloatingInput
             label="Nom de la section"
              {...register("name", { required: "Le nom est requis" })}
              
            />
          </Field>
        </FieldGroup>
        <FieldGroup>
          <Field >
            <Textarea
              {...register("description", { required: "La description est requise" })}
              placeholder="Description de la section"
            />
          </Field>
        </FieldGroup>
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => navigate(-1)} >
          Annuler
        </Button>
        <ButtonMain actioname="main" label="Créer la section" type="submit" />
        </div>
      </form>
    </div>
  )
}

export default AddSection