from django.utils import timezone

from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied

from projects.models import Notification
from users.models import Utilisateur
from users.permissions import IsActionAllowed

from .models import (
    Employe,
    AffectationEmploye,
    Contrat,
    CongeAbsence,
    Pointage,
)

from .serializers import (
    EmployeSerializer,
    AffectationEmployeSerializer,
    ContratSerializer,
    CongeAbsenceSerializer,
    PointageSerializer,
)


# ============================================================
# EMPLOYÉS
# ============================================================

class EmployeViewSet(viewsets.ModelViewSet):
    queryset = Employe.objects.all()
    serializer_class = EmployeSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "retrieve": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "create": ["RESPONSABLE_RH"],
        "update": ["RESPONSABLE_RH"],
        "partial_update": ["RESPONSABLE_RH"],
        "destroy": ["RESPONSABLE_RH"],
    }


# ============================================================
# AFFECTATIONS DES EMPLOYÉS
# ============================================================

class AffectationEmployeViewSet(viewsets.ModelViewSet):
    serializer_class = AffectationEmployeSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
            "CHEF_CHANTIER",
        ],
        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
            "CHEF_CHANTIER",
        ],
        "create": [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
        ],
        "update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
        ],
        "partial_update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
        ],
        "destroy": ["ADMINISTRATEUR"],
    }

    def get_queryset(self):
        user = self.request.user

        queryset = AffectationEmploye.objects.select_related(
            "id_employe",
            "id_projet",
        )

        role = getattr(
            getattr(user, "id_role", None),
            "nom_role",
            None,
        )

        # Administrateur et responsable RH :
        # consultation de toutes les affectations.
        if role in ("ADMINISTRATEUR", "RESPONSABLE_RH"):
            return queryset

        # Chef de chantier :
        # consultation des affectations de ses propres projets.
        if role == "CHEF_CHANTIER":
            return queryset.filter(
                id_projet__id_chef_projet=user
            )

        return queryset.none()

    def perform_create(self, serializer):
        role = getattr(
            getattr(self.request.user, "id_role", None),
            "nom_role",
            None,
        )

        if role not in ("ADMINISTRATEUR", "RESPONSABLE_RH"):
            raise PermissionDenied(
                "Seuls le responsable RH et l'administrateur "
                "peuvent affecter des employés."
            )

        serializer.save()


# ============================================================
# CONTRATS
# ============================================================

class ContratViewSet(viewsets.ModelViewSet):
    queryset = Contrat.objects.all()
    serializer_class = ContratSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "retrieve": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "create": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "update": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "partial_update": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "destroy": ["ADMINISTRATEUR"],
    }


# ============================================================
# CONGÉS ET ABSENCES
# ============================================================

class CongeAbsenceViewSet(viewsets.ModelViewSet):
    queryset = CongeAbsence.objects.all()
    serializer_class = CongeAbsenceSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "retrieve": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "create": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "update": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "partial_update": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "destroy": ["ADMINISTRATEUR"],
    }

    def _notifier_admins(self, titre, message):
        admins = Utilisateur.objects.filter(
            id_role__nom_role="ADMINISTRATEUR"
        )

        for admin in admins:
            Notification.objects.create(
                id_utilisateur=admin,
                id_projet=None,
                type="RH",
                titre=titre,
                message=message,
                date_creation=timezone.now(),
                lue=False,
            )

    def perform_create(self, serializer):
        conge = serializer.save()
        employe = conge.id_employe

        self._notifier_admins(
            f"Nouvelle demande de congé : "
            f"{employe.prenom} {employe.nom}",
            f"Du {conge.date_debut} au {conge.date_fin} "
            f"({conge.type}).",
        )

    def perform_update(self, serializer):
        ancien_statut = serializer.instance.statut
        conge = serializer.save()

        if (
            conge.statut != ancien_statut
            and conge.statut in ("VALIDE", "REFUSE")
        ):
            employe = conge.id_employe

            decision = (
                "validé"
                if conge.statut == "VALIDE"
                else "refusé"
            )

            self._notifier_admins(
                f"Congé {decision} : "
                f"{employe.prenom} {employe.nom}",
                f"Du {conge.date_debut} au {conge.date_fin} "
                f"({conge.type}).",
            )


# ============================================================
# POINTAGES
# ============================================================

class PointageViewSet(viewsets.ModelViewSet):
    queryset = Pointage.objects.all()
    serializer_class = PointageSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "retrieve": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "create": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "update": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "partial_update": ["ADMINISTRATEUR", "RESPONSABLE_RH"],
        "destroy": ["ADMINISTRATEUR"],

    }


