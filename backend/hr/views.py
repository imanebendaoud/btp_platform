from django.shortcuts import render
from rest_framework import viewsets
from users.permissions import IsAdminOrRH

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

class EmployeViewSet(viewsets.ModelViewSet):
    queryset = Employe.objects.all()
    serializer_class = EmployeSerializer
    permission_classes = [IsAdminOrRH]


class AffectationEmployeViewSet(viewsets.ModelViewSet):
    queryset = AffectationEmploye.objects.all()
    serializer_class = AffectationEmployeSerializer
    permission_classes = [IsAdminOrRH]


class ContratViewSet(viewsets.ModelViewSet):
    queryset = Contrat.objects.all()
    serializer_class = ContratSerializer
    permission_classes = [IsAdminOrRH]


class CongeAbsenceViewSet(viewsets.ModelViewSet):
    queryset = CongeAbsence.objects.all()
    serializer_class = CongeAbsenceSerializer
    permission_classes = [IsAdminOrRH]


class PointageViewSet(viewsets.ModelViewSet):
    queryset = Pointage.objects.all()
    serializer_class = PointageSerializer
    permission_classes = [IsAdminOrRH]