import {
  createContext,
  useContext,
  useEffect,
  useState,
 type ReactNode,
} from "react"
import { jwtDecode } from "jwt-decode"

///////////////////////////////////////////////////////////////
// Types

interface DecodedToken {
  avatar: string
  id: string
  email?: string
  name?: string
  exp: number
}

interface User {
  id: string
  email: string
  name: string
  avatar: string
}

interface AuthContextType {
  user: User 
  token: string | null
  login: (jwt: string) => void
  logout: () => void
}

///////////////////////////////////////////////////////////////
// Context

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
)

///////////////////////////////////////////////////////////////
// Provider

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  )

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token)

      if (!decoded?.exp || !decoded?.id) {
        throw new Error("Token structure invalide")
      }

      const expirationDate = new Date(decoded.exp * 1000)

      if (expirationDate < new Date()) {
        console.warn("Token expiré")
        logout()
        return
      }

      setUser({
        id: decoded.id,
        email: decoded.email ?? "",
        name: decoded.name ?? "",
        avatar:decoded.avatar || "",
      })

      localStorage.setItem("token", token)
    } catch (err) {
      console.error("Échec décodage token :", err)
      logout()
    }
  }, [token])

  const login = (jwt: string) => {
    setToken(jwt)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
  }

  return (
    <AuthContext.Provider
      value={{ user: user!, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

///////////////////////////////////////////////////////////////
// Hook

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}