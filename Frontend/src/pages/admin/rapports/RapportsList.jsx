import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { getRapports } from "../../../services/rapportsService";
import "./RapportsList.css";

function RapportsList() {
  const [rapports, setRapports] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("TOUS");
  const [periodFilter, setPeriodFilter] = useState("TOUS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRapports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getRapports();

      const liste = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : [];

      setRapports(liste);
    } catch (err) {
      console.error("Erreur de chargement des rapports :", err);
      setError(
        err?.message || "Impossible de charger les rapports depuis le serveur."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRapports();
  }, [loadRapports]);

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const types = useMemo(() => {
    return [
      ...new Set(
        rapports
          .map((rapport) => String(rapport.type_rapport || "").trim())
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "fr"));
  }, [rapports]);

  const filteredRapports = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("fr");

    return rapports
      .filter((rapport) => {
        const searchableText = [
          rapport.titre,
          rapport.id_projet,
          rapport.contenu,
          rapport.type_rapport,
          rapport.id_utilisateur,
        ]
          .map((value) => String(value ?? ""))
          .join(" ")
          .toLocaleLowerCase("fr");

        const matchesSearch = searchableText.includes(normalizedSearch);

        const matchesType =
          typeFilter === "TOUS" ||
          String(rapport.type_rapport || "").toUpperCase() ===
            typeFilter.toUpperCase();

        let matchesPeriod = true;

        if (periodFilter !== "TOUS") {
          if (!rapport.date_rapport) {
            matchesPeriod = false;
          } else {
            const date = new Date(rapport.date_rapport);

            if (Number.isNaN(date.getTime())) {
              matchesPeriod = false;
            } else {
              const now = new Date();

              if (periodFilter === "MOIS") {
                matchesPeriod =
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();
              } else if (periodFilter === "ANNEE") {
                matchesPeriod = date.getFullYear() === now.getFullYear();
              }
            }
          }
        }

        return matchesSearch && matchesType && matchesPeriod;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date_rapport || 0).getTime();
        const dateB = new Date(b.date_rapport || 0).getTime();

        return (
          (Number.isNaN(dateB) ? 0 : dateB) -
          (Number.isNaN(dateA) ? 0 : dateA)
        );
      });
  }, [rapports, search, typeFilter, periodFilter]);

  const exportExcel = () => {
    if (filteredRapports.length === 0) {
      setError("Aucun rapport à exporter avec les filtres sélectionnés.");
      return;
    }

    const rows = filteredRapports.map((rapport) => ({
      ID: rapport.id_rapport ?? "",
      Titre: rapport.titre ?? "",
      Projet: rapport.id_projet ?? "",
      Type: rapport.type_rapport ?? "",
      Auteur: rapport.id_utilisateur ?? "",
      Date: formatDate(rapport.date_rapport),
      Contenu: rapport.contenu ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 35 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 16 },
      { wch: 60 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapports");

    XLSX.writeFile(workbook, "rapports_chantier.xlsx");
    setError("");
  };

  const exportPDF = () => {
    if (filteredRapports.length === 0) {
      setError("Aucun rapport à exporter avec les filtres sélectionnés.");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    doc.text("Rapports de chantier", 14, 18);

    doc.setFontSize(10);
    doc.text(
      `Nombre de rapports : ${filteredRapports.length}`,
      14,
      26
    );
    doc.text(
      `Date d'export : ${new Date().toLocaleDateString("fr-FR")}`,
      14,
      32
    );

    autoTable(doc, {
      startY: 39,
      head: [["ID", "Titre", "Projet", "Type", "Auteur", "Date"]],
      body: filteredRapports.map((rapport) => [
        rapport.id_rapport ?? "-",
        rapport.titre ?? "-",
        rapport.id_projet ?? "-",
        rapport.type_rapport ?? "-",
        rapport.id_utilisateur ?? "-",
        formatDate(rapport.date_rapport),
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [28, 70, 57],
      },
      columnStyles: {
        1: { cellWidth: 75 },
      },
      margin: { left: 14, right: 14 },
    });

    doc.save("rapports_chantier.pdf");
    setError("");
  };

  if (loading) {
    return (
      <main className="rapports-page">
        <div className="rapports-loading">
          <div className="rapports-loader" />
          <span>Chargement des rapports...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="rapports-page">
      <header className="rapports-header">
        <div>
          <p className="rapports-eyebrow">ESPACE ADMINISTRATEUR</p>
          <h1>Rapports de chantier</h1>
          <p className="rapports-subtitle">
            Consultez les rapports rédigés par les chefs de chantier.
          </p>
        </div>

        <button
          type="button"
          className="rapports-refresh-button"
          onClick={loadRapports}
        >
          ↻ Actualiser
        </button>
      </header>

      {error && (
        <div className="rapports-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            Fermer
          </button>
        </div>
      )}

      <section className="rapports-summary">
        <article className="rapports-summary-card">
          <span className="summary-icon">▤</span>
          <div>
            <p>Total des rapports</p>
            <strong>{rapports.length}</strong>
            <span>Rapports reçus par l'API</span>
          </div>
        </article>

        <article className="rapports-summary-card">
          <span className="summary-icon">◷</span>
          <div>
            <p>Ce mois-ci</p>
            <strong>
              {
                rapports.filter((rapport) => {
                  if (!rapport.date_rapport) return false;

                  const date = new Date(rapport.date_rapport);
                  const now = new Date();

                  return (
                    !Number.isNaN(date.getTime()) &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </strong>
            <span>Selon la date du rapport</span>
          </div>
        </article>

        <article className="rapports-summary-card">
          <span className="summary-icon">▧</span>
          <div>
            <p>Types de rapports</p>
            <strong>{types.length}</strong>
            <span>Types distincts enregistrés</span>
          </div>
        </article>
      </section>

      <section className="rapports-content">
        <div className="rapports-section-heading">
          <div>
            <h2>Historique des rapports</h2>
            <p>Recherchez, filtrez et exportez les résultats.</p>
          </div>

          <div className="rapports-export-actions">
            <button
              type="button"
              className="rapports-export-button excel"
              onClick={exportExcel}
              disabled={filteredRapports.length === 0}
            >
              ↓ Exporter Excel
            </button>

            <button
              type="button"
              className="rapports-export-button pdf"
              onClick={exportPDF}
              disabled={filteredRapports.length === 0}
            >
              ↓ Exporter PDF
            </button>
          </div>
        </div>

        <div className="rapports-toolbar">
          <input
            type="search"
            placeholder="Rechercher par titre, projet, auteur..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Rechercher un rapport"
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            aria-label="Filtrer par type"
          >
            <option value="TOUS">Tous les types</option>
            {types.map((type) => (
              <option key={type} value={type.toUpperCase()}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={periodFilter}
            onChange={(event) => setPeriodFilter(event.target.value)}
            aria-label="Filtrer par période"
          >
            <option value="TOUS">Toutes les périodes</option>
            <option value="MOIS">Ce mois</option>
            <option value="ANNEE">Cette année</option>
          </select>

          <span className="rapports-count">
            {filteredRapports.length} résultat(s)
          </span>
        </div>

        <div className="rapports-table-container">
          <table className="rapports-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Projet</th>
                <th>Type</th>
                <th>Auteur</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRapports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="rapports-empty">
                    {rapports.length === 0
                      ? "Aucun rapport n'est disponible."
                      : "Aucun rapport ne correspond à vos filtres."}
                  </td>
                </tr>
              ) : (
                filteredRapports.map((rapport, index) => (
                  <tr key={rapport.id_rapport ?? index}>
                    <td>#{rapport.id_rapport ?? "-"}</td>

                    <td className="rapport-titre">
                      {rapport.titre || "Sans titre"}
                    </td>

                    <td>
                      {rapport.id_projet
                        ? `Projet #${rapport.id_projet}`
                        : "-"}
                    </td>

                    <td>
                      <span className="rapports-badge">
                        {rapport.type_rapport || "Non renseigné"}
                      </span>
                    </td>

                    <td>
                      {rapport.id_utilisateur
                        ? `Utilisateur #${rapport.id_utilisateur}`
                        : "-"}
                    </td>

                    <td>{formatDate(rapport.date_rapport)}</td>

                    <td>
                      {rapport.id_rapport ? (
                        <Link
                          to={`/admin/rapports/${rapport.id_rapport}`}
                          className="rapports-eye-button"
                          title="Consulter le rapport"
                          aria-label={`Consulter le rapport ${rapport.id_rapport}`}
                        >
                          Voir
                        </Link>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="rapports-footer-note">
          Les exports contiennent les rapports actuellement affichés après
          application des filtres. Les données sont celles renvoyées par le
          serveur.
        </p>
      </section>
    </main>
  );
}

export default RapportsList;