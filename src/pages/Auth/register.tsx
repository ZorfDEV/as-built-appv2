import api from "@/lib/api" 
import { useState } from "react"
import type {CreateUserData} from "@/datatypes"
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FloatingInput } from "@/components/floating-input"
import  ButtonMain  from "@/components/button-main"
import { FloatingSelect } from "@/components/floating-select";
import {
  Field,
  FieldGroup,
} from "@/components/ui/field"
import { User, Mail, KeyRound, UserKey, Shield } from "lucide-react"; 
import { Button } from "@/components/ui/button";

type optionsRoles = {
  value: string;
  label: string;
}
type optionsStatus = {
  value: string;
  label: string;
}

function Register({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    avatar: "",
    role: "",
    status: "inactive", 
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (field: string) => (value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!formData.name || !formData.email || !formData.password || !formData.role) {
    toast.error("Veuillez remplir tous les champs obligatoires");
    return;
  }
  try {
    await api.post("/auth/register", {
      name:     formData.name,
      email:    formData.email,
      password: formData.password,
      role:     formData.role,
      status:   formData.status,
    });

    toast.success("Inscription réussie");
    onSuccess();
    window.location.reload();
  } catch (error) {
    toast.error("Erreur lors de l'inscription");
    console.error("Error during registration:", error);
  }
};

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldGroup>
          <Field>
            <FloatingInput
              label="Nom"
              name="name"
              value={formData.name}
              onChange={handleChange}
              labelclassName="peer-focus:bg-white dark:peer-focus:text-emerald-400 dark:peer-focus:bg-background/80"
              icon={<User className="h-4 w-4 text-emerald-400" />} 
            />
          </Field>
          <Field>
            <FloatingInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              labelclassName="peer-focus:bg-white dark:peer-focus:text-emerald-400 dark:peer-focus:bg-background/80"
              icon={<Mail className="h-4 w-4 text-emerald-400" />} 
            />
          </Field>
          <Field>
            <FloatingInput
              label="Mot de passe"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              labelclassName="peer-focus:bg-white dark:peer-focus:text-emerald-400 dark:peer-focus:bg-background/80"
              icon={<KeyRound className="h-4 w-4 text-emerald-400" />} 
            />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FloatingSelect 
              label="Rôle" 
              id="role" 
              name="role" 
              required 
              options={optionsRoles} 
              onValueChange={handleSelectChange('role')}  
              icon={<UserKey className="h-4 w-4 text-emerald-400" />}  
            />
          </Field>

          <Field>
            <FloatingSelect 
              label="Statut" 
              id="status" 
              name="status" 
              required 
              options={optionsStatus} 
              onValueChange={handleSelectChange('status')}  
              icon={<Shield className="h-4 w-4 text-emerald-400" />}  
            />
          </Field>
        </FieldGroup>
         <div className="grid grid-cols-2 gap-2">
          <Field>
          <Button variant="outline" onClick={() => navigate(-1)} className='w-auto' >
            Annuler
            </Button>
             </Field>
          <ButtonMain actioname="main" label="S'inscrire" type="submit" />
        </div>
      </form>
    </div>
  )
}

export default Register