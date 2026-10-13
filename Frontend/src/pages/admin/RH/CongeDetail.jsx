import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { getCongeAbsence } from "../../../services/hrService";
import HRResourceDetail from "./HRResourceDetail";

function CongeDetail() {
  const { id } = useParams();
  const load = useCallback((value) => getCongeAbsence(value), []);

  return (
    <HRResourceDetail
      id={id}
      title={`Congé / absence #${id}`}
      backPath="/admin/rh/conges-absences"
      getData={load}
      fields={[
        { label: "Identifiant", key: "id_absence" },
        { label: "Employé (ID)", key: "id_employe" },
        { label: "Type", key: "type" },
        { label: "Date de début", key: "date_debut" },
        { label: "Date de fin", key: "date_fin" },
        { label: "Motif", key: "motif" },
        { label: "Statut", key: "statut" },
      ]}
    />
  );
}

export default CongeDetail;