from django.db import transaction
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from .models import (
    Fournisseur,
    Materiau,
    Achat,
    MouvementStock,
    DemandeMateriau,
)

from .serializers import (
    FournisseurSerializer,
    MateriauSerializer,
    AchatSerializer,
    MouvementStockSerializer,
    DemandeMateriauSerializer,
)

from users.permissions import IsActionAllowed, check_project_access


# ============================================================
# FOURNISSEURS
# ============================================================

class FournisseurViewSet(viewsets.ModelViewSet):
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": ["ADMINISTRATEUR", "RESPONSABLE_FINANCIER"],
        "retrieve": ["ADMINISTRATEUR", "RESPONSABLE_FINANCIER"],
        "create": ["ADMINISTRATEUR", "RESPONSABLE_FINANCIER"],
        "update": ["ADMINISTRATEUR", "RESPONSABLE_FINANCIER"],
        "partial_update": ["ADMINISTRATEUR", "RESPONSABLE_FINANCIER"],
        "destroy": ["ADMINISTRATEUR"],
    }


# ============================================================
# MATERIAUX
# ============================================================

class MateriauViewSet(viewsets.ModelViewSet):
    queryset = Materiau.objects.all()
    serializer_class = MateriauSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],
        "retrieve": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],
        "create": ["RESPONSABLE_FINANCIER"],
        "update": ["RESPONSABLE_FINANCIER"],
        "partial_update": ["RESPONSABLE_FINANCIER"],
        "destroy": ["RESPONSABLE_FINANCIER"],
    }


# ============================================================
# ACHATS
# ============================================================

class AchatViewSet(viewsets.ModelViewSet):
    queryset = Achat.objects.all()
    serializer_class = AchatSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": ["ADMINISTRATEUR", "RESPONSABLE_FINANCIER"],
        "retrieve": ["ADMINISTRATEUR", "RESPONSABLE_FINANCIER"],
        "create": ["RESPONSABLE_FINANCIER"],
        "update": ["RESPONSABLE_FINANCIER"],
        "partial_update": ["RESPONSABLE_FINANCIER"],
        "destroy": ["RESPONSABLE_FINANCIER"],
    }


# ============================================================
# MOUVEMENTS DE STOCK
# ============================================================

class MouvementStockViewSet(viewsets.ModelViewSet):
    queryset = MouvementStock.objects.all()
    serializer_class = MouvementStockSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],
        "retrieve": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],
        "create": ["CHEF_CHANTIER", "RESPONSABLE_FINANCIER"],
        "update": ["CHEF_CHANTIER", "RESPONSABLE_FINANCIER"],
        "partial_update": ["CHEF_CHANTIER", "RESPONSABLE_FINANCIER"],
        "destroy": ["RESPONSABLE_FINANCIER"],
    }

    def get_queryset(self):
        user = self.request.user
        role = user.id_role.nom_role

        if role in ["ADMINISTRATEUR", "RESPONSABLE_FINANCIER"]:
            return MouvementStock.objects.all()

        if role == "CHEF_CHANTIER":
            return MouvementStock.objects.filter(
                id_projet__id_chef_projet_id=user.id_utilisateur
            )

        return MouvementStock.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        projet = serializer.validated_data.get("id_projet")
        materiau = serializer.validated_data.get("id_materiau")
        type_mouvement = serializer.validated_data.get("type_mouvement")
        quantite = serializer.validated_data.get("quantite")

        if projet is None:
            raise ValidationError({"id_projet": "Le projet est obligatoire."})

        if not check_project_access(user, projet):
            raise PermissionDenied(
                "Vous ne pouvez pas créer un mouvement de stock sur ce chantier."
            )

        if materiau is None:
            raise ValidationError({"id_materiau": "Le matériau est obligatoire."})

        if quantite is None or quantite <= 0:
            raise ValidationError(
                {"quantite": "La quantité doit être supérieure à zéro."}
            )

        if type_mouvement not in ["ENTREE", "SORTIE", "AJUSTEMENT"]:
            raise ValidationError({"type_mouvement": "Type de mouvement invalide."})

        with transaction.atomic():
            materiau = Materiau.objects.select_for_update().get(pk=materiau.pk)
            nouveau_stock = materiau.stock_actuel

            if type_mouvement == "ENTREE":
                nouveau_stock += quantite

            elif type_mouvement == "SORTIE":
                nouveau_stock -= quantite
                if nouveau_stock < 0:
                    raise ValidationError(
                        "Stock insuffisant pour effectuer cette sortie."
                    )

            elif type_mouvement == "AJUSTEMENT":
                nouveau_stock = quantite

            materiau.stock_actuel = nouveau_stock
            materiau.save(update_fields=["stock_actuel"])
            serializer.save(id_materiau=materiau)

    def perform_update(self, serializer):
        ancien_mouvement = self.get_object()
        user = self.request.user

        ancien_type = ancien_mouvement.type_mouvement
        ancienne_quantite = ancien_mouvement.quantite
        ancien_materiau = ancien_mouvement.id_materiau

        nouveau_type = serializer.validated_data.get(
            "type_mouvement", ancien_type
        )
        nouvelle_quantite = serializer.validated_data.get(
            "quantite", ancienne_quantite
        )
        nouveau_materiau = serializer.validated_data.get(
            "id_materiau", ancien_materiau
        )
        nouveau_projet = serializer.validated_data.get(
            "id_projet", ancien_mouvement.id_projet
        )

        if nouveau_projet is None:
            raise ValidationError({"id_projet": "Le projet est obligatoire."})

        if not check_project_access(user, nouveau_projet):
            raise PermissionDenied(
                "Vous ne pouvez pas modifier un mouvement de stock sur ce chantier."
            )

        if nouveau_type not in ["ENTREE", "SORTIE", "AJUSTEMENT"]:
            raise ValidationError({"type_mouvement": "Type de mouvement invalide."})

        if nouvelle_quantite is None or nouvelle_quantite <= 0:
            raise ValidationError(
                {"quantite": "La quantité doit être supérieure à zéro."}
            )

        with transaction.atomic():
            ancien_materiau = (
                Materiau.objects.select_for_update().get(pk=ancien_materiau.pk)
            )

            if nouveau_materiau.pk == ancien_materiau.pk:
                nouveau_materiau_obj = ancien_materiau
            else:
                nouveau_materiau_obj = (
                    Materiau.objects.select_for_update().get(
                        pk=nouveau_materiau.pk
                    )
                )

            # Annuler l'effet de l'ancien mouvement.
            if ancien_type == "ENTREE":
                ancien_materiau.stock_actuel -= ancienne_quantite

            elif ancien_type == "SORTIE":
                ancien_materiau.stock_actuel += ancienne_quantite

            elif ancien_type == "AJUSTEMENT":
                raise ValidationError(
                    "La modification d'un mouvement AJUSTEMENT "
                    "n'est pas autorisée pour le moment."
                )

            if ancien_materiau.stock_actuel < 0:
                raise ValidationError(
                    "La modification du mouvement entraînerait un stock négatif."
                )

            ancien_materiau.save(update_fields=["stock_actuel"])

            # Appliquer le nouveau mouvement.
            if nouveau_type == "ENTREE":
                nouveau_materiau_obj.stock_actuel += nouvelle_quantite

            elif nouveau_type == "SORTIE":
                nouveau_stock = (
                    nouveau_materiau_obj.stock_actuel - nouvelle_quantite
                )

                if nouveau_stock < 0:
                    raise ValidationError(
                        "Stock insuffisant pour effectuer cette sortie."
                    )

                nouveau_materiau_obj.stock_actuel = nouveau_stock

            elif nouveau_type == "AJUSTEMENT":
                nouveau_materiau_obj.stock_actuel = nouvelle_quantite

            nouveau_materiau_obj.save(update_fields=["stock_actuel"])
            serializer.save(id_materiau=nouveau_materiau_obj)

    def perform_destroy(self, instance):
        type_mouvement = instance.type_mouvement
        quantite = instance.quantite
        materiau_id = instance.id_materiau_id

        with transaction.atomic():
            materiau = (
                Materiau.objects.select_for_update().get(pk=materiau_id)
            )

            # Annuler l'effet du mouvement supprimé.
            if type_mouvement == "ENTREE":
                materiau.stock_actuel -= quantite

            elif type_mouvement == "SORTIE":
                materiau.stock_actuel += quantite

            elif type_mouvement == "AJUSTEMENT":
                raise ValidationError(
                    "La suppression d'un mouvement AJUSTEMENT "
                    "n'est pas autorisée pour le moment."
                )

            if materiau.stock_actuel < 0:
                raise ValidationError(
                    "La suppression entraînerait un stock négatif."
                )

            materiau.save(update_fields=["stock_actuel"])
            instance.delete()


# ============================================================
# DEMANDES DE MATERIAUX
# ============================================================

class DemandeMateriauViewSet(viewsets.ModelViewSet):
    serializer_class = DemandeMateriauSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": [
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
            "ADMINISTRATEUR",
        ],
        "retrieve": [
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
            "ADMINISTRATEUR",
        ],
        "create": ["CHEF_CHANTIER"],
        "update": ["CHEF_CHANTIER"],
        "partial_update": ["CHEF_CHANTIER"],
        "destroy": ["CHEF_CHANTIER", "ADMINISTRATEUR"],
        "traiter": ["RESPONSABLE_FINANCIER", "ADMINISTRATEUR"],
    }

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated or not getattr(user, "actif", False):
            return DemandeMateriau.objects.none()

        role = getattr(getattr(user, "id_role", None), "nom_role", None)

        if role == "CHEF_CHANTIER":
            return DemandeMateriau.objects.filter(
                id_chef_id=user.id_utilisateur
            ).order_by("-date_creation")

        if role in ["RESPONSABLE_FINANCIER", "ADMINISTRATEUR"]:
            return DemandeMateriau.objects.all().order_by("-date_creation")

        return DemandeMateriau.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        projet = serializer.validated_data.get("id_projet")

        if projet is None:
            raise ValidationError({"id_projet": "Le chantier est obligatoire."})

        if projet.id_chef_projet_id != user.id_utilisateur:
            raise PermissionDenied(
                "Vous ne pouvez demander des matériaux que pour vos propres chantiers."
            )

        serializer.save(
            id_chef=user,
            date_creation=timezone.now(),
        )

    def perform_update(self, serializer):
        demande = self.get_object()

        if demande.statut != "EN_ATTENTE":
            raise ValidationError(
                "Seules les demandes en attente peuvent être modifiées."
            )

        projet = serializer.validated_data.get(
            "id_projet", demande.id_projet
        )

        if projet.id_chef_projet_id != self.request.user.id_utilisateur:
            raise PermissionDenied(
                "Vous ne pouvez modifier une demande que pour vos propres chantiers."
            )

        serializer.save(
            id_chef=demande.id_chef,
            statut=demande.statut,
            commentaire_decision=demande.commentaire_decision,
            date_traitement=demande.date_traitement,
        )

    def perform_destroy(self, instance):
        if instance.statut != "EN_ATTENTE":
            raise ValidationError(
                "Seules les demandes en attente peuvent être supprimées."
            )

        instance.delete()

    @action(detail=True, methods=["post"])
    def traiter(self, request, pk=None):
        """
        POST /api/stock/demandes-materiaux/{id}/traiter/

        Exemple de JSON :
        {
            "decision": "ACCEPTEE",
            "commentaire_decision": "Demande validée"
        }
        """
        demande = self.get_object()

        if demande.statut != "EN_ATTENTE":
            raise ValidationError(
                "Cette demande a déjà été traitée."
            )

        decision = request.data.get("decision")
        commentaire = request.data.get("commentaire_decision", "")

        if decision not in ["ACCEPTEE", "REFUSEE"]:
            raise ValidationError({
                "decision": "La décision doit être ACCEPTEE ou REFUSEE."
            })

        demande.statut = decision
        demande.commentaire_decision = commentaire
        demande.date_traitement = timezone.now()

        demande.save(update_fields=[
            "statut",
            "commentaire_decision",
            "date_traitement",
        ])

        return Response(
            self.get_serializer(demande).data,
            status=status.HTTP_200_OK,
        )