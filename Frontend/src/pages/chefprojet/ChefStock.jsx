
import { useCallback, useEffect, useMemo, useState } from "react";
import "./ChefStock.css";

const API_BASE = "http://127.0.0.1:8000/api";

function getAccessToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
}

async function apiRequest(path, options = {}) {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Votre session a expiré. Veuillez vous reconnecter.");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Erreur HTTP ${response.status}.`;

    try {
      const data = await response.json();
      message =
        data.detail ||
        Object.entries(data)
          .map(([key, value]) => {
            const text = Array.isArray(value)
              ? value.join(", ")
              : typeof value === "string"
                ? value
                : JSON.stringify(value);

            return `${key}: ${text}`;
          })
          .join(" | ") ||
        message;
    } catch {
      // Garder le message HTTP si la réponse n'est pas du JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function getStockStatus(material) {
  const stock = Number(material.stock_actuel);
  const minimum = Number(material.stock_minimum);

  if (!Number.isFinite(stock) || !Number.isFinite(minimum)) {
    return { label: "Indisponible", className: "stock-status-unknown" };
  }

  if (stock <= minimum) {
    return { label: "Stock faible", className: "stock-status-low" };
  }

  return { label: "Disponible", className: "stock-status-ok" };
}

function getProjectName(request) {
  return request.nom_projet || request.id_projet_nom ||
    (typeof request.id_projet === "object"
      ? request.id_projet?.nom
      : `Chantier #${request.id_projet}`);
}

function getMaterialName(request, materials) {
  if (request.nom_materiau) return request.nom_materiau;

  if (typeof request.id_materiau === "object") {
    return request.id_materiau?.nom || "Matériau";
  }

  const material = materials.find(
    (item) => String(item.id_materiau) === String(request.id_materiau)
  );

  return material?.nom || `Matériau #${request.id_materiau}`;
}

function getStatusLabel(status) {
  const labels = {
    EN_ATTENTE: "En attente",
    ACCEPTEE: "Acceptée",
    REFUSEE: "Refusée",
    LIVREE: "Livrée",
  };

  return labels[status] || status || "Inconnu";
}

function getStatusClass(status) {
  const classes = {
    EN_ATTENTE: "request-status-pending",
    ACCEPTEE: "request-status-approved",
    REFUSEE: "request-status-rejected",
    LIVREE: "request-status-delivered",
  };

  return classes[status] || "request-status-unknown";
}

export default function ChefStock() {
  const [materiaux, setMateriaux] = useState([]);
  const [chantiers, setChantiers] = useState([]);
  const [demandes, setDemandes] = useState([]);

  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("TOUS");

  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  const [formVisible, setFormVisible] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [messageFormulaire, setMessageFormulaire] = useState("");
  const [erreurFormulaire, setErreurFormulaire] = useState("");

  const [form, setForm] = useState({
    id_projet: "",
    id_materiau: "",
    quantite: "",
    date_besoin: "",
    priorite: "NORMALE",
    motif: "",
  });

  const chargerDonnees = useCallback(async () => {
    setChargement(true);
    setErreur("");

    const results = await Promise.allSettled([
      apiRequest("/stock/materiaux/"),
      apiRequest("/projects/projets/"),
      apiRequest("/stock/demandes-materiaux/"),
    ]);

    const [stockResult, projectResult, requestResult] = results;

    if (stockResult.status === "fulfilled") {
      setMateriaux(extractList(stockResult.value));
    } else {
      setErreur(
        `Impossible de charger le stock : ${stockResult.reason.message}`
      );
    }

    if (projectResult.status === "fulfilled") {
      setChantiers(extractList(projectResult.value));
    } else {
      setErreur((previous) =>
        [
          previous,
          `Impossible de charger les chantiers : ${projectResult.reason.message}`,
        ]
          .filter(Boolean)
          .join(" ")
      );
    }

    if (requestResult.status === "fulfilled") {
      setDemandes(extractList(requestResult.value));
    } else {
      setErreur((previous) =>
        [
          previous,
          `Impossible de charger les demandes : ${requestResult.reason.message}`,
        ]
          .filter(Boolean)
          .join(" ")
      );
    }

    setChargement(false);
  }, []);

  useEffect(() => {
    chargerDonnees();
  }, [chargerDonnees]);

  const materiauxFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    return materiaux.filter((material) => {
      const matchesSearch =
        String(material.nom || "").toLowerCase().includes(terme) ||
        String(material.unite || "").toLowerCase().includes(terme) ||
        String(material.id_materiau || "").includes(terme);

      const status = getStockStatus(material);

      const matchesFilter =
        filtre === "TOUS" ||
        (filtre === "FAIBLE" && status.label === "Stock faible") ||
        (filtre === "DISPONIBLE" && status.label === "Disponible");

      return matchesSearch && matchesFilter;
    });
  }, [materiaux, recherche, filtre]);

  const nombreStockFaible = materiaux.filter(
    (material) => getStockStatus(material).label === "Stock faible"
  ).length;

  function modifierChamp(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function ouvrirFormulaire() {
    setErreurFormulaire("");
    setMessageFormulaire("");
    setForm({
      id_projet: "",
      id_materiau: "",
      quantite: "",
      date_besoin: "",
      priorite: "NORMALE",
      motif: "",
    });
    setFormVisible(true);
  }

  async function envoyerDemande(event) {
    event.preventDefault();
    setErreurFormulaire("");
    setMessageFormulaire("");

    const quantity = Number(form.quantite);

    if (!form.id_projet || !form.id_materiau) {
      setErreurFormulaire("Veuillez sélectionner un chantier et un matériau.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setErreurFormulaire("La quantité doit être supérieure à zéro.");
      return;
    }

    if (!form.date_besoin) {
      setErreurFormulaire("Veuillez choisir la date du besoin.");
      return;
    }

    setEnvoi(true);

    try {
      const payload = {
        id_projet: Number(form.id_projet),
        id_materiau: Number(form.id_materiau),
        quantite: quantity,
        date_besoin: form.date_besoin,
        priorite: form.priorite,
        motif: form.motif.trim(),
      };

      await apiRequest("/stock/demandes-materiaux/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setMessageFormulaire("Votre demande a été envoyée avec succès.");
      setForm({
        id_projet: "",
        id_materiau: "",
        quantite: "",
        date_besoin: "",
        priorite: "NORMALE",
        motif: "",
      });

      await chargerDonnees();
      setFormVisible(false);
    } catch (error) {
      setErreurFormulaire(error.message || "Échec de l'envoi de la demande.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="chef-stock-page">
      <div className="chef-stock-header">
        <div>
          <p className="chef-stock-eyebrow">GESTION DU CHANTIER</p>
          <h1>Stock des matériaux</h1>
          <p className="chef-stock-description">
            Consultez le stock et demandez les matériaux nécessaires à vos chantiers.
          </p>
        </div>

        <div className="chef-stock-header-actions">
          <button
            type="button"
            className="chef-stock-refresh"
            onClick={chargerDonnees}
            disabled={chargement}
          >
            ↻ Actualiser
          </button>

          <button
            type="button"
            className="chef-stock-primary"
            onClick={ouvrirFormulaire}
          >
            + Demander un matériau
          </button>
        </div>
      </div>

      {erreur && (
        <div className="chef-stock-error" role="alert">
          <p>{erreur}</p>
          <button type="button" onClick={chargerDonnees}>
            Réessayer
          </button>
        </div>
      )}

      {messageFormulaire && (
        <div className="chef-stock-success" role="status">
          {messageFormulaire}
        </div>
      )}

      <div className="chef-stock-summary">
        <div className="chef-stock-card">
          <span className="chef-stock-card-label">Types de matériaux</span>
          <strong>{materiaux.length}</strong>
        </div>

        <div className="chef-stock-card chef-stock-card-warning">
          <span className="chef-stock-card-label">Stocks faibles</span>
          <strong>{nombreStockFaible}</strong>
        </div>

        <div className="chef-stock-card">
          <span className="chef-stock-card-label">Mes demandes</span>
          <strong>{demandes.length}</strong>
        </div>
      </div>

      {formVisible && (
        <div className="chef-stock-modal-backdrop">
          <section
            className="chef-stock-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="demande-materiau-title"
          >
            <div className="chef-stock-modal-header">
              <div>
                <h2 id="demande-materiau-title">Nouvelle demande</h2>
                <p>Renseignez les matériaux dont votre chantier a besoin.</p>
              </div>

              <button
                type="button"
                className="chef-stock-close"
                onClick={() => setFormVisible(false)}
                aria-label="Fermer le formulaire"
                disabled={envoi}
              >
                ×
              </button>
            </div>

            <form onSubmit={envoyerDemande}>
              <div className="chef-stock-form-group">
                <label htmlFor="demande-projet">Chantier *</label>
                <select
                  id="demande-projet"
                  name="id_projet"
                  value={form.id_projet}
                  onChange={modifierChamp}
                  required
                >
                  <option value="">Sélectionner un chantier</option>
                  {chantiers.map((projet) => (
                    <option key={projet.id_projet} value={projet.id_projet}>
                      {projet.nom || projet.numero_projet ||
                        `Chantier #${projet.id_projet}`}
                    </option>
                  ))}
                </select>
                {chantiers.length === 0 && (
                  <small>Aucun chantier disponible dans l'API.</small>
                )}
              </div>

              <div className="chef-stock-form-group">
                <label htmlFor="demande-materiau">Matériau *</label>
                <select
                  id="demande-materiau"
                  name="id_materiau"
                  value={form.id_materiau}
                  onChange={modifierChamp}
                  required
                >
                  <option value="">Sélectionner un matériau</option>
                  {materiaux.map((material) => (
                    <option
                      key={material.id_materiau}
                      value={material.id_materiau}
                    >
                      {material.nom} — Stock : {material.stock_actuel}{" "}
                      {material.unite}
                    </option>
                  ))}
                </select>
              </div>

              <div className="chef-stock-form-row">
                <div className="chef-stock-form-group">
                  <label htmlFor="demande-quantite">Quantité *</label>
                  <input
                    id="demande-quantite"
                    type="number"
                    name="quantite"
                    min="0.001"
                    step="0.001"
                    value={form.quantite}
                    onChange={modifierChamp}
                    placeholder="Ex. 10"
                    required
                  />
                </div>

                <div className="chef-stock-form-group">
                  <label htmlFor="demande-date">Date du besoin *</label>
                  <input
                    id="demande-date"
                    type="date"
                    name="date_besoin"
                    min={new Date().toLocaleDateString("en-CA")}
                    value={form.date_besoin}
                    onChange={modifierChamp}
                    required
                  />
                </div>
              </div>

              <div className="chef-stock-form-group">
                <label>Priorité *</label>
                <div className="chef-stock-priority-options">
                  <label className="chef-stock-radio-label">
                    <input
                      type="radio"
                      name="priorite"
                      value="NORMALE"
                      checked={form.priorite === "NORMALE"}
                      onChange={modifierChamp}
                    />
                    Normale
                  </label>

                  <label className="chef-stock-radio-label">
                    <input
                      type="radio"
                      name="priorite"
                      value="URGENTE"
                      checked={form.priorite === "URGENTE"}
                      onChange={modifierChamp}
                    />
                    Urgente
                  </label>
                </div>
              </div>

              <div className="chef-stock-form-group">
                <label htmlFor="demande-motif">Motif de la demande</label>
                <textarea
                  id="demande-motif"
                  name="motif"
                  value={form.motif}
                  onChange={modifierChamp}
                  rows="3"
                  placeholder="Précisez l'utilisation prévue..."
                />
              </div>

              {erreurFormulaire && (
                <div className="chef-stock-error" role="alert">
                  {erreurFormulaire}
                </div>
              )}

              <div className="chef-stock-form-actions">
                <button
                  type="button"
                  className="chef-stock-cancel"
                  onClick={() => setFormVisible(false)}
                  disabled={envoi}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="chef-stock-primary"
                  disabled={envoi || materiaux.length === 0 || chantiers.length === 0}
                >
                  {envoi ? "Envoi en cours..." : "Envoyer la demande"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <section className="chef-stock-section">
        <div className="chef-stock-section-heading">
          <h2>Stock disponible</h2>
          <span>{materiaux.length} matériau(x)</span>
        </div>

        <div className="chef-stock-toolbar">
          <input
            type="search"
            value={recherche}
            onChange={(event) => setRecherche(event.target.value)}
            placeholder="Rechercher un matériau..."
            aria-label="Rechercher un matériau"
          />

          <select
            value={filtre}
            onChange={(event) => setFiltre(event.target.value)}
            aria-label="Filtrer les matériaux"
          >
            <option value="TOUS">Tous les matériaux</option>
            <option value="FAIBLE">Stock faible</option>
            <option value="DISPONIBLE">Stock disponible</option>
          </select>
        </div>

        <div className="chef-stock-table-container">
          <table className="chef-stock-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Matériau</th>
                <th>Unité</th>
                <th>Stock actuel</th>
                <th>Stock minimum</th>
                <th>État du stock</th>
              </tr>
            </thead>

            <tbody>
              {chargement && materiaux.length === 0 ? (
                <tr>
                  <td colSpan="6" className="chef-stock-empty">
                    Chargement des données...
                  </td>
                </tr>
              ) : materiauxFiltres.length === 0 ? (
                <tr>
                  <td colSpan="6" className="chef-stock-empty">
                    Aucun matériau trouvé.
                  </td>
                </tr>
              ) : (
                materiauxFiltres.map((material) => {
                  const stockStatus = getStockStatus(material);

                  return (
                    <tr key={material.id_materiau}>
                      <td>MAT-{material.id_materiau}</td>
                      <td className="chef-stock-material-name">{material.nom}</td>
                      <td>{material.unite}</td>
                      <td>{material.stock_actuel}</td>
                      <td>{material.stock_minimum}</td>
                      <td>
                        <span
                          className={`chef-stock-status ${stockStatus.className}`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="chef-stock-section">
        <div className="chef-stock-section-heading">
          <h2>Historique de mes demandes</h2>
          <span>{demandes.length} demande(s)</span>
        </div>

        <div className="chef-stock-table-container">
          <table className="chef-stock-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Chantier</th>
                <th>Matériau</th>
                <th>Quantité</th>
                <th>Date du besoin</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Commentaire</th>
              </tr>
            </thead>

            <tbody>
              {demandes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="chef-stock-empty">
                    {chargement
                      ? "Chargement des demandes..."
                      : "Vous n'avez pas encore de demande."}
                  </td>
                </tr>
              ) : (
                [...demandes]
                  .sort(
                    (a, b) =>
                      new Date(b.date_creation || 0) -
                      new Date(a.date_creation || 0)
                  )
                  .map((request) => (
                    <tr key={request.id_demande}>
                      <td>DEM-{request.id_demande}</td>
                      <td>{getProjectName(request)}</td>
                      <td>{getMaterialName(request, materiaux)}</td>
                      <td>{request.quantite}</td>
                      <td>{request.date_besoin}</td>
                      <td>
                        <span
                          className={`chef-stock-status ${
                            request.priorite === "URGENTE"
                              ? "request-priority-urgent"
                              : "request-priority-normal"
                          }`}
                        >
                          {request.priorite === "URGENTE"
                            ? "Urgente"
                            : "Normale"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`chef-stock-status ${getStatusClass(
                            request.statut
                          )}`}
                        >
                          {getStatusLabel(request.statut)}
                        </span>
                      </td>
                      <td>{request.commentaire_decision || "—"}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}



