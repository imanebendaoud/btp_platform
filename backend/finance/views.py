from decimal import Decimal, InvalidOperation

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied
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
# OUTILS COMMUNS
# ============================================================

def _dh(montant):
    """Formate un montant en dirhams marocains."""
    montant = Decimal(str(montant))
    return f"{montant:,.2f}".replace(",", " ") + " DH"


def _notifier(destinataires, titre, message, projet=None):
    """
    Crée une notification pour chaque destinataire.
    Une erreur de notification ne doit pas interrompre
    l'opération financière principale.
    """
    try:
        for destinataire in destinataires:
            Notification.objects.create(
                id_utilisateur=destinataire,
                id_projet=projet,
                type="FINANCE",
                titre=titre,
                message=message,
                date_creation=timezone.now(),
                lue=False,
            )
    except Exception as exc:
        print("Erreur notification finance :", exc)


def _utilisateurs_du_role(nom_role):
    """Récupère les utilisateurs associés à un rôle."""
    User = get_user_model()

    return list(
        User.objects.filter(
            id_role__nom_role=nom_role,
            actif=True,
        )
    )


MOTIFS = {
    "ACHAT_EQUIPEMENT": "Achat d'équipement",
    "REPARATION": "Réparation",
    "PIECES_DETACHEES": "Pièces détachées",
    "MAINTENANCE_PREVENTIVE": "Maintenance préventive",
}


# ============================================================
# BUDGETS
# ============================================================

class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.select_related("id_projet").all()
    serializer_class = BudgetSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],
        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],
        "create": [
            "RESPONSABLE_FINANCIER",
        ],
        "update": [
            "RESPONSABLE_FINANCIER",
        ],
        "partial_update": [
            "RESPONSABLE_FINANCIER",
        ],
        "destroy": [
            "RESPONSABLE_FINANCIER",
        ],
    }

    def perform_create(self, serializer):
        projet = serializer.validated_data["id_projet"]

        # Un seul budget est autorisé par chantier.
        if Budget.objects.filter(id_projet=projet).exists():
            raise ValidationError({
                "id_projet": (
                    "Un budget existe déjà pour ce chantier."
                )
            })

        serializer.save()


# ============================================================
# DÉPENSES
# ============================================================

class DepenseViewSet(viewsets.ModelViewSet):
    queryset = Depense.objects.select_related("id_projet").all()
    serializer_class = DepenseSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],
        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],
        "create": [
            "RESPONSABLE_FINANCIER",
        ],
        "update": [
            "RESPONSABLE_FINANCIER",
        ],
        "partial_update": [
            "RESPONSABLE_FINANCIER",
        ],
        "destroy": [
            "RESPONSABLE_FINANCIER",
        ],
    }


# ============================================================
# DEMANDES DE FINANCEMENT
# ============================================================

class DemandeFinancementViewSet(viewsets.ModelViewSet):
    serializer_class = DemandeFinancementSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
            "RESPONSABLE_FINANCIER",
        ],
        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
            "RESPONSABLE_FINANCIER",
        ],
        "create": [
            "RESPONSABLE_MAINTENANCE",
        ],
        "update": [
            "RESPONSABLE_MAINTENANCE",
        ],
        "partial_update": [
            "RESPONSABLE_MAINTENANCE",
        ],
        "destroy": [
            "RESPONSABLE_MAINTENANCE",
        ],
        "valider": [
            "RESPONSABLE_FINANCIER",
        ],
        "refuser": [
            "RESPONSABLE_FINANCIER",
        ],
    }

    def get_queryset(self):
        user = self.request.user

        queryset = DemandeFinancement.objects.select_related(
            "id_equipement",
            "id_maintenance",
            "id_projet",
            "id_demandeur",
            "id_decideur",
            "id_depense",
        ).order_by("-date_demande")

        # Le responsable maintenance ne voit que ses demandes.
        if (
            user.is_authenticated
            and user.id_role.nom_role == "RESPONSABLE_MAINTENANCE"
        ):
            return queryset.filter(
                id_demandeur_id=user.pk
            )

        return queryset

    def _exiger_en_attente(self, demande):
        if demande.statut != "EN_ATTENTE":
            raise ValidationError({
                "detail": "Cette demande a déjà été traitée."
            })

    def _verifier_proprietaire(self, demande):
        """
        Empêche un responsable maintenance de modifier ou supprimer
        la demande d'un autre utilisateur.
        """
        user = self.request.user

        if user.id_role.nom_role != "RESPONSABLE_MAINTENANCE":
            raise PermissionDenied(
                "Vous n'êtes pas autorisé à effectuer cette opération."
            )

        if demande.id_demandeur_id != user.pk:
            raise PermissionDenied(
                "Vous ne pouvez gérer que vos propres demandes."
            )

    def perform_create(self, serializer):
        demande = serializer.save(
            id_demandeur=self.request.user,
            statut="EN_ATTENTE",
            date_demande=timezone.now(),
        )

        urgence = (
            " (URGENTE)"
            if demande.urgence == "URGENTE"
            else ""
        )

        _notifier(
            _utilisateurs_du_role("RESPONSABLE_FINANCIER"),
            f"Nouvelle demande de financement{urgence}",
            (
                f"{_dh(demande.montant_demande)} demandés pour "
                f"« {demande.id_equipement.nom} » "
                f"({MOTIFS.get(demande.motif, demande.motif)}), "
                f"projet « {demande.id_projet.nom} »."
            ),
            projet=demande.id_projet,
        )

    def perform_update(self, serializer):
        demande = serializer.instance

        self._verifier_proprietaire(demande)
        self._exiger_en_attente(demande)

        # Les champs protégés sont également en lecture seule
        # dans le serializer.
        serializer.save()

    def perform_destroy(self, instance):
        self._verifier_proprietaire(instance)
        self._exiger_en_attente(instance)
        instance.delete()

    # --------------------------------------------------------
    # VALIDATION D'UNE DEMANDE
    # POST /api/finance/demandes-financement/{id}/valider/
    # --------------------------------------------------------

    @action(detail=True, methods=["post"])
    def valider(self, request, pk=None):
        demande = self.get_object()
        self._exiger_en_attente(demande)

        montant_brut = request.data.get("montant_accorde")

        try:
            montant = (
                Decimal(str(montant_brut))
                if montant_brut not in (None, "")
                else demande.montant_demande
            )
        except (InvalidOperation, ValueError, TypeError):
            raise ValidationError({
                "montant_accorde": "Le montant accordé est invalide."
            })

        if not montant.is_finite() or montant <= 0:
            raise ValidationError({
                "montant_accorde": (
                    "Le montant accordé doit être supérieur à zéro."
                )
            })

        commentaire = (
            request.data.get("commentaire") or ""
        ).strip() or None

        with transaction.atomic():
            depense = Depense.objects.create(
                id_projet=demande.id_projet,
                categorie="Équipements",
                description=(
                    f"{MOTIFS.get(demande.motif, demande.motif)} - "
                    f"{demande.id_equipement.nom} "
                    f"(demande #{demande.id_demande})"
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

        # Notification au demandeur.
        _notifier(
            [demande.id_demandeur],
            "Demande de financement validée",
            (
                f"Votre demande pour « {demande.id_equipement.nom} » "
                f"a été validée. Montant accordé : {_dh(montant)}."
                + (
                    f" Commentaire : {commentaire}"
                    if commentaire
                    else ""
                )
            ),
            projet=demande.id_projet,
        )

        # Notification aux administrateurs.
        _notifier(
            _utilisateurs_du_role("ADMINISTRATEUR"),
            "Dépense déclenchée",
            (
                f"Une dépense de {_dh(montant)} a été créée pour "
                f"« {demande.id_equipement.nom} » sur le projet "
                f"« {demande.id_projet.nom} »."
            ),
            projet=demande.id_projet,
        )

        return Response(
            self.get_serializer(demande).data
        )

    # --------------------------------------------------------
    # REFUS D'UNE DEMANDE
    # POST /api/finance/demandes-financement/{id}/refuser/
    # --------------------------------------------------------

    @action(detail=True, methods=["post"])
    def refuser(self, request, pk=None):
        demande = self.get_object()
        self._exiger_en_attente(demande)

        commentaire = (
            request.data.get("commentaire") or ""
        ).strip()

        if not commentaire:
            raise ValidationError({
                "commentaire": (
                    "Un commentaire est obligatoire pour refuser."
                )
            })

        demande.statut = "REFUSEE"
        demande.commentaire_decision = commentaire
        demande.id_decideur = request.user
        demande.date_decision = timezone.now()
        demande.save()

        _notifier(
            [demande.id_demandeur],
            "Demande de financement refusée",
            (
                f"Votre demande pour « {demande.id_equipement.nom} » "
                f"a été refusée. Motif : {commentaire}"
            ),
            projet=demande.id_projet,
        )

        return Response(
            self.get_serializer(demande).data
        )
