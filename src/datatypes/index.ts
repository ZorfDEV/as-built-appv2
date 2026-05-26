// type User
export type User = {
  _id: string
  name: string  
  email: string
  role: string
  status: string
  createdAt: Date | string
  updatedAt: Date | string
  avatar: string
}
// type de création d'un utilisateur
export type CreateUserData = {
  name: string
  email: string
  password: string
  avatar: string
  role: string
}


// type Point
export type Point = {
  _id: string
  name: string
  longitude: number
  latitude: number
  description: string
  nature: string
  status: string
  createdAt: Date
  updatedAt: Date
   marqueur_id: marqueur  
  section_id:  Section
  user_id : string
  distance?: number
}

// type Section
export type Section = {
  _id: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
  user_id: User
}

export type CreatedSectionData = {
  name: string
  description: string
  user_id: string
}

// type marqueur
export type marqueur = {
  _id: string
  name: string
  file: string
  description: string
  createdAt: Date
  updatedAt: Date
}
export type CreateMarqueurData = {
  name: string
  file: string
  description: string
}

// type de creation d'un point
export type CreatePointData = {
  name: string
  longitude: number | null
  latitude: number | null
  description: string
  nature: string
  section_id: string
  marqueur_id: string
  user_id: string
  status: string
}

export type ColumnPointData = {
  name: string
  longitude: number
  latitude: number
 // description: string
  nature: string
  section_id: string
  marqueur_id: string
  status: string
  createdAt: Date
}