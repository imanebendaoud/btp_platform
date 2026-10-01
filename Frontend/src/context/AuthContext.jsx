import { createContext, useContext, useEffect, useState } from "react";
import { login as loginService, getMe } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getMe(accessToken);
        setUser(userData);
      } catch (error) {
        console.error("Session invalide :", error);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [accessToken]);

  const login = async (email, password) => {
    const data = await loginService(email, password);

    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);

    setAccessToken(data.access);

    const userData = await getMe(data.access);
    setUser(userData);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        logout,
        isAuthenticated: !!accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};