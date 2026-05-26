import api from "@/lib/api" 
import { useEffect} from "react"
import type {CreateUserData} from "@/datatypes"
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FloatingInput } from "@/components/floating-input"
//import { Button } from "@/components/ui/button"
import  ButtonMain  from "@/components/button-main"
import { FloatingSelect } from "@/components/floating-select";
import {
  Field,
   FieldGroup,
} from "@/components/ui/field"
//import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"

type optionsRoles = {
  value: string;
  label: string;
}

function EditUser({id, onSuccess}: {id: string; onSuccess: () => void}) {

   const {
        register,
        handleSubmit,
        reset,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setValue,
        formState: { isSubmitting}, 
      } = useForm<CreateUserData>()
  const optionsRoles: optionsRoles[] = [
    { value: "admin", label: "Administrateur" },
    { value: "user", label: "Utilisateur" }
  ];
   const navigate = useNavigate();

  
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
    return <div>Utilisateur non trouvé</div>
  }
      try {
        const response = await api.get(`/auth/users/${id}`)
        const userData = response.data
        reset({ 
          name: userData.name,
          email: userData.email,
          role: userData.role,
          avatar: userData.avatar
        })
      } catch (error) {
        toast.error("Erreur lors du chargement de l'utilisateur")
        console.error("Fetch user error:", error)
      }
    }
    fetchUser()
  }, [id, reset])

    const onSubmit = async (data: CreateUserData) => {
      try {
        await api.put(`/auth/users/${id}`, data)
        toast.success("Utilisateur mis à jour avec succès")
        onSuccess()
        navigate("/dashboard/users")
      } catch (error) {
        toast.error("Erreur lors de la mise à jour de l'utilisateur")
        console.error("Update user error:", error)
      }
    }
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          <Field>
            <label htmlFor="name">Nom</label>
            <FloatingInput  label="Nom" id="name" {...register("name")} />
          </Field>
          <Field>
            <label htmlFor="email">Email</label>
            <FloatingInput  label="Email" id="email" {...register("email")} />
          </Field>
          <Field>
            <label htmlFor="role">Rôle</label>
            <FloatingSelect
            label="Rôle" id="role" required options={optionsRoles} {...register("role")} />
  
          </Field>
        </FieldGroup>
        <div className="flex justify-end">
           <ButtonMain actioname="main" disabled={isSubmitting} label="Mettre à jour" type="submit" ></ButtonMain>

        </div>
      </form>

    </div>
  )
}

export default EditUser