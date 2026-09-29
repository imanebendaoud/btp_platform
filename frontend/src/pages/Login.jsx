import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Connexion au backend
      const user = await login(email, password);

      console.log("Utilisateur connecté :", user);

      // Redirection selon le rôle
      switch (user.role) {
        case "ADMINISTRATEUR":
          navigate("/admin/dashboard");
          break;

        case "CHEF_CHANTIER":
          navigate("/chef/dashboard");
          break;

        case "RESPONSABLE_FINANCIER":
          navigate("/finance/dashboard");
          break;

        case "RESPONSABLE_MAINTENANCE":
          navigate("/maintenance/dashboard");
          break;

        case "RESPONSABLE_RH":
          navigate("/rh/dashboard");
          break;

        default:
          setError("Rôle utilisateur inconnu.");
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);

      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.data) {
        setError(JSON.stringify(error.response.data));
      } else {
        setError("Impossible de se connecter au serveur.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#eef1f4",
      }}
    >
      <div
        style={{
          width: "400px",
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <h1>Connexion</h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label>Mot de passe</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                color: "#b42318",
                background: "#fef3f2",
                padding: "10px",
                marginBottom: "15px",
                borderRadius: "6px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;