import { createContext, useContext, useEffect, useState } from "react";
import { loginRequest, verifyTokenRequest } from "../api/auth";
import axios from "../api/axios"; // той самий інстанс з withCredentials: true

const AuthContext = createContext();
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within a AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Автологін після F5: тільки через /auth/verify
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await verifyTokenRequest(); // GET /api/auth/verify
        if (alive && data) {
          setUser(data);
          setIsAuthenticated(true);
        }
      } catch {
        if (alive) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // автоочистка помилок
  useEffect(() => {
    if (!errors.length) return;
    const t = setTimeout(() => setErrors([]), 5000);
    return () => clearTimeout(t);
  }, [errors]);

  const signin = async (credentials) => {
    try {
      const res = await loginRequest(credentials); // POST /auth/login
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      setErrors(err?.response?.data?.message ?? ["Login failed"]);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post("/auth/logout"); // сервер гасить httpOnly cookie
    } catch {}
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, errors, signin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
