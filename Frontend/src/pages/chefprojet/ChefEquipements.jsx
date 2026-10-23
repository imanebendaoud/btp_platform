
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { getMyProjects } from "../../services/projectService";
import "./ChefEquipements.css";

/* =========================
   ICONES SVG
========================= */

const Icon = ({ name, size = 20 }) => {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    equipment: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V8l7-5 7 5v13" />
        <path d="M9 21v-7h6v7" />
        <path d="M9 9h.01M15 9h.01" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    tool: (
      <>
        <path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    alert: (
      <>
        <path d="m10.3 3.7-8 14A2 2 0 0 0 4 20.7h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4.5 9A8 8 0 0 1 18 5l2 2M4 17v-5h5" />
        <path d="M19.5 15A8 8 0 0 1 6 19l-2-2" />
      </>
    ),
    filter: (
      <>
        <path d="M4 5h16l-6.5 7.5v5l-3 1.5v-6.5z" />
      </>
    ),
    empty: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 9h8M8 13h5M8 17h3" />
      </>
    ),
  };

  return <svg {...props}>{paths[name] || paths.equipment}</svg>;
};

/* =========================
   OUTILS
========================= */

const getList = (response) => {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};

const getId = (value) => {
  if (value && typeof value === "object") {
    return (
      value.id_equipement ??
      value.id_projet ??
      value.id ??
      value.pk ??
      ""
    );
  }

  return value ?? "";
};

const getProjectId = (project) =>
  String(project?.id_projet ?? project?.id ?? "");

const getEquipmentId = (equipment) =>
  String(equipment?.id_equipement ?? equipment?.id ?? "");

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const formatDate = (value) => {
  if (!value) return "Non définie";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "Non définie";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isActiveAssignment = (assignment) => {
  if (!assignment?.date_fin) return true;

  const endDate = new Date(
    `${String(assignment.date_fin).slice(0, 10)}T00:00:00`
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return !Number.isNaN(endDate.getTime()) && endDate >= today;
};

const getAvailabilityClass = (value) => {
  const status = normalize(value);

  if (
    status.includes("indisponible") ||
    status.includes("hors service") ||
    status.includes("maintenance") ||
    status.includes("panne")
  ) {
    return "ce-status-danger";
  }

  if (
    status.includes("utilise") ||
    status.includes("affecte") ||
    status.includes("occupe")
  ) {
    return "ce-status-used";
  }

  if (
    status.includes("disponible") ||
    status.includes("libre")
  ) {
    return "ce-status-available";
  }

  return "ce-status-neutral";
};

const getStateClass = (value) => {
  const status = normalize(value);

  if (
    status.includes("mauvais") ||
    status.includes("panne") ||
    status.includes("hors service") ||
    status.includes("degrade")
  ) {
    return "ce-status-danger";
  }

  if (
    status.includes("maintenance") ||
    status.includes("reparation") ||
    status.includes("moyen")
  ) {
    return "ce-status-warning";
  }

  if (
    status.includes("bon") ||
    status.includes("neuf") ||
    status.includes("fonctionnel")
  ) {
    return "ce-status-available";
  }

  return "ce-status-neutral";
};

/* =========================
   PAGE EQUIPEMENTS
========================= */

const ChefEquipements = () => {
  const { accessToken } = useAuth();

  const [projects, setProjects] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestForm, setRequestForm] = useState({
    id_projet: "",
    nom_equipement: "",
    type_equipement: "",
    quantite: "1",
    date_besoin: "",
    duree_estimee: "",
    motif: "",
    priorite: "NORMALE",
  });

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     CHARGEMENT DES DONNEES
  ========================= */

  const loadData = async () => {
    if (!accessToken) {
      setProjects([]);
      setEquipments([]);
      setAssignments([]);
      setMaintenances([]);
      setMyRequests([]);
      setLoading(false);
      setError(
        "Vous devez vous connecter pour consulter les équipements."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        projectsResponse,
        equipmentResponse,
        assignmentResponse,
        maintenanceResponse,
        requestsResponse,
      ] = await Promise.all([
        getMyProjects(accessToken),
        api.get("/maintenance/equipements/"),
        api.get("/maintenance/affectations/"),
        api.get("/maintenance/maintenances/"),
        api.get("/maintenance/demandes-equipements/"),
      ]);

      const projectList = getList(projectsResponse);
      const equipmentList = getList(equipmentResponse);
      const assignmentList = getList(assignmentResponse);
      const maintenanceList = getList(maintenanceResponse);
      const requestsList = getList(requestsResponse);

      const allowedProjectIds = new Set(
        projectList.map(getProjectId)
      );

      const myAssignments = assignmentList.filter((item) =>
        allowedProjectIds.has(String(getId(item.id_projet)))
      );

      const myEquipmentIds = new Set(
        myAssignments.map((item) =>
          String(getId(item.id_equipement))
        )
      );

      const myEquipments = equipmentList.filter((item) =>
        myEquipmentIds.has(getEquipmentId(item))
      );

      const myMaintenance = maintenanceList.filter((item) =>
        myEquipmentIds.has(String(getId(item.id_equipement)))
      );

      setProjects(projectList);
      setAssignments(myAssignments);
      setEquipments(myEquipments);
      setMaintenances(myMaintenance);
      setMyRequests(requestsList);
    } catch (err) {
      console.error(
        "Erreur de chargement des équipements :",
        err.response?.status,
        err.response?.data || err.message
      );

      setError(
        err?.response?.data?.detail ||
          "Impossible de charger les équipements. Vérifiez votre connexion et vos autorisations."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChange = (event) => {
    const { name, value } = event.target;
    setRequestForm((previous) => ({ ...previous, [name]: value }));
  };

  const submitEquipmentRequest = async (event) => {
    event.preventDefault();
    setRequestLoading(true);
    setRequestError("");
    setRequestMessage("");

    try {
      const payload = {
        ...requestForm,
        id_projet: Number(requestForm.id_projet),
        quantite: Number(requestForm.quantite),
      };

      await api.post("/maintenance/demandes-equipements/", payload);

      setRequestMessage(
        "Votre demande a été envoyée au responsable maintenance."
      );

      setRequestForm({
        id_projet: "",
        nom_equipement: "",
        type_equipement: "",
        quantite: "1",
        date_besoin: "",
        duree_estimee: "",
        motif: "",
        priorite: "NORMALE",
      });

      await loadData();
    } catch (err) {
      const data = err?.response?.data;
      const detail =
        data?.detail ||
        (data && typeof data === "object"
          ? Object.entries(data)
              .map(([key, value]) =>
                `${key}: ${
                  Array.isArray(value) ? value.join(", ") : value
                }`
              )
              .join(" | ")
          : "");

      setRequestError(
        detail ||
          "Impossible d'envoyer la demande. Vérifiez les champs et vos autorisations."
      );
    } finally {
      setRequestLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [accessToken]);

  /* =========================
     PROJETS
  ========================= */

  const projectMap = useMemo(() => {
    return new Map(
      projects.map((project) => [
        getProjectId(project),
        `${
          project.numero_projet
            ? `${project.numero_projet} — `
            : ""
        }${project.nom || "Chantier sans nom"}`,
      ])
    );
  }, [projects]);

  /* =========================
     AFFECTATIONS ACTIVES
  ========================= */

  const activeAssignments = useMemo(
    () => assignments.filter(isActiveAssignment),
    [assignments]
  );

  /* =========================
     PREPARATION DES EQUIPEMENTS
  ========================= */

  const equipmentRows = useMemo(() => {
    return equipments.map((equipment) => {
      const equipmentId = getEquipmentId(equipment);

      const equipmentAssignments = assignments.filter(
        (item) =>
          String(getId(item.id_equipement)) === equipmentId
      );

      const active = equipmentAssignments.filter(
        isActiveAssignment
      );

      const projectNames = [
        ...new Set(
          active.map(
            (item) =>
              projectMap.get(
                String(getId(item.id_projet))
              ) ||
              `Chantier #${getId(item.id_projet)}`
          )
        ),
      ];

      const historyNames = [
        ...new Set(
          equipmentAssignments.map(
            (item) =>
              projectMap.get(
                String(getId(item.id_projet))
              ) ||
              `Chantier #${getId(item.id_projet)}`
          )
        ),
      ];

      const equipmentMaintenance = maintenances.filter(
        (item) =>
          String(getId(item.id_equipement)) === equipmentId
      );

      const ongoingMaintenance = equipmentMaintenance.filter(
        (item) => {
          const status = normalize(item.statut);

          return (
            status.includes("cours") ||
            status.includes("planifie") ||
            status.includes("en attente")
          );
        }
      );

      return {
        ...equipment,
        equipmentId,
        projectNames,
        historyNames,
        equipmentAssignments,
        activeAssignments: active,
        equipmentMaintenance,
        ongoingMaintenance,
      };
    });
  }, [equipments, assignments, maintenances, projectMap]);

  /* =========================
     FILTRES
  ========================= */

  const filteredEquipments = useMemo(() => {
    const query = normalize(search);

    return equipmentRows.filter((item) => {
      const searchable = normalize(
        [
          item.nom,
          item.type,
          item.numero_serie,
          item.marque,
          item.modele,
          ...item.projectNames,
          ...item.historyNames,
        ].join(" ")
      );

      const matchesSearch =
        !query || searchable.includes(query);

      const matchesProject =
        projectFilter === "all" ||
        item.equipmentAssignments.some(
          (assignment) =>
            String(getId(assignment.id_projet)) ===
            projectFilter
        );

      const availability = normalize(item.disponibilite);

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" &&
          (availability.includes("disponible") ||
            availability.includes("libre"))) ||
        (availabilityFilter === "used" &&
          (availability.includes("utilise") ||
            availability.includes("affecte") ||
            availability.includes("occupe"))) ||
        (availabilityFilter === "unavailable" &&
          (availability.includes("indisponible") ||
            availability.includes("hors service") ||
            availability.includes("maintenance") ||
            availability.includes("panne")));

      const state = normalize(item.etat);

      const matchesState =
        stateFilter === "all" ||
        (stateFilter === "good" &&
          (state.includes("bon") ||
            state.includes("neuf") ||
            state.includes("fonctionnel"))) ||
        (stateFilter === "average" &&
          (state.includes("moyen") ||
            state.includes("maintenance") ||
            state.includes("reparation"))) ||
        (stateFilter === "bad" &&
          (state.includes("mauvais") ||
            state.includes("panne") ||
            state.includes("hors service") ||
            state.includes("degrade")));

      return (
        matchesSearch &&
        matchesProject &&
        matchesAvailability &&
        matchesState
      );
    });
  }, [
    equipmentRows,
    search,
    projectFilter,
    availabilityFilter,
    stateFilter,
  ]);

  const clearFilters = () => {
    setSearch("");
    setProjectFilter("all");
    setAvailabilityFilter("all");
    setStateFilter("all");
  };

  const stats = useMemo(() => {
    const available = equipmentRows.filter((item) => {
      const status = normalize(item.disponibilite);
      return status.includes("disponible") || status.includes("libre");
    }).length;

    const unavailable = equipmentRows.filter((item) => {
      const status = normalize(item.disponibilite);
      return (
        status.includes("indisponible") ||
        status.includes("maintenance") ||
        status.includes("panne") ||
        status.includes("hors service")
      );
    }).length;

    const maintenanceCount = new Set(
      equipmentRows
        .filter((item) => item.ongoingMaintenance.length > 0)
        .map((item) => item.equipmentId)
    ).size;

    return {
      total: equipmentRows.length,
      active: activeAssignments.length,
      available,
      maintenance: maintenanceCount || unavailable,
    };
  }, [equipmentRows, activeAssignments]);

  if (loading) {
    return (
      <div className="chef-equipements-page">
        <div className="ce-message-card">
          <div className="ce-loading-spinner" />
          <h2>Chargement des équipements</h2>
          <p>Récupération du matériel de vos chantiers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chef-equipements-page">
        <header className="ce-page-header">
          <div>
            <span className="ce-eyebrow">GESTION DU CHANTIER</span>
            <h1>Mes équipements</h1>
            <p>Consultez le matériel affecté à vos chantiers.</p>
          </div>
        </header>

        <div className="ce-message-card ce-error-card">
          <Icon name="alert" size={30} />
          <h2>Chargement impossible</h2>
          <p>{error}</p>
          <button
            className="ce-primary-button"
            onClick={loadData}
            type="button"
          >
            <Icon name="refresh" size={17} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chef-equipements-page">
      <header className="ce-page-header">
        <div>
          <span className="ce-eyebrow">GESTION DU CHANTIER</span>
          <h1>Mes équipements</h1>
          <p>
            Suivez le matériel affecté à vos chantiers et consultez son état.
          </p>
        </div>

        <div className="ce-header-actions">
          <button
            type="button"
            className="ce-primary-button"
            onClick={() => {
              setShowRequestForm((previous) => !previous);
              setRequestError("");
              setRequestMessage("");
            }}
          >
            + Demander un équipement
          </button>

          <button
            type="button"
            className="ce-refresh-button"
            onClick={loadData}
          >
            <Icon name="refresh" size={17} />
            Actualiser
          </button>
        </div>
      </header>

      {showRequestForm && (
        <section className="ce-content-card ce-request-card">
          <div className="ce-card-heading">
            <div>
              <h2>Nouvelle demande d'équipement</h2>
              <p>Précisez le matériel nécessaire à votre chantier.</p>
            </div>
          </div>

          {projects.length === 0 ? (
            <p className="ce-request-error">
              Aucun chantier ne vous est attribué. Contactez l'administrateur.
            </p>
          ) : (
            <form
              className="ce-request-form"
              onSubmit={submitEquipmentRequest}
            >
              <label>
                Chantier *
                <select
                  name="id_projet"
                  value={requestForm.id_projet}
                  onChange={handleRequestChange}
                  required
                >
                  <option value="">Sélectionner un chantier</option>
                  {projects.map((project) => (
                    <option
                      key={getProjectId(project)}
                      value={getProjectId(project)}
                    >
                      {project.numero_projet
                        ? `${project.numero_projet} — ${project.nom}`
                        : project.nom}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Nom de l'équipement *
                <input
                  name="nom_equipement"
                  value={requestForm.nom_equipement}
                  onChange={handleRequestChange}
                  placeholder="Ex. : bétonnière"
                  maxLength={255}
                  required
                />
              </label>

              <label>
                Type d'équipement
                <input
                  name="type_equipement"
                  value={requestForm.type_equipement}
                  onChange={handleRequestChange}
                  placeholder="Ex. : engin de chantier"
                  maxLength={100}
                />
              </label>

              <label>
                Quantité *
                <input
                  type="number"
                  name="quantite"
                  min="1"
                  value={requestForm.quantite}
                  onChange={handleRequestChange}
                  required
                />
              </label>

              <label>
                Date du besoin *
                <input
                  type="date"
                  name="date_besoin"
                  min={new Date().toISOString().slice(0, 10)}
                  value={requestForm.date_besoin}
                  onChange={handleRequestChange}
                  required
                />
              </label>

              <label>
                Durée estimée *
                <input
                  name="duree_estimee"
                  value={requestForm.duree_estimee}
                  onChange={handleRequestChange}
                  placeholder="Ex. : 5 jours"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Priorité
                <select
                  name="priorite"
                  value={requestForm.priorite}
                  onChange={handleRequestChange}
                >
                  <option value="NORMALE">Normale</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </label>

              <label className="ce-request-full">
                Motif de la demande *
                <textarea
                  name="motif"
                  value={requestForm.motif}
                  onChange={handleRequestChange}
                  placeholder="Expliquez pourquoi ce matériel est nécessaire..."
                  rows={4}
                  required
                />
              </label>

              {requestError && (
                <p className="ce-request-error ce-request-full">
                  {requestError}
                </p>
              )}

              {requestMessage && (
                <p className="ce-request-success ce-request-full">
                  {requestMessage}
                </p>
              )}

              <div className="ce-request-actions ce-request-full">
                <button
                  type="button"
                  className="ce-secondary-button"
                  onClick={() => setShowRequestForm(false)}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="ce-primary-button"
                  disabled={requestLoading}
                >
                  {requestLoading
                    ? "Envoi en cours..."
                    : "Envoyer la demande"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      <section className="ce-content-card ce-my-requests-card">
        <div className="ce-card-heading">
          <div>
            <h2>Mes demandes de matériel</h2>
            <p>Suivez les réponses du responsable maintenance.</p>
          </div>
          <span className="ce-request-count">{myRequests.length}</span>
        </div>

        {myRequests.length === 0 ? (
          <p className="ce-muted ce-requests-empty">
            Vous n'avez pas encore envoyé de demande.
          </p>
        ) : (
          <div className="ce-requests-list">
            {myRequests.map((request) => (
              <article
                className="ce-request-item"
                key={request.id_demande}
              >
                <div className="ce-request-item-main">
                  <strong>
                    {request.nom_equipement} · Quantité : {request.quantite}
                  </strong>
                  <span>
                    {request.nom_chantier ||
                      `Chantier #${getId(request.id_projet)}`}
                  </span>
                  <small>
                    Besoin le {formatDate(request.date_besoin)} · Durée :{" "}
                    {request.duree_estimee}
                  </small>
                  <p>{request.motif}</p>

                  {request.commentaire_decision && (
                    <p className="ce-request-decision">
                      Réponse : {request.commentaire_decision}
                    </p>
                  )}
                </div>

                <span
                  className={`ce-request-status ce-request-status-${normalize(
                    request.statut
                  )}`}
                >
                  {(request.statut || "EN_ATTENTE").replaceAll("_", " ")}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="ce-stats-grid">
        <article className="ce-stat-card">
          <div className="ce-stat-icon ce-icon-nude">
            <Icon name="equipment" size={23} />
          </div>
          <div className="ce-stat-text">
            <span>Total des équipements</span>
            <strong>{stats.total}</strong>
            <small>Matériel de mes chantiers</small>
          </div>
        </article>

        <article className="ce-stat-card">
          <div className="ce-stat-icon ce-icon-green">
            <Icon name="check" size={23} />
          </div>
          <div className="ce-stat-text">
            <span>Disponibles</span>
            <strong>{stats.available}</strong>
            <small>Selon la disponibilité enregistrée</small>
          </div>
        </article>

        <article className="ce-stat-card">
          <div className="ce-stat-icon ce-icon-sand">
            <Icon name="calendar" size={23} />
          </div>
          <div className="ce-stat-text">
            <span>Affectations actives</span>
            <strong>{stats.active}</strong>
            <small>Affectations sans date de fin dépassée</small>
          </div>
        </article>

        <article className="ce-stat-card">
          <div className="ce-stat-icon ce-icon-alert">
            <Icon name="tool" size={23} />
          </div>
          <div className="ce-stat-text">
            <span>À surveiller</span>
            <strong>{stats.maintenance}</strong>
            <small>Matériel en maintenance ou indisponible</small>
          </div>
        </article>
      </section>

      <section className="ce-content-card">
        <div className="ce-card-heading">
          <div>
            <h2>Liste des équipements</h2>
            <p>
              {filteredEquipments.length} équipement(s) affiché(s) sur{" "}
              {equipmentRows.length}
            </p>
          </div>

          <div className="ce-readonly-label">
            <Icon name="check" size={15} />
            Consultation
          </div>
        </div>

        <div className="ce-filters">
          <label className="ce-search-box">
            <Icon name="search" size={19} />
            <input
              type="search"
              placeholder="Nom, marque, modèle, numéro de série..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label className="ce-select-wrap">
            <span>Chantier</span>
            <select
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
            >
              <option value="all">Tous les chantiers</option>
              {projects.map((project) => (
                <option
                  key={getProjectId(project)}
                  value={getProjectId(project)}
                >
                  {project.numero_projet
                    ? `${project.numero_projet} — ${project.nom}`
                    : project.nom}
                </option>
              ))}
            </select>
          </label>

          <label className="ce-select-wrap">
            <span>Disponibilité</span>
            <select
              value={availabilityFilter}
              onChange={(event) =>
                setAvailabilityFilter(event.target.value)
              }
            >
              <option value="all">Toutes</option>
              <option value="available">Disponible</option>
              <option value="used">Utilisé / affecté</option>
              <option value="unavailable">Indisponible</option>
            </select>
          </label>

          <label className="ce-select-wrap">
            <span>État</span>
            <select
              value={stateFilter}
              onChange={(event) => setStateFilter(event.target.value)}
            >
              <option value="all">Tous les états</option>
              <option value="good">Bon / fonctionnel</option>
              <option value="average">Moyen / réparation</option>
              <option value="bad">Mauvais / en panne</option>
            </select>
          </label>

          <button
            className="ce-reset-button"
            onClick={clearFilters}
            type="button"
          >
            <Icon name="filter" size={16} />
            Réinitialiser
          </button>
        </div>

        {filteredEquipments.length === 0 ? (
          <div className="ce-empty-state">
            <div className="ce-empty-icon">
              <Icon name="empty" size={30} />
            </div>
            <h3>Aucun équipement trouvé</h3>
            <p>
              {equipmentRows.length === 0
                ? "Aucun équipement n'est actuellement affecté à vos chantiers."
                : "Modifiez votre recherche ou réinitialisez les filtres."}
            </p>
            <button
              className="ce-secondary-button"
              onClick={clearFilters}
              type="button"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="ce-table-wrapper">
            <table className="ce-equipment-table">
              <thead>
                <tr>
                  <th>Équipement</th>
                  <th>Référence / type</th>
                  <th>Chantier(s)</th>
                  <th>Disponibilité</th>
                  <th>État</th>
                  <th>Affectation</th>
                  <th>Maintenance</th>
                </tr>
              </thead>

              <tbody>
                {filteredEquipments.map((item) => {
                  const availability =
                    item.disponibilite || "Non renseignée";
                  const state = item.etat || "Non renseigné";
                  const currentAssignment = item.activeAssignments[0];

                  const assignmentDates = currentAssignment
                    ? `${formatDate(
                        currentAssignment.date_debut
                      )} → ${formatDate(currentAssignment.date_fin)}`
                    : "Aucune affectation active";

                  const displayedProjects = item.projectNames.length
                    ? item.projectNames
                    : item.historyNames;

                  return (
                    <tr key={item.equipmentId}>
                      <td>
                        <div className="ce-equipment-name-cell">
                          <div className="ce-equipment-avatar">
                            <Icon name="equipment" size={21} />
                          </div>
                          <div className="ce-equipment-name-text">
                            <strong>
                              {item.nom || "Équipement sans nom"}
                            </strong>
                            <span>
                              {item.marque || "Marque non renseignée"}
                              {item.modele ? ` · ${item.modele}` : ""}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="ce-reference-cell">
                          <strong>
                            {item.numero_serie || `EQ-${item.equipmentId}`}
                          </strong>
                          <span>{item.type || "Type non renseigné"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="ce-project-tags">
                          {displayedProjects.length ? (
                            displayedProjects.map((name) => (
                              <span
                                className="ce-project-tag"
                                key={name}
                              >
                                {name}
                              </span>
                            ))
                          ) : (
                            <span className="ce-muted">Non affecté</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`ce-status ${getAvailabilityClass(
                            availability
                          )}`}
                        >
                          <span className="ce-status-dot" />
                          {availability}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`ce-status ${getStateClass(state)}`}
                        >
                          <span className="ce-status-dot" />
                          {state}
                        </span>
                      </td>

                      <td>
                        <div className="ce-date-cell">
                          <strong>{assignmentDates}</strong>
                          <span>
                            {item.activeAssignments.length} affectation(s)
                            active(s)
                          </span>
                        </div>
                      </td>

                      <td>
                        {item.equipmentMaintenance.length === 0 ? (
                          <span className="ce-maintenance-none">
                            Aucune donnée
                          </span>
                        ) : (
                          <div className="ce-maintenance-cell">
                            <span
                              className={`ce-status ${
                                item.ongoingMaintenance.length
                                  ? "ce-status-warning"
                                  : "ce-status-available"
                              }`}
                            >
                              <span className="ce-status-dot" />
                              {item.ongoingMaintenance.length
                                ? "À suivre"
                                : "Historique"}
                            </span>
                            <small>
                              {item.equipmentMaintenance.length} intervention(s)
                            </small>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="ce-table-footer">
          <span>
            Données affichées : équipements associés aux affectations de vos
            chantiers.
          </span>
          <span>{filteredEquipments.length} résultat(s)</span>
        </div>
      </section>

      <div className="ce-info-note">
        <div className="ce-info-note-icon">
          <Icon name="alert" size={20} />
        </div>
        <div>
          <strong>Information sur le matériel</strong>
          <p>
            Cette page permet de consulter le matériel. Pour une modification
            d'état, une nouvelle affectation ou une intervention de maintenance,
            contactez le responsable maintenance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChefEquipements;


