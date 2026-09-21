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


class DepenseViewSet(viewsets.ModelViewSet):

    queryset = Depense.objects.all()
    serializer_class = DepenseSerializer

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