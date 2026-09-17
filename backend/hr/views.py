from django.shortcuts import render
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


class EmployeViewSet(viewsets.ModelViewSet):
    queryset = Employe.objects.all()
    serializer_class = EmployeSerializer


class AffectationEmployeViewSet(viewsets.ModelViewSet):
    queryset = AffectationEmploye.objects.all()
    serializer_class = AffectationEmployeSerializer


class ContratViewSet(viewsets.ModelViewSet):
    queryset = Contrat.objects.all()
    serializer_class = ContratSerializer


class CongeAbsenceViewSet(viewsets.ModelViewSet):
    queryset = CongeAbsence.objects.all()
    serializer_class = CongeAbsenceSerializer


class PointageViewSet(viewsets.ModelViewSet):
    queryset = Pointage.objects.all()
    serializer_class = PointageSerializer
