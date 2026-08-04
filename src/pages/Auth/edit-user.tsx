import api from "@/lib/api" 
import { useEffect} from "react"
import type {UpdateUserData} from "@/datatypes"
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
import { UserRoundCog,Mail,KeyRound,UserKey, Shield  } from "lucide-react";
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button";

type optionsRoles = {
  value: string;
  label: string;
}

type optionsStatus = {
  value: string;
  label: string;
}

function EditUser({id, onSuccess}: {id: string; onSuccess: () => void}) {

   const {
        register,
        handleSubmit,
        reset,
         control,   
        formState: { isSubmitting}, 
      } = useForm<UpdateUserData>()

  const optionsRoles: optionsRoles[] = [
    { value: "admin", label: "Administrateur" },
    { value: "user", label: "Utilisateur" }
  ];
  const optionsStatus: optionsStatus[] = [
    { value: "actived", label: "Actif" },
    { value: "inactive", label: "Inactif" },
    { value: "pending", label: "pending" }
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
          status: userData.status
        })
      } catch (error) {
        toast.error("Erreur lors du chargement de l'utilisateur")
        console.error("Fetch user error:", error)
      }
    }
    fetchUser()
  }, [id, reset])

    const onSubmit = async (data: UpdateUserData) => {
      try {
        await api.put(`/auth/users/${id}`, data)
        toast.success("Utilisateur mis à jour avec succès")
        onSuccess()
        //navigate("/dashboard/users")
        window.location.reload()
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
            <FloatingInput  label="Nom" id="name" {...register("name")} 
            labelclassName="peer-focus:bg-white  dark:peer-focus:text-emerald-400 dark:peer-focus:bg-background/80 "
              icon={<UserRoundCog  className="h-4 w-4 text-emerald-400" />} 
            />
          </Field>
          <Field>
            <FloatingInput  label="Email" id="email" {...register("email")} labelclassName="peer-focus:bg-white  dark:peer-focus:text-emerald-400 dark:peer-focus:bg-background/80 "
              icon={<Mail  className="h-4 w-4 text-emerald-400" />}  />
          </Field>
          <Field>
            <FloatingInput
              label="Mot de passe"
              type="password"
              {...register("password")}
               labelclassName="peer-focus:bg-white  dark:peer-focus:text-emerald-400 dark:peer-focus:bg-background/80 "
              icon={<KeyRound  className="h-4 w-4 text-emerald-400" />} 
            />
          </Field>
          <Field>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FloatingSelect
                  label="Rôle"
                  id="role"
                  required
                  options={optionsRoles}
                  icon={<UserKey className="h-4 w-4 text-emerald-400" />}
                  onValueChange={field.onChange} 
                  defaultValue={field.value} name={""}                />
              )}
            />
          </Field>
          <Field>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FloatingSelect
                  label="Statut"
                  id="status"
                  required
                  options={optionsStatus}
                  icon={<Shield className="h-4 w-4 text-emerald-400" />}
                  onValueChange={field.onChange} 
                  defaultValue={field.value} name={""}                />
              )}
            />
          </Field>

        </FieldGroup>
       <div className="grid grid-cols-2 gap-2">
          <Field>
          <Button variant="outline" onClick={() => navigate(-1)} className='w-auto' >
            Annuler
            </Button>
             </Field>
           <ButtonMain actioname="main" disabled={isSubmitting} label="Mettre à jour" type="submit" ></ButtonMain>

        </div>
      </form>

    </div>
  )
}

export default EditUser