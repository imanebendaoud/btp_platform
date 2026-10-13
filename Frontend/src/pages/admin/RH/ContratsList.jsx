import { useCallback } from "react";
import { getContrats } from "../../../services/hrService";
import HRResourceList from "./HRResourceList";

function ContratsList() {
  const load = useCallback(() => getContrats(), []);

  return ( 
    <HRResourceList
      title="Contrats"
      description="Historique des contrats du personnel."
      getData={load}
      idField="id_contrat"
      backPath="/admin/rh"
      detailPath="/admin/rh/contrats"
      columns={[
        { label: "ID", field: "id_contrat" },
        { label: "Employé (ID)", field: "id_employe" },
        { label: "Type", field: "type_contrat" },
        { label: "Date début", field: "date_debut" },
        { label: "Date fin", field: "date_fin" },
        { label: "Salaire (DH)", field: "salaire" },
        { label: "Statut", field: "statut" },
      ]}
      searchFields={[
        "id_contrat", "id_employe", "type_contrat",
        "date_debut", "date_fin", "statut",
      ]}
    />
  );
}

export default ContratsList;