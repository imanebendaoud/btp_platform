from rest_framework import viewsets

from .models import Budget, Depense
from .serializers import BudgetSerializer, DepenseSerializer

from users.permissions import IsActionAllowed


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