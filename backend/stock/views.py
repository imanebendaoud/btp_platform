from django.shortcuts import render
from rest_framework import viewsets
from users.permissions import (IsAdminOrFinance,IsAdminOrChefOrFinance,)

from .models import (
    Fournisseur,
    Materiau,
    Achat,
    MouvementStock,
)

from .serializers import (
    FournisseurSerializer,
    MateriauSerializer,
    AchatSerializer,
    MouvementStockSerializer,
)

class FournisseurViewSet(viewsets.ModelViewSet):
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer
    permission_classes = [IsAdminOrFinance]


class MateriauViewSet(viewsets.ModelViewSet):
    queryset = Materiau.objects.all()
    serializer_class = MateriauSerializer
    permission_classes = [IsAdminOrChefOrFinance]


class AchatViewSet(viewsets.ModelViewSet):
    queryset = Achat.objects.all()
    serializer_class = AchatSerializer
    permission_classes = [IsAdminOrFinance]


class MouvementStockViewSet(viewsets.ModelViewSet):
    queryset = MouvementStock.objects.all()
    serializer_class = MouvementStockSerializer
    permission_classes = [IsAdminOrChefOrFinance]