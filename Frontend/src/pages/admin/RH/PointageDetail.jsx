import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { getPointage } from "../../../services/hrService";
import HRResourceDetail from "./HRResourceDetail";

function PointageDetail() {
  const { id } = useParams();
  const load = useCallback((value) => getPointage(value), []);

  return (
    <HRResourceDetail
      id={id}
      title={`Pointage #${id}`}
      backPath="/admin/rh/pointages"
      getData={load}
      fields={[
        { label: "Identifiant", key: "id_pointage" },
        { label: "Employé (ID)", key: "id_employe" },
        { label: "Projet (ID)", key: "id_projet" },
        { label: "Date", key: "date" },
        { label: "Heure d'entrée", key: "heure_entree" },
        { label: "Heure de sortie", key: "heure_sortie" },
      ]}
    />
  );
}

export default PointageDetail;