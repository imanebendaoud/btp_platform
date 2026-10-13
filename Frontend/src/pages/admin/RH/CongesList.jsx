import { useCallback } from "react";
import { getCongesAbsences } from "../../../services/hrService";
import HRResourceList from "./HRResourceList";

function CongesList() {
  const load = useCallback(() => getCongesAbsences(), []);

  return (
    <HRResourceList
      title="Congés et absences"
      description="Consultation des périodes d'absence et de leur statut."
      getData={load}
      idField="id_absence"
      detailPath="/admin/rh/conges-absences"
      backPath="/admin/rh"
      columns={[
        { label: "ID", field: "id_absence" },
        { label: "Employé (ID)", field: "id_employe" },
        { label: "Type", field: "type" },
        { label: "Date début", field: "date_debut" },
        { label: "Date fin", field: "date_fin" },
        { label: "Motif", field: "motif" },
        { label: "Statut", field: "statut" },
      ]}
      searchFields={[
        "id_absence", "id_employe", "type",
        "date_debut", "date_fin", "motif", "statut",
      ]}
    />
  );
}

export default CongesList;