import { useLocalStorage } from "./use-local-storage";
import { useLocation } from "wouter";

export function useAuth() {
  const [token, setToken] = useLocalStorage<string | null>("examcore_admin_token", null);
  const [, setLocation] = useLocation();

  const login = (newToken: string) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setLocation("/admin/login");
  };

  return {
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };
}
