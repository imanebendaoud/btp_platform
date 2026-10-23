import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import "./NotificationBell.css";

function getNotificationList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function formatDate(date) {
  if (!date) return "Date inconnue";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Date inconnue";
  return parsedDate.toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getTypeIcon(type) {
  const value = String(type || "").toUpperCase();
  if (value.includes("STOCK")) return "📦";
  if (value.includes("FINANCE")) return "€";
  if (value.includes("MAINTENANCE")) return "🔧";
  if (value.includes("RH")) return "👤";
  return "🔔";
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      const response = await api.get("/projects/notifications/");
      const data = getNotificationList(response.data);

      setNotifications(
        [...data].sort(
          (a, b) =>
            new Date(b.date_creation || 0) - new Date(a.date_creation || 0)
        )
      );
      setError("");
    } catch (err) {
      console.error("Erreur de chargement des notifications :", err);
      setError("Impossible de charger les notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/projects/notifications/${id}/`, { lue: true });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id_notification === id ? { ...n, lue: true } : n
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.lue).length;
  const recent = notifications.slice(0, 8);

  return (
    <div className="bell-container">
      <button
        type="button"
        className="bell-button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Notifications, ${unreadCount} non lues`}
      >
        <span className="bell-icon" aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span className="bell-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="bell-backdrop"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
          />

          <section className="bell-panel">
            <div className="bell-panel-header">
              <div>
                <h3>Notifications</h3>
                <p>
                  {unreadCount === 0
                    ? "Tout est à jour"
                    : `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`}
                </p>
              </div>
              <button
                type="button"
                className="bell-close"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <div className="bell-list">
              {loading ? (
                <p className="bell-status">Chargement...</p>
              ) : error ? (
                <div className="bell-status bell-status-error">
                  <p>{error}</p>
                  <button type="button" onClick={loadNotifications}>
                    Réessayer
                  </button>
                </div>
              ) : recent.length === 0 ? (
                <p className="bell-status">Aucune notification pour le moment.</p>
              ) : (
                recent.map((n) => (
                  <div
                    key={n.id_notification}
                    className={"bell-item" + (!n.lue ? " bell-item-unread" : "")}
                  >
                    <div className="bell-item-icon">{getTypeIcon(n.type)}</div>

                    <div className="bell-item-body">
                      <div className="bell-item-top">
                        <span className="bell-item-type">
                          {n.type || "Général"}
                        </span>
                        {!n.lue && <span className="bell-dot"></span>}
                      </div>

                      <strong className="bell-item-title">{n.titre}</strong>
                      <p className="bell-item-message">{n.message}</p>
                      <time className="bell-item-date">
                        {formatDate(n.date_creation)}
                      </time>
                    </div>

                    {!n.lue && (
                      <button
                        className="bell-mark-read"
                        onClick={(e) => handleMarkAsRead(n.id_notification, e)}
                        title="Marquer comme lue"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="bell-panel-footer">
              <Link to="/admin/notifications" onClick={() => setOpen(false)}>
                Voir toutes les notifications
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}