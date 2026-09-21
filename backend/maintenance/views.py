from rest_framework import viewsets

from .models import (
    Equipement,
    AffectationEquipement,
    Maintenance,
)

from .serializers import (
    EquipementSerializer,
    AffectationEquipementSerializer,
    MaintenanceSerializer,
)

from users.permissions import IsActionAllowed


class EquipementViewSet(viewsets.ModelViewSet):
    queryset = Equipement.objects.all()
    serializer_class = EquipementSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        # Consulter les équipements
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ],

        # Ajouter un équipement
        "create": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ],

        # Modifier
        "update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ],

        "partial_update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ],

        # Suppression
        "destroy": [
            "ADMINISTRATEUR",
        ],
    }


class AffectationEquipementViewSet(viewsets.ModelViewSet):
    queryset = AffectationEquipement.objects.all()
    serializer_class = AffectationEquipementSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        # Consulter les affectations
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ],

        # Affecter un équipement
        "create": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ],

        # Modifier une affectation
        "update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ],

        "partial_update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ],

        # Suppression
        "destroy": [
            "ADMINISTRATEUR",
        ],
    }


class MaintenanceViewSet(viewsets.ModelViewSet):
    queryset = Maintenance.objects.all()
    serializer_class = MaintenanceSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        # Consulter les maintenances
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ],

        # Déclarer une maintenance
        "create": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ],

        # Modifier
        "update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ],

        "partial_update": [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ],

        # Suppression
        "destroy": [
            "ADMINISTRATEUR",
        ],
    }