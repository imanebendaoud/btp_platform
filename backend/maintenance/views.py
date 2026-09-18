from django.shortcuts import render
from rest_framework import viewsets
from users.permissions import IsAdminOrMaintenance

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
    permission_classes = [IsAdminOrMaintenance]


class AffectationEquipementViewSet(viewsets.ModelViewSet):
    queryset = AffectationEquipement.objects.all()
    serializer_class = AffectationEquipementSerializer
    permission_classes = [IsAdminOrMaintenance]


class MaintenanceViewSet(viewsets.ModelViewSet):
    queryset = Maintenance.objects.all()
    serializer_class = MaintenanceSerializer
    permission_classes = [IsAdminOrMaintenance]