import axios from "axios"

const api = axios.create({
  baseURL: "/api",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")

  if (token) {
    config.headers = config.headers ?? {} // 🔥 FIX CRITIQUE
    config.headers.Authorization = `Bearer ${token}`

    // debug safe
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      console.log("JWT payload:", payload)
    } catch {
      console.warn("Token invalide")
    }
  }

  return config
})

export default api