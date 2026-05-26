import api from "@/lib/api" 
import {useState, useEffect} from "react"
import type {User} from "@/datatypes"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"
import { useNavigate, useParams } from "react-router-dom"
import userimage from "@/assets/img/user.jpeg"

export default function ProfilePage() {
const { id } = useParams<{ id: string }>();
const [userData, setUserData] = useState<User | null>(null);
const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
    return <div>Utilisateur non trouvé</div>
  } 
      try {
        const response = await api.get(`/auth/users/${id}`)
        setUserData(response.data)
      } catch (error) {
        console.error("Fetch user error:", error)
      }
    }
    fetchUser()
  }, [id])

  if (!userData) {
    return <div><Spinner /></div>
  } 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Background gradient */}
      <div className="absolute top-15 left-0 w-full h-1/2 bg-linear-to-r  from-blue-500 to-teal-400" />

      <Card className="relative w-105 rounded-2xl shadow-xl overflow-hidden">
        {/* Header gradient */}
        <div className="h-28 bg-linear-to-r from-blue-500 to-teal-400" />

        {/* Avatar */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2">
          <Avatar className="w-24 h-24 border-4 border-white shadow-md">
            <AvatarImage src={userimage} />
            <AvatarFallback>SJ</AvatarFallback>
          </Avatar>
        </div>

        <CardContent className="pt-16 pb-6 text-center">
          {/* Name */}
          <h2 className="text-xl font-semibold">{userData?.name}</h2>
          <p className="text-sm text-muted-foreground">@{userData?.role}</p>

          {/* Bio */}
          <p className="mt-3 text-sm text-gray-500 px-6">
           {userData?.email}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-6 text-center">
            <div>
              <p className="font-semibold text-lg">Date de création</p>
              <p className="text-xs text-gray-400">{userData?.createdAt instanceof Date ? userData.createdAt.toLocaleDateString() : userData?.createdAt}</p>
            </div>
          </div>

          {/* Button */}
          <Button onClick={()=> navigate(-1)} className="mt-6">
            Retour
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}