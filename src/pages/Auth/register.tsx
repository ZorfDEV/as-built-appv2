import api from "@/lib/api" 
import { useState } from "react"
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
import { Input } from "@/components/ui/input"

type optionsRoles = {
  value: string;
  label: string;
}

function Register({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    avatar: "",
    role: ""
  });

  const optionsRoles: optionsRoles[] = [
    { value: "admin", label: "Administrateur" },
    { value: "user", label: "Utilisateur" }
  ];

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", formData);
      toast.success("Inscription réussie");
      onSuccess();
      navigate("/dashboard/users");
    } catch (error) {
      toast.error("Erreur lors de l'inscription");
      console.error("New users :",formData);
      console.error("Error during registration :", error);
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
            />
          </Field>
          <Field>
            <FloatingInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Field>
          <Field>
            <FloatingInput
              label="Mot de passe"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </Field>
        </FieldGroup>
          <FieldGroup>
        <Field>
            <Input id="picture" type="file" value="/upload/avatars/avatar.png" name="avatar" accept=".png,.svg"
              onChange={handleChange}  />
          </Field>
           <Field>
          <FloatingSelect label="Rôle" id="role" name="role" required options={optionsRoles} onValueChange={handleSelectChange} />
          </Field>
          </FieldGroup>
          <div className="flex justify-end">
          <ButtonMain actioname="main" label="S'inscrire" type="submit" />
          </div>
      </form>

    </div>
  )
}

export default Register