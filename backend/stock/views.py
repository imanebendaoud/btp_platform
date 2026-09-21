from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied

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

        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        "create": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        "update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        "partial_update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

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

        "create": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        "update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        "partial_update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        "destroy": [
            "ADMINISTRATEUR",
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

        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        "create": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        "update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        "partial_update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ],

        "destroy": [
            "ADMINISTRATEUR",
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

        "create": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "update": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "partial_update": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "destroy": [
            "ADMINISTRATEUR",
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

        if projet is None:
            raise PermissionDenied(
                "Le projet est obligatoire."
            )

        if not check_project_access(user, projet):

            raise PermissionDenied(
                "Vous ne pouvez pas créer un mouvement de stock sur ce chantier."
            )

        serializer.save()