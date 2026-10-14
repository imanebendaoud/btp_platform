from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db import transaction

from .models import (
    Fournisseur,
    Materiau,
    Achat,
    MouvementStock,
)

from .serializers import (
    FournisseurSerializer,
    MateriauSerializer,
    AchatSerializer,
    MouvementStockSerializer,
)

from users.permissions import (
    IsActionAllowed,
    check_project_access,
)


# ============================================================
# FOURNISSEURS
# ============================================================

class FournisseurViewSet(viewsets.ModelViewSet):

    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer

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

        # Création
        "create": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        # Modification
        "update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        "partial_update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        # Suppression
        "destroy": [
            "ADMINISTRATEUR",
        ],
    }


# ============================================================
# MATERIAUX
# ============================================================

class MateriauViewSet(viewsets.ModelViewSet):

    queryset = Materiau.objects.all()
    serializer_class = MateriauSerializer

    permission_classes = [
        IsActionAllowed,
    ]

    action_roles = {
        # Consultation
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

        # Gestion des matériaux réservée à Finance
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
# ACHATS
# ============================================================

class AchatViewSet(viewsets.ModelViewSet):

    queryset = Achat.objects.all()
    serializer_class = AchatSerializer

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

        # Création uniquement par Finance
        "create": [
            "RESPONSABLE_FINANCIER",
        ],

        # Modification uniquement par Finance
        "update": [
            "RESPONSABLE_FINANCIER",
        ],

        "partial_update": [
            "RESPONSABLE_FINANCIER",
        ],

        # Suppression uniquement par Finance
        "destroy": [
            "RESPONSABLE_FINANCIER",
        ],
    }


# ============================================================
# MOUVEMENTS DE STOCK
# ============================================================

class MouvementStockViewSet(viewsets.ModelViewSet):

    queryset = MouvementStock.objects.all()
    serializer_class = MouvementStockSerializer

    permission_classes = [
        IsActionAllowed,
    ]

    action_roles = {
        # Consultation
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

        # Création réservée au Chef et à Finance
        "create": [
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        # Modification réservée au Chef et à Finance
        "update": [
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "partial_update": [
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        # Suppression réservée à Finance
        "destroy": [
            "RESPONSABLE_FINANCIER",
        ],
    }

    # --------------------------------------------------------
    # FILTRAGE PAR CHANTIER
    # --------------------------------------------------------

    def get_queryset(self):

        user = self.request.user
        role = user.id_role.nom_role

        # Admin et Finance voient tous les mouvements
        if role in [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ]:
            return MouvementStock.objects.all()

        # Chef : uniquement les mouvements
        # de ses propres chantiers
        if role == "CHEF_CHANTIER":

            return MouvementStock.objects.filter(
                id_projet__id_chef_projet_id=user.id_utilisateur
            )

        return MouvementStock.objects.none()

    # --------------------------------------------------------
    # CREATION
    # --------------------------------------------------------

    def perform_create(self, serializer):

        user = self.request.user

        projet = serializer.validated_data.get("id_projet")
        materiau = serializer.validated_data.get("id_materiau")
        type_mouvement = serializer.validated_data.get("type_mouvement")
        quantite = serializer.validated_data.get("quantite")

        # Vérification du projet
        if projet is None:
            raise PermissionDenied(
                "Le projet est obligatoire."
            )

        if not check_project_access(user, projet):
            raise PermissionDenied(
                "Vous ne pouvez pas créer un mouvement de stock "
                "sur ce chantier."
            )

        # Vérification du matériau
        if materiau is None:
            raise ValidationError(
                "Le matériau est obligatoire."
            )

        # Vérification de la quantité
        if quantite is None or quantite <= 0:
            raise ValidationError(
                "La quantité doit être supérieure à zéro."
            )

        # Vérification du type
        if type_mouvement not in [
            "ENTREE",
            "SORTIE",
            "AJUSTEMENT",
        ]:
            raise ValidationError(
                "Type de mouvement invalide."
            )

        # ----------------------------------------------------
        # Mise à jour du stock
        # ----------------------------------------------------

        with transaction.atomic():

            # Verrouille le matériau pendant l'opération
            materiau = Materiau.objects.select_for_update().get(
                pk=materiau.pk
            )

            nouveau_stock = materiau.stock_actuel

            # ENTREE
            if type_mouvement == "ENTREE":

                nouveau_stock += quantite

            # SORTIE
            elif type_mouvement == "SORTIE":

                nouveau_stock -= quantite

                if nouveau_stock < 0:
                    raise ValidationError(
                        "Stock insuffisant pour effectuer cette sortie."
                    )

            # AJUSTEMENT
            elif type_mouvement == "AJUSTEMENT":

                nouveau_stock = quantite

            # Mise à jour du matériau
            materiau.stock_actuel = nouveau_stock

            materiau.save(
                update_fields=["stock_actuel"]
            )

            # Enregistrement du mouvement
            serializer.save(
                id_materiau=materiau
            )

    # --------------------------------------------------------
    # MODIFICATION
    # --------------------------------------------------------

    def perform_update(self, serializer):

        ancien_mouvement = self.get_object()

        user = self.request.user

        # Anciennes valeurs
        ancien_type = ancien_mouvement.type_mouvement
        ancienne_quantite = ancien_mouvement.quantite
        ancien_materiau = ancien_mouvement.id_materiau

        # Nouvelles valeurs
        nouveau_type = serializer.validated_data.get(
            "type_mouvement",
            ancien_type
        )

        nouvelle_quantite = serializer.validated_data.get(
            "quantite",
            ancienne_quantite
        )

        nouveau_materiau = serializer.validated_data.get(
            "id_materiau",
            ancien_materiau
        )

        nouveau_projet = serializer.validated_data.get(
            "id_projet",
            ancien_mouvement.id_projet
        )

        # ----------------------------------------------------
        # Vérification du projet
        # ----------------------------------------------------

        if nouveau_projet is None:
            raise PermissionDenied(
                "Le projet est obligatoire."
            )

        if not check_project_access(
            user,
            nouveau_projet
        ):
            raise PermissionDenied(
                "Vous ne pouvez pas modifier un mouvement de stock "
                "sur ce chantier."
            )

        # ----------------------------------------------------
        # Vérification du type
        # ----------------------------------------------------

        if nouveau_type not in [
            "ENTREE",
            "SORTIE",
            "AJUSTEMENT",
        ]:
            raise ValidationError(
                "Type de mouvement invalide."
            )

        # ----------------------------------------------------
        # Vérification de la quantité
        # ----------------------------------------------------

        if (
            nouvelle_quantite is None
            or nouvelle_quantite <= 0
        ):
            raise ValidationError(
                "La quantité doit être supérieure à zéro."
            )

        # ----------------------------------------------------
        # Transaction
        # ----------------------------------------------------

        with transaction.atomic():

            # Matériau concerné par l'ancien mouvement
            ancien_materiau = (
                Materiau.objects
                .select_for_update()
                .get(pk=ancien_materiau.pk)
            )

            # Matériau concerné par le nouveau mouvement
            if nouveau_materiau.pk == ancien_materiau.pk:

                nouveau_materiau_obj = ancien_materiau

            else:

                nouveau_materiau_obj = (
                    Materiau.objects
                    .select_for_update()
                    .get(pk=nouveau_materiau.pk)
                )

            # =================================================
            # 1. ANNULER L'ANCIEN MOUVEMENT
            # =================================================

            if ancien_type == "ENTREE":

                ancien_materiau.stock_actuel -= (
                    ancienne_quantite
                )

            elif ancien_type == "SORTIE":

                ancien_materiau.stock_actuel += (
                    ancienne_quantite
                )

            elif ancien_type == "AJUSTEMENT":

                raise ValidationError(
                    "La modification d'un mouvement "
                    "AJUSTEMENT n'est pas autorisée pour le moment."
                )

            # Vérification
            if ancien_materiau.stock_actuel < 0:

                raise ValidationError(
                    "La modification du mouvement "
                    "entraînerait un stock négatif."
                )

            ancien_materiau.save(
                update_fields=["stock_actuel"]
            )

            # =================================================
            # 2. APPLIQUER LE NOUVEAU MOUVEMENT
            # =================================================

            if nouveau_type == "ENTREE":

                nouveau_materiau_obj.stock_actuel += (
                    nouvelle_quantite
                )

            elif nouveau_type == "SORTIE":

                nouveau_stock = (
                    nouveau_materiau_obj.stock_actuel
                    - nouvelle_quantite
                )

                if nouveau_stock < 0:

                    raise ValidationError(
                        "Stock insuffisant pour effectuer "
                        "cette sortie."
                    )

                nouveau_materiau_obj.stock_actuel = (
                    nouveau_stock
                )

            elif nouveau_type == "AJUSTEMENT":

                nouveau_materiau_obj.stock_actuel = (
                    nouvelle_quantite
                )

            # Sauvegarde du nouveau stock
            nouveau_materiau_obj.save(
                update_fields=["stock_actuel"]
            )

            # Sauvegarde du mouvement
            serializer.save(
                id_materiau=nouveau_materiau_obj
            )

    # --------------------------------------------------------
    # SUPPRESSION
    # --------------------------------------------------------

    def perform_destroy(self, instance):

        type_mouvement = instance.type_mouvement
        quantite = instance.quantite
        materiau_id = instance.id_materiau_id

        with transaction.atomic():

            materiau = (
                Materiau.objects
                .select_for_update()
                .get(pk=materiau_id)
            )

            # =================================================
            # ANNULER L'EFFET DU MOUVEMENT
            # =================================================

            if type_mouvement == "ENTREE":

                materiau.stock_actuel -= quantite

            elif type_mouvement == "SORTIE":

                materiau.stock_actuel += quantite

            elif type_mouvement == "AJUSTEMENT":

                raise ValidationError(
                    "La suppression d'un mouvement "
                    "AJUSTEMENT n'est pas autorisée "
                    "pour le moment."
                )

            # Vérification
            if materiau.stock_actuel < 0:

                raise ValidationError(
                    "La suppression entraînerait "
                    "un stock négatif."
                )

            # Mise à jour du stock
            materiau.save(
                update_fields=["stock_actuel"]
            )

            # Suppression du mouvement
            instance.delete()