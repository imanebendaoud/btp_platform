import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { getContrat } from "../../../services/hrService";
import HRResourceDetail from "./HRResourceDetail";

function ContratDetail() {
  const { id } = useParams();
  const load = useCallback((value) => getContrat(value), []);

  return (
    <HRResourceDetail
      id={id}
      title={`Contrat #${id}`}
      backPath="/admin/rh/contrats"
      getData={load}
      fields={[
        { label: "Identifiant", key: "id_contrat" },
        { label: "Employé (ID)", key: "id_employe" },
        { label: "Type de contrat", key: "type_contrat" },
        { label: "Date de début", key: "date_debut" },
        { label: "Date de fin", key: "date_fin" },
        { label: "Salaire (DH)", key: "salaire" },
        { label: "Statut", key: "statut" },
      ]}
    />
  );
}

export default ContratDetail;