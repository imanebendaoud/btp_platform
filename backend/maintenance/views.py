from django.shortcuts import render
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


class EquipementViewSet(viewsets.ModelViewSet):
    queryset = Equipement.objects.all()
    serializer_class = EquipementSerializer


class AffectationEquipementViewSet(viewsets.ModelViewSet):
    queryset = AffectationEquipement.objects.all()
    serializer_class = AffectationEquipementSerializer


class MaintenanceViewSet(viewsets.ModelViewSet):
    queryset = Maintenance.objects.all()
    serializer_class = MaintenanceSerializer
