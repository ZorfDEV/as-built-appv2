import { cn } from "@/lib/utils"
import  ButtonMain  from "@/components/button-main"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GalleryVerticalEnd,Mail } from "lucide-react"
import { FloatingInput } from "./floating-input"
import { toast } from "sonner";



const validationSchema = yup.object({
  email: yup.string().required('Requis'),
  password: yup.string().required('Requis')
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

   const { login } = useAuth();
   
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const res = await axios.post('/api/auth/login', values);
        login(res.data.token);
        navigate('/dashboard');
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        if (axiosError.response?.data?.message) {
          toast.error(axiosError.response.data.message);
          setErrors({ password: axiosError.response.data.message });
          console.error(error);
        }
        else if (axiosError.response?.status === 401) {
          toast.error('Identifiants incorrects');
          setErrors({ password: 'Identifiants incorrects' });
        }
        else {
          toast.error('Une erreur est survenue, veuillez réessayer plus tard');
          setErrors({ password: 'Une erreur est survenue' });
        }
      } finally {
        setSubmitting(false);
      }
    }
  });
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-white/10 backdrop-blur-md border-white/20  shadow-2xl">
        <CardHeader className="text-center">
          < CardTitle className="flex items-center justify-center " >
          <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          As-built.
        </a>
        </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="grid w-full items-center gap-6">
            <FieldGroup>
              <Field>
                <FloatingInput
                  id="email"
                  type="email"
                  label="Email"
                  icon={<Mail size={18} className="text-white/70"/>}
                  required
                   value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    labelclassName="text-white/70  peer-focus:bg-axgreen-1 peer-focus:border-axgreen-1/10 peer-focus:rounded-2xl focus:text-white/20 peer-focus:text-axblue-2  border-white/20  peer-not-placeholder-shown:bg-white peer-not-placehoder-shown:backdrop-blur-md peer-not-placeholder-shown:border-white/20 peer-not-placeholder-shown:rounded-2xl
                     peer-not-placeholder-shown:text-axblue-1"
                     />
              </Field>
              <Field>
                <FloatingInput
                  id="password"
                  type="password"
                  label="Mot de passe"
                  required
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="text-axblue-1"
                  labelclassName="text-white/70 peer-focus:bg-axgreen-1 peer-focus:border-axgreen-1/10 peer-focus:rounded-2xl focus:text-white peer-focus:text-axblue-2
                   border-white/20  peer-not-placeholder-shown:bg-white peer-not-placehoder-shown:backdrop-blur-md peer-not-placeholder-shown:border-white/20 peer-not-placeholder-shown:rounded-2xl peer-not-placeholder-shown:text-axblue-1"
                   error={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
                />
              </Field>
              <Field>
                <ButtonMain 
                disabled={formik.isSubmitting} label="Se connecter" actioname="main" type="submit" >
                <div className="flex items-center -space-x-3 translate-x-3">
            <div className="w-2.5 h-[1.6px] rounded bg-axgreen-1 origin-left scale-x-0 transition duration-300 group-hover:scale-x-100"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 font-bold -translate-x-2 transition duration-300 group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
                </ButtonMain>
              </Field>
              <div className=" flex items-center justify-center">
              <FieldDescription className="text-center text-white/70">
                  <a href="#">Mot de passe oublié ?</a>
                </FieldDescription>
              </div>
              
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
       <span className="text-xs text-gray-500">© {new Date().getFullYear()} As‑Built — Tous droits réservés</span>.
      </FieldDescription>
    </div>
  )
}
