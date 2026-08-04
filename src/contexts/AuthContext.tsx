import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id:       string;
  publicId: string;
  name:     string;
  email:    string;
  avatar:   string;
  isActive: boolean;
  role:     string;
  status:   string;
}

interface AuthContextType {
  user:     User | null;
  loading:  boolean;
  login:    (email: string, password: string) => Promise<void>;
  logout:   () => Promise<void>;
  setUser:  (user: User | null) => void; // utile pour updateMe
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // true le temps de vérifier la session

  //  Vérifie la session au montage — le cookie est envoyé automatiquement
  useEffect(() => {
  let cancelled = false; // ✅ évite les setState sur composant démonté

  api.get<User>("/auth/me")
    .then(({ data }) => {
      if (!cancelled) setUser(data);
    })
    .catch((err) => {
      if (!cancelled) {
        // ✅ Ne redirige PAS ici — laisse PrivateRoute gérer
        setUser(null);
        // Log uniquement si ce n'est pas un 401 normal
        if (err.response?.status !== 401) {
          console.error("Erreur auth/me:", err.message);
        }
      }
    })
    .finally(() => {
      if (!cancelled) setLoading(false);
    });

  return () => { cancelled = true; };
}, []);

  //  Login — reçoit les infos user depuis le serveur (plus de jwtDecode)
  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ user: User }>("/auth/login", {
      email,
      password,
    });
    setUser(data.user);
  }, []);

  // ✅ Logout — efface le cookie côté serveur
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Continue même si le serveur ne répond pas
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }
  return context;
}