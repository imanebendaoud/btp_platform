from django.shortcuts import render
from rest_framework import viewsets
from .models import Budget, Depense
from .serializers import BudgetSerializer, DepenseSerializer


class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer


class DepenseViewSet(viewsets.ModelViewSet):
    queryset = Depense.objects.all()
    serializer_class = DepenseSerializer
