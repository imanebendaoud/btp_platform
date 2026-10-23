from django.contrib.auth import get_user_model
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from projects.models import Notification
from users.permissions import IsActionAllowed

from .models import (
    Equipement,
    AffectationEquipement,
    Maintenance,
    DemandeEquipement,
)

from .serializers import (
    EquipementSerializer,
    AffectationEquipementSerializer,
    MaintenanceSerializer,
    DemandeEquipementSerializer,
)


# ============================================================
# OUTILS : NOTIFICATIONS
# ============================================================

def _est_panne(etat):
    return "PANNE" in str(etat or "").upper()


def _notifier_admins(titre, message):
    """Notifie les administrateurs sans bloquer l'action principale."""
    try:
        User = get_user_model()

        admins = User.objects.filter(
            id_role__nom_role="ADMINISTRATEUR"
        )

        for admin in admins:
            Notification.objects.create(
                id_utilisateur=admin,
                id_projet=None,
                type="MAINTENANCE",
                titre=titre,
                message=message,
                date_creation=timezone.now(),
                lue=False,
            )

    except Exception as exc:
        print("Erreur notification maintenance :", exc)


def _notifier_utilisateurs(
    destinataires,
    titre,
    message,
    projet=None,
    type_notification="DEMANDE_EQUIPEMENT",
):
    """Envoie une notification à chaque destinataire."""
    try:
        for destinataire in destinataires:
            Notification.objects.create(
                id_utilisateur=destinataire,
                id_projet=projet,
                type=type_notification,
                titre=titre,
                message=message,
                date_creation=timezone.now(),
                lue=False,
            )

    except Exception as exc:
        print("Erreur notification :", exc)


# ============================================================
# ÉQUIPEMENTS
# ============================================================

class EquipementViewSet(viewsets.ModelViewSet):
    queryset = Equipement.objects.all()
    serializer_class = EquipementSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
            "CHEF_CHANTIER",
        ],
        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
            "CHEF_CHANTIER",
        ],
        "create": ["RESPONSABLE_MAINTENANCE"],
        "update": ["RESPONSABLE_MAINTENANCE"],
        "partial_update": ["RESPONSABLE_MAINTENANCE"],
        "destroy": ["RESPONSABLE_MAINTENANCE"],
    }

    def get_queryset(self):
        user = self.request.user

        queryset = Equipement.objects.all()

        role = getattr(
            getattr(user, "id_role", None),
            "nom_role",
            None,
        )

        if role == "CHEF_CHANTIER":
            queryset = queryset.filter(
                affectationequipement__id_projet__id_chef_projet_id=(
                    user.id_utilisateur
                )
            ).distinct()

        return queryset

    def perform_create(self, serializer):
        equipement = serializer.save()

        if _est_panne(equipement.etat):
            _notifier_admins(
                "Équipement en panne",
                (
                    f"L'équipement « {equipement.nom} » "
                    "a été enregistré en panne."
                ),
            )

    def perform_update(self, serializer):
        ancien_etat = serializer.instance.etat
        equipement = serializer.save()

        if (
            _est_panne(equipement.etat)
            and not _est_panne(ancien_etat)
        ):
            _notifier_admins(
                "Équipement en panne",
                (
                    f"L'équipement « {equipement.nom} » "
                    "vient d'être déclaré en panne."
                ),
            )


# ============================================================
# AFFECTATIONS DES ÉQUIPEMENTS
# ============================================================

class AffectationEquipementViewSet(viewsets.ModelViewSet):
    queryset = AffectationEquipement.objects.all()
    serializer_class = AffectationEquipementSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
            "CHEF_CHANTIER",
        ],
        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
            "CHEF_CHANTIER",
        ],
        "create": ["RESPONSABLE_MAINTENANCE"],
        "update": ["RESPONSABLE_MAINTENANCE"],
        "partial_update": ["RESPONSABLE_MAINTENANCE"],
        "destroy": ["RESPONSABLE_MAINTENANCE"],
    }

    def get_queryset(self):
        user = self.request.user

        queryset = AffectationEquipement.objects.select_related(
            "id_equipement",
            "id_projet",
        )

        role = getattr(
            getattr(user, "id_role", None),
            "nom_role",
            None,
        )

        if role == "CHEF_CHANTIER":
            queryset = queryset.filter(
                id_projet__id_chef_projet_id=user.id_utilisateur
            )

        return queryset


# ============================================================
# INTERVENTIONS DE MAINTENANCE
# ============================================================

class MaintenanceViewSet(viewsets.ModelViewSet):
    queryset = Maintenance.objects.all()
    serializer_class = MaintenanceSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
            "CHEF_CHANTIER",
        ],
        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
            "CHEF_CHANTIER",
        ],
        "create": ["RESPONSABLE_MAINTENANCE"],
        "update": ["RESPONSABLE_MAINTENANCE"],
        "partial_update": ["RESPONSABLE_MAINTENANCE"],
        "destroy": ["RESPONSABLE_MAINTENANCE"],
    }

    def get_queryset(self):
        user = self.request.user

        queryset = Maintenance.objects.select_related(
            "id_equipement"
        )

        role = getattr(
            getattr(user, "id_role", None),
            "nom_role",
            None,
        )

        if role == "CHEF_CHANTIER":
            queryset = queryset.filter(
                id_equipement__affectationequipement__id_projet__id_chef_projet_id=(
                    user.id_utilisateur
                )
            ).distinct()

        return queryset

    def perform_create(self, serializer):
        intervention = serializer.save()

        equipement = intervention.id_equipement

        type_interv = str(
            intervention.type_intervention or ""
        ).upper()

        # Éviter une notification en double lorsqu'une panne
        # a déjà été signalée pour cet équipement.
        if (
            type_interv.startswith("CORRECT")
            and _est_panne(equipement.etat)
        ):
            return

        libelle = (
            "corrective"
            if type_interv.startswith("CORRECT")
            else "préventive"
        )

        date_prevue = intervention.date_planifiee

        quand = (
            f" prévue le {date_prevue.strftime('%d/%m/%Y')}"
            if date_prevue
            else ""
        )

        _notifier_admins(
            f"Nouvelle intervention {libelle}",
            (
                f"Intervention {libelle} sur "
                f"« {equipement.nom} »{quand}."
            ),
        )

    def perform_update(self, serializer):
        ancien_statut = str(
            serializer.instance.statut or ""
        ).upper()

        intervention = serializer.save()

        nouveau_statut = str(
            intervention.statut or ""
        ).upper()

        if nouveau_statut == ancien_statut:
            return

        equipement = intervention.id_equipement

        if nouveau_statut.startswith("TERMIN"):
            cout = (
                f" Coût : {intervention.cout} DH."
                if intervention.cout
                else ""
            )

            _notifier_admins(
                "Intervention terminée",
                (
                    f"L'intervention sur « {equipement.nom} » "
                    f"est terminée.{cout}"
                ),
            )

        elif nouveau_statut.startswith("ANNUL"):
            _notifier_admins(
                "Intervention annulée",
                (
                    f"L'intervention sur « {equipement.nom} » "
                    "a été annulée."
                ),
            )


# ============================================================
# DEMANDES D'ÉQUIPEMENT
# ============================================================

class DemandeEquipementViewSet(viewsets.ModelViewSet):
    serializer_class = DemandeEquipementSerializer
    permission_classes = [IsActionAllowed]

    # Les demandes sont créées par les chefs et traitées
    # par le responsable maintenance.
    http_method_names = ["get", "post", "head", "options"]

    action_roles = {
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
            "CHEF_CHANTIER",
        ],
        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
            "CHEF_CHANTIER",
        ],
        "create": ["CHEF_CHANTIER"],
        "traiter": ["RESPONSABLE_MAINTENANCE"],
    }

    def get_queryset(self):
        user = self.request.user

        role = getattr(
            getattr(user, "id_role", None),
            "nom_role",
            None,
        )

        queryset = DemandeEquipement.objects.select_related(
            "id_projet",
            "id_chef",
        )

        # Le chef voit uniquement ses propres demandes.
        if role == "CHEF_CHANTIER":
            return queryset.filter(id_chef=user)

        # Maintenance et administration voient toutes les demandes.
        if role in (
            "RESPONSABLE_MAINTENANCE",
            "ADMINISTRATEUR",
        ):
            return queryset

        return queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        projet = serializer.validated_data["id_projet"]

        # Vérifier que le chantier appartient au chef connecté.
        if projet.id_chef_projet_id != user.id_utilisateur:
            raise PermissionDenied(
                "Vous ne pouvez demander du matériel que "
                "pour vos propres chantiers."
            )

        demande = serializer.save(
            id_chef=user,
            statut="EN_ATTENTE",
        )

        responsables = get_user_model().objects.filter(
            id_role__nom_role="RESPONSABLE_MAINTENANCE",
            actif=True,
        )

        _notifier_utilisateurs(
            destinataires=responsables,
            titre="Nouvelle demande d'équipement",
            message=(
                f"{user.prenom} {user.nom} demande "
                f"{demande.quantite} x {demande.nom_equipement} "
                f"pour le chantier {demande.id_projet.nom}."
            ),
            projet=demande.id_projet,
            type_notification="DEMANDE_EQUIPEMENT",
        )

    @action(detail=True, methods=["post"])
    def traiter(self, request, pk=None):
        demande = self.get_object()

        nouveau_statut = request.data.get("statut")

        commentaire = str(
            request.data.get("commentaire_decision", "")
        ).strip()

        statuts_autorises = {
            "EN_COURS",
            "ACCEPTEE",
            "REFUSEE",
        }

        if nouveau_statut not in statuts_autorises:
            return Response(
                {
                    "detail": (
                        "Statut invalide. Choisissez "
                        "EN_COURS, ACCEPTEE ou REFUSEE."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if nouveau_statut == "REFUSEE" and not commentaire:
            return Response(
                {
                    "detail": (
                        "Veuillez préciser le motif du refus."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Enregistrer la décision du responsable maintenance.
        demande.statut = nouveau_statut
        demande.commentaire_decision = commentaire or None
        demande.date_traitement = timezone.now()

        demande.save(
            update_fields=[
                "statut",
                "commentaire_decision",
                "date_traitement",
            ]
        )

        # Informer le chef de chantier de la décision.
        _notifier_utilisateurs(
            destinataires=[demande.id_chef],
            titre="Mise à jour de votre demande d'équipement",
            message=(
                f"Votre demande de {demande.nom_equipement} "
                f"pour {demande.id_projet.nom} a été traitée : "
                f"{demande.get_statut_display()}."
                + (
                    f" Motif : {commentaire}"
                    if commentaire
                    else ""
                )
            ),
            projet=demande.id_projet,
            type_notification="REPONSE_DEMANDE_EQUIPEMENT",
        )

        return Response(
            self.get_serializer(demande).data,
            status=status.HTTP_200_OK,
        )



