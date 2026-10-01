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
    <>
      {/* =====================================================
          STYLES — fusionnés dans le même fichier que le JSX
      ===================================================== */}
      <style>{`
        .login-page * {
          box-sizing: border-box;
        }

        html, body {
          margin: 0;
          padding: 0;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
          padding: 24px;
          background: #eef1f4;
          color: #1c2420;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .login-header {
          display: flex;
          justify-content: center;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .login-logo-icon {
          width: 42px;
          height: 42px;
          border-radius: 6px;
          background: #1c2420;
          color: #e08a2c;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .login-logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .login-logo-text span {
          color: #1c2420;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        .login-logo-text small {
          color: #6b6a63;
          font-size: 11px;
          margin-top: 4px;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 38px 36px 36px;
          background: #ffffff;
          border: 1px solid #d8d5c9;
          border-radius: 8px;
          border-top: 4px solid #e08a2c;
          box-shadow: 0 6px 24px rgba(28, 36, 32, 0.08);
        }

        .login-eyebrow {
          margin: 0 0 10px;
          color: #e08a2c;
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }

        .login-card h1 {
          margin: 0 0 7px;
          color: #1c2420;
          font-size: 26px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          margin: 0 0 28px;
          color: #6b6a63;
          font-size: 13px;
          line-height: 1.55;
        }

        .form-group {
          margin-bottom: 19px;
        }

        .form-group label {
          display: block;
          margin-bottom: 7px;
          color: #3a392f;
          font-size: 13px;
          font-weight: 600;
        }

        .form-group input {
          width: 100%;
          padding: 11px 13px;
          border: 1.5px solid #d8d5c9;
          border-radius: 6px;
          background: #ffffff;
          color: #1c2420;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .form-group input:hover {
          border-color: #aaa99f;
        }

        .form-group input:focus {
          border-color: #e08a2c;
          box-shadow: 0 0 0 3px rgba(224, 138, 44, 0.15);
        }

        .form-group input::placeholder {
          color: #aaa99f;
        }

        .login-error {
          margin: -3px 0 18px;
          padding: 10px 12px;
          border-left: 3px solid #b8452f;
          border-radius: 4px;
          background: rgba(184, 69, 47, 0.08);
          color: #a63e2c;
          font-size: 13px;
          line-height: 1.45;
        }

        .login-submit {
          width: 100%;
          padding: 12px 14px;
          border: none;
          border-radius: 6px;
          background: #1c2420;
          color: #f4f2ec;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .login-submit:hover:not(:disabled) {
          background: #2c352f;
        }

        .login-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-submit:focus-visible {
          outline: 2px solid #e08a2c;
          outline-offset: 3px;
        }

        .login-footer {
          margin: 0;
          color: #77786f;
          font-size: 11.5px;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 32px 24px 28px;
          }
        }
      `}</style>

      <div className="login-page">

        {/* BRANDING */}
        <div className="login-header">
          <div className="login-logo">
            <div className="login-logo-icon">B</div>

            <div className="login-logo-text">
              <span>Boussaksou</span>
              <small>Construction</small>
            </div>
          </div>
        </div>

        {/* CARTE DE CONNEXION */}
        <div className="login-card">

          <p className="login-eyebrow">BTP Plateforme</p>
          <h1>Connexion</h1>
          <p className="login-subtitle">
            Accédez au suivi de vos chantiers, achats et équipes.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@boussaksou.ma"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </button>

          </form>
        </div>

        <p className="login-footer">© 2026 Boussaksou Construction</p>

      </div>
    </>
  );
}

export default Login;