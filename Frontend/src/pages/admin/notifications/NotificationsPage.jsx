import { useCallback, useEffect, useState } from "react";
import api from "../../../services/api";
import "./NotificationsPage.css";
import { NOTIFS_EVENT } from "../../../hooks/useUnreadCount";
function getNotificationList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function formatDate(date) {
  if (!date) return "Date inconnue";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date inconnue";
  }

  return parsedDate.toLocaleString("fr-FR");
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/projects/notifications/");
      const data = getNotificationList(response.data);

      setNotifications(
        [...data].sort(
          (a, b) =>
            new Date(b.date_creation || 0) -
            new Date(a.date_creation || 0)
        )
      );
      setError("");
    } catch (err) {
      console.error("Erreur de chargement des notifications :", err);
      setError(
        "Impossible de charger les notifications. Vérifie ta connexion et tes droits."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/projects/notifications/${id}/`, { lue: true });
      window.dispatchEvent(new Event(NOTIFS_EVENT));
      setNotifications((prev) =>
        prev.map((n) =>
          n.id_notification === id ? { ...n, lue: true } : n
        )
      );
    } catch (err) {
      console.error("Erreur lors du marquage comme lue :", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.lue).length;

  return (
    <main className="notifications-page">
      <header className="notifications-page-header">
        <div>
          <h1>Mes notifications</h1>
          <p>
            Consulte les informations et les alertes de ton espace BTP.
          </p>
        </div>

        <button
          type="button"
          className="notifications-refresh"
          onClick={() => loadNotifications(true)}
          disabled={loading || refreshing}
        >
          {refreshing ? "Actualisation..." : "Actualiser"}
        </button>
      </header>

      {!loading && !error && (
        <section className="notifications-summary">
          <div>
            <span className="notifications-summary-number">
              {notifications.length}
            </span>
            <span>Total des notifications</span>
          </div>

          <div>
            <span className="notifications-summary-number">
              {unreadCount}
            </span>
            <span>Non lues</span>
          </div>
        </section>
      )}

      {loading ? (
        <p className="notifications-feedback">Chargement...</p>
      ) : error ? (
        <div className="notifications-feedback notifications-feedback-error">
          <p>{error}</p>
          <button type="button" onClick={() => loadNotifications()}>
            Réessayer
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="notifications-empty">
          <span aria-hidden="true">🔔</span>
          <h2>Aucune notification</h2>
          <p>
            Les nouvelles alertes de ton espace BTP apparaîtront ici.
          </p>
        </div>
      ) : (
        <section className="notifications-list">
          {notifications.map((notification) => (
            <article
              key={notification.id_notification}
              className={`notifications-card ${
                notification.lue
                  ? "notifications-card-read"
                  : "notifications-card-unread"
              }`}
            >
              <div className="notifications-card-icon" aria-hidden="true">
                {notification.type?.toUpperCase() === "MAINTENANCE"
                  ? "🔧"
                  : "🔔"}
              </div>

              <div className="notifications-card-content">
                <div className="notifications-card-top">
                  <span className="notifications-type">
                    {notification.type || "INFORMATION"}
                  </span>

                  <span
                    className={`notifications-status ${
                      notification.lue ? "status-read" : "status-unread"
                    }`}
                  >
                    {notification.lue ? "Lue" : "Non lue"}
                  </span>
                </div>

                <h2>{notification.titre}</h2>
                <p>{notification.message}</p>

                <div className="notifications-card-footer">
                  <time>
                    {formatDate(notification.date_creation)}
                  </time>

                  {!notification.lue && (
                    <button
                      type="button"
                      className="notifications-mark-read"
                      onClick={() =>
                        handleMarkAsRead(notification.id_notification)
                      }
                    >
                      ✓ Marquer comme lue
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}