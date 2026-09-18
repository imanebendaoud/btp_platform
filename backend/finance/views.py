from django.shortcuts import render
from rest_framework import viewsets
from .models import Budget, Depense
from .serializers import BudgetSerializer, DepenseSerializer
from users.permissions import IsResponsableFinancier
from users.permissions import IsAdminOrFinance

class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [IsAdminOrFinance]


class DepenseViewSet(viewsets.ModelViewSet):
    queryset = Depense.objects.all()
    serializer_class = DepenseSerializer
    permission_classes = [IsAdminOrFinance]
