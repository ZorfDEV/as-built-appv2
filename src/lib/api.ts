import axios from "axios";

const api = axios.create({
  baseURL:"/api",
  withCredentials: true, 
});

// ─── Intercepteur de réponse ──────────────────────────────────────────────────
// Redirige vers /login si le serveur retourne 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Evite la boucle infinie sur la page de login elle-même
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;