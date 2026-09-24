import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../index.css";

function Login() {
  const navigate = useNavigate();
  const {
    login,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Si une session valide existe déjà,
  // rediriger directement vers le dashboard.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(email.trim(), password);

      console.log("Utilisateur connecté :", user);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Erreur de connexion :", err);

      if (err.response?.status === 401) {
        setError("Email ou mot de passe incorrect.");
      } else if (!err.response) {
        setError(
          "Impossible de joindre le serveur. Vérifiez que Django est démarré."
        );
      } else {
        setError("Une erreur est survenue. Réessayez.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Pendant la vérification de la session
  if (authLoading) {
    return <div className="login-page" aria-hidden="true" />;
  }

  return (
    <main className="login-page">
      {/* ==============================
          BRANDING EN HAUT DE LA PAGE
          ============================== */}
      <header className="login-header">
        <div className="login-logo">
          <div className="login-logo-mark" aria-hidden="true">
            B
          </div>

          <div className="login-logo-text">
            <p className="login-logo-name">Boussaksou</p>
            <p className="login-logo-role">Construction</p>
          </div>
        </div>
      </header>

      {/* ==============================
          CONTENU PRINCIPAL
          ============================== */}
      <section className="login-content">
        <div className="login-card">
          <div className="login-card-header">
            <p className="login-eyebrow">BTP Plateforme</p>

            <h1>Connexion</h1>

            <p className="login-subtitle">
              Accédez au suivi de vos chantiers, achats et équipes.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* EMAIL */}
            <div className="form-group">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nom@boussaksou.ma"
                autoComplete="username"
                required
              />
            </div>

            {/* MOT DE PASSE */}
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>

              <div className="password-field">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            {/* MESSAGE D'ERREUR */}
            {error && (
              <p
                className="login-error"
                role="alert"
                aria-live="polite"
              >
                {error}
              </p>
            )}

            {/* BOUTON */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      </section>

      {/* ==============================
          FOOTER
          ============================== */}
      <footer className="login-footer">
        <p>© 2026 Boussaksou Construction</p>
      </footer>
    </main>
  );
}

export default Login;