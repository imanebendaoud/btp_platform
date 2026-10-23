import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

export const NOTIFS_EVENT = "notifications-changed";

function useUnreadCount(intervalMs = 30000) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const response = await api.get("/projects/notifications/");
      const data = response.data;
      const list = Array.isArray(data) ? data : data.results || [];
      setCount(list.filter((n) => !n.lue).length);
    } catch (err) {
      console.error("Compteur de notifications :", err);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, intervalMs);
    window.addEventListener(NOTIFS_EVENT, refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener(NOTIFS_EVENT, refresh);
    };
  }, [refresh, intervalMs]);

  return count;
}

export default useUnreadCount;