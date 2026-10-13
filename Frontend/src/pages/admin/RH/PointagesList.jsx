import { useCallback } from "react";
import { getPointages } from "../../../services/hrService";
import HRResourceList from "./HRResourceList";

function PointagesList() {
  const load = useCallback(() => getPointages(), []);

  return (
    <HRResourceList
      title="Pointages"
      description="Historique des heures d'entrée et de sortie du personnel."
      getData={load}
      idField="id_pointage"
      detailPath="/admin/rh/pointages"
      backPath="/admin/rh"
      columns={[
        { label: "ID", field: "id_pointage" },
        { label: "Employé (ID)", field: "id_employe" },
        { label: "Projet (ID)", field: "id_projet" },
        { label: "Date", field: "date" },
        { label: "Heure d'entrée", field: "heure_entree" },
        { label: "Heure de sortie", field: "heure_sortie" },
      ]}
      searchFields={[
        "id_pointage", "id_employe", "id_projet",
        "date", "heure_entree", "heure_sortie",
      ]}
    />
  );
}

export default PointagesList;