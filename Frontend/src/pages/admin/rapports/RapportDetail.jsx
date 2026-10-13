import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { jsPDF } from "jspdf";

import { getRapport } from "../../../services/rapportsService";
import "./RapportDetail.css";

function RapportDetail() {
  const { id } = useParams();

  const [rapport, setRapport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRapport = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setRapport(null);

      const data = await getRapport(id);

      if (!data || typeof data !== "object") {
        throw new Error("Le serveur n'a pas retourné de rapport valide.");
      }

      setRapport(data);
    } catch (err) {
      console.error("Erreur de chargement du rapport :", err);
      setError(
        err?.message || "Impossible de charger ce rapport depuis le serveur."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRapport();
  }, [loadRapport]);

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportPDF = () => {
    if (!rapport) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;

    doc.setFontSize(18);
    doc.setTextColor(31, 65, 48);

    const title = rapport.titre || `Rapport #${rapport.id_rapport ?? id}`;
    const titleLines = doc.splitTextToSize(title, contentWidth);

    doc.text(titleLines, margin, 22);

    let y = 22 + titleLines.length * 8 + 5;

    doc.setFontSize(10);
    doc.setTextColor(90, 100, 92);

    const details = [
      `Identifiant : ${rapport.id_rapport ?? id}`,
      `Projet : ${rapport.id_projet ?? "-"}`,
      `Auteur : ${rapport.id_utilisateur ?? "-"}`,
      `Type : ${rapport.type_rapport || "Non renseigné"}`,
      `Date : ${formatDate(rapport.date_rapport)}`,
    ];

    details.forEach((line) => {
      const lines = doc.splitTextToSize(line, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 6 + 2;
    });

    y += 7;

    doc.setFontSize(13);
    doc.setTextColor(31, 65, 48);
    doc.text("Contenu du rapport", margin, y);

    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(50, 55, 51);

    const content = doc.splitTextToSize(
      rapport.contenu || "Aucun contenu renseigné.",
      contentWidth
    );

    const pageHeight = doc.internal.pageSize.getHeight();
    const lineHeight = 5;

    content.forEach((line) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      doc.text(line, margin, y);
      y += lineHeight;
    });

    doc.save(`rapport_${rapport.id_rapport ?? id}.pdf`);
  };

  const exportText = () => {
    if (!rapport) return;

    const content = [
      `RAPPORT DE CHANTIER`,
      `Titre : ${rapport.titre || "-"}`,
      `Identifiant : ${rapport.id_rapport ?? id}`,
      `Projet : ${rapport.id_projet ?? "-"}`,
      `Auteur : ${rapport.id_utilisateur ?? "-"}`,
      `Type : ${rapport.type_rapport || "-"}`,
      `Date : ${formatDate(rapport.date_rapport)}`,
      "",
      "CONTENU DU RAPPORT",
      rapport.contenu || "Aucun contenu renseigné.",
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `rapport_${rapport.id_rapport ?? id}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <main className="rapport-detail-page">
        <div className="rapport-detail-loading">
          <div className="rapport-detail-loader" />
          <span>Chargement du rapport...</span>
        </div>
      </main>
    );
  }

  if (error || !rapport) {
    return (
      <main className="rapport-detail-page">
        <header className="rapport-detail-header">
          <div>
            <p className="rapport-detail-eyebrow">ESPACE ADMINISTRATEUR</p>
            <h1>Détail du rapport</h1>
          </div>

          <Link to="/admin/rapports" className="rapport-back-button">
            ← Retour aux rapports
          </Link>
        </header>

        <div className="rapport-detail-error" role="alert">
          {error || "Rapport introuvable."}
        </div>

        <button
          type="button"
          className="rapport-retry-button"
          onClick={loadRapport}
        >
          Réessayer
        </button>
      </main>
    );
  }

  return (
    <main className="rapport-detail-page">
      <header className="rapport-detail-header">
        <div>
          <p className="rapport-detail-eyebrow">ESPACE ADMINISTRATEUR</p>
          <h1>{rapport.titre || `Rapport #${rapport.id_rapport ?? id}`}</h1>
          <p className="rapport-detail-subtitle">
            Consultation détaillée du rapport de chantier.
          </p>
        </div>

        <Link to="/admin/rapports" className="rapport-back-button">
          ← Retour aux rapports
        </Link>
      </header>

      <section className="rapport-detail-actions">
        <span className="rapport-detail-id">
          Rapport #{rapport.id_rapport ?? id}
        </span>

        <div>
          <button
            type="button"
            className="rapport-action-button rapport-action-pdf"
            onClick={exportPDF}
          >
            ↓ Exporter en PDF
          </button>

          <button
            type="button"
            className="rapport-action-button rapport-action-text"
            onClick={exportText}
          >
            ↓ Exporter en TXT
          </button>
        </div>
      </section>

      <section className="rapport-detail-card">
        <div className="rapport-info">
          <span>Projet</span>
          <strong>
            {rapport.id_projet ? `Projet #${rapport.id_projet}` : "-"}
          </strong>
        </div>

        <div className="rapport-info">
          <span>Rédigé par</span>
          <strong>
            {rapport.id_utilisateur
              ? `Utilisateur #${rapport.id_utilisateur}`
              : "-"}
          </strong>
        </div>

        <div className="rapport-info">
          <span>Date du rapport</span>
          <strong>{formatDate(rapport.date_rapport)}</strong>
        </div>

        <div className="rapport-info">
          <span>Type de rapport</span>
          <strong>
            <span className="rapport-type-badge">
              {rapport.type_rapport || "Non renseigné"}
            </span>
          </strong>
        </div>
      </section>

      <section className="rapport-content-card">
        <div className="rapport-content-heading">
          <div>
            <p className="rapport-detail-eyebrow">DOCUMENT</p>
            <h2>Contenu du rapport</h2>
          </div>
        </div>

        <p className="rapport-content-text">
          {rapport.contenu || "Aucun contenu renseigné pour ce rapport."}
        </p>
      </section>
    </main>
  );
}

export default RapportDetail;