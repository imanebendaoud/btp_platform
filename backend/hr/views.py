from rest_framework import viewsets

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

from users.permissions import IsActionAllowed


class EmployeViewSet(viewsets.ModelViewSet):
    queryset = Employe.objects.all()
    serializer_class = EmployeSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
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

        "destroy": [
            "ADMINISTRATEUR",
        ],
    }


class AffectationEmployeViewSet(viewsets.ModelViewSet):
    queryset = AffectationEmploye.objects.all()
    serializer_class = AffectationEmployeSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
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

        "destroy": [
            "ADMINISTRATEUR",
        ],
    }


class ContratViewSet(viewsets.ModelViewSet):
    queryset = Contrat.objects.all()
    serializer_class = ContratSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
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

        "destroy": [
            "ADMINISTRATEUR",
        ],
    }


class CongeAbsenceViewSet(viewsets.ModelViewSet):
    queryset = CongeAbsence.objects.all()
    serializer_class = CongeAbsenceSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
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

        "destroy": [
            "ADMINISTRATEUR",
        ],
    }


class PointageViewSet(viewsets.ModelViewSet):
    queryset = Pointage.objects.all()
    serializer_class = PointageSerializer
    permission_classes = [IsActionAllowed]

    action_roles = {
        "list": [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
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

        "destroy": [
            "ADMINISTRATEUR",
        ],
    }