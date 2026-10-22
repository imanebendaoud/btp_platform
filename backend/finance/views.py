from decimal import Decimal, InvalidOperation

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from projects.models import Notification
from users.permissions import IsActionAllowed

from .models import Budget, Depense, DemandeFinancement
from .serializers import (
    BudgetSerializer,
    DepenseSerializer,
    DemandeFinancementSerializer,
)


# ============================================================
# BUDGETS
# ============================================================

class BudgetViewSet(viewsets.ModelViewSet):

    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer

    permission_classes = [
        IsActionAllowed,
    ]

    action_roles = {

        # Consultation
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        # Création : uniquement Finance
        "create": [
            "RESPONSABLE_FINANCIER",
        ],

        # Modification : uniquement Finance
        "update": [
            "RESPONSABLE_FINANCIER",
        ],

        "partial_update": [
            "RESPONSABLE_FINANCIER",
        ],

        # Suppression : uniquement Finance
        "destroy": [
            "RESPONSABLE_FINANCIER",
        ],
    }


# ============================================================
# DÉPENSES
# ============================================================

class DepenseViewSet(viewsets.ModelViewSet):

    queryset = Depense.objects.all()
    serializer_class = DepenseSerializer

    permission_classes = [
        IsActionAllowed,
    ]

    action_roles = {

        # Consultation
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        # Création : uniquement Finance
        "create": [
            "RESPONSABLE_FINANCIER",
        ],

        # Modification : uniquement Finance
        "update": [
            "RESPONSABLE_FINANCIER",
        ],

        "partial_update": [
            "RESPONSABLE_FINANCIER",
        ],

        # Suppression : uniquement Finance
        "destroy": [
            "RESPONSABLE_FINANCIER",
        ],
    }


# ============================================================
# DEMANDES DE FINANCEMENT
# ============================================================

def _dh(montant):
    return f"{Decimal(montant):,.0f}".replace(",", " ") + " DH"


def _notifier(destinataires, titre, message, projet=None):
    """Crée une notification FINANCE par destinataire (n'interrompt jamais l'action)."""
    try:
        for dest in destinataires:
            Notification.objects.create(
                id_utilisateur=dest,
                id_projet=projet,
                type="FINANCE",
                titre=titre,
                message=message,
                date_creation=timezone.now(),
                lue=False,
            )
    except Exception as exc:
        print("Erreur notification demande de financement :", exc)


def _utilisateurs_du_role(nom_role):
    return list(get_user_model().objects.filter(id_role__nom_role=nom_role))


MOTIFS = {
    "ACHAT_EQUIPEMENT": "Achat d'équipement",
    "REPARATION": "Réparation",
    "PIECES_DETACHEES": "Pièces détachées",
    "MAINTENANCE_PREVENTIVE": "Maintenance préventive",
}


class DemandeFinancementViewSet(viewsets.ModelViewSet):
    serializer_class = DemandeFinancementSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": ["ADMINISTRATEUR", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_FINANCIER"],
        "retrieve": ["ADMINISTRATEUR", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_FINANCIER"],
        "create": ["RESPONSABLE_MAINTENANCE"],
        "update": ["RESPONSABLE_MAINTENANCE"],
        "partial_update": ["RESPONSABLE_MAINTENANCE"],
        "destroy": ["RESPONSABLE_MAINTENANCE"],
        "valider": ["RESPONSABLE_FINANCIER"],
        "refuser": ["RESPONSABLE_FINANCIER"],
    }

    def get_queryset(self):
        user = self.request.user
        qs = DemandeFinancement.objects.select_related(
            "id_equipement", "id_projet", "id_demandeur", "id_decideur"
        ).order_by("-date_demande")

        # Le responsable maintenance ne voit que ses propres demandes
        if user.id_role.nom_role == "RESPONSABLE_MAINTENANCE":
            return qs.filter(id_demandeur_id=user.id_utilisateur)
        return qs

    def _exiger_en_attente(self, demande):
        if demande.statut != "EN_ATTENTE":
            raise ValidationError({"detail": "Cette demande a déjà été traitée."})

    def perform_create(self, serializer):
        demande = serializer.save(
            id_demandeur=self.request.user,
            statut="EN_ATTENTE",
            date_demande=timezone.now(),
        )
        urgent = " (URGENTE)" if demande.urgence == "URGENTE" else ""
        _notifier(
            _utilisateurs_du_role("RESPONSABLE_FINANCIER"),
            f"Nouvelle demande de financement{urgent}",
            f"{_dh(demande.montant_demande)} demandés pour « {demande.id_equipement.nom} » "
            f"({MOTIFS.get(demande.motif, demande.motif)}), projet « {demande.id_projet.nom} ».",
            projet=demande.id_projet,
        )

    def perform_update(self, serializer):
        self._exiger_en_attente(serializer.instance)
        serializer.save()

    def perform_destroy(self, instance):
        self._exiger_en_attente(instance)
        instance.delete()

    @action(detail=True, methods=["post"])
    def valider(self, request, pk=None):
        demande = self.get_object()
        self._exiger_en_attente(demande)

        brut = request.data.get("montant_accorde")
        try:
            montant = Decimal(str(brut)) if brut not in (None, "") else demande.montant_demande
        except InvalidOperation:
            raise ValidationError({"detail": "Montant accordé invalide."})
        if montant <= 0:
            raise ValidationError({"detail": "Le montant accordé doit être supérieur à 0."})

        commentaire = (request.data.get("commentaire") or "").strip() or None

        with transaction.atomic():
            depense = Depense.objects.create(
                id_projet=demande.id_projet,
                categorie="Équipements",
                description=(
                    f"{MOTIFS.get(demande.motif, demande.motif)} - "
                    f"{demande.id_equipement.nom} (demande #{demande.id_demande})"
                ),
                montant=montant,
                date_depense=timezone.localdate(),
                justification=demande.justification,
                piece_justificative=None,
            )
            demande.statut = "VALIDEE"
            demande.montant_accorde = montant
            demande.commentaire_decision = commentaire
            demande.id_decideur = request.user
            demande.date_decision = timezone.now()
            demande.id_depense = depense
            demande.save()

        # Demandeur
        _notifier(
            [demande.id_demandeur],
            "Demande de financement validée",
            f"Votre demande pour « {demande.id_equipement.nom} » est validée : "
            f"{_dh(montant)} accordés."
            + (f" Commentaire : {commentaire}" if commentaire else ""),
            projet=demande.id_projet,
        )
        # Admins : uniquement l'information qu'une dépense est déclenchée
        _notifier(
            _utilisateurs_du_role("ADMINISTRATEUR"),
            "Dépense déclenchée",
            f"Une dépense de {_dh(montant)} a été créée pour « {demande.id_equipement.nom} » "
            f"sur le projet « {demande.id_projet.nom} ».",
            projet=demande.id_projet,
        )

        return Response(self.get_serializer(demande).data)

    @action(detail=True, methods=["post"])
    def refuser(self, request, pk=None):
        demande = self.get_object()
        self._exiger_en_attente(demande)

        commentaire = (request.data.get("commentaire") or "").strip()
        if not commentaire:
            raise ValidationError({"detail": "Un commentaire est obligatoire pour refuser."})

        demande.statut = "REFUSEE"
        demande.commentaire_decision = commentaire
        demande.id_decideur = request.user
        demande.date_decision = timezone.now()
        demande.save()

        _notifier(
            [demande.id_demandeur],
            "Demande de financement refusée",
            f"Votre demande pour « {demande.id_equipement.nom} » est refusée. "
            f"Motif : {commentaire}",
            projet=demande.id_projet,
        )

        return Response(self.get_serializer(demande).data)