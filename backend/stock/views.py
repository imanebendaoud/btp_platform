from django.shortcuts import render
from rest_framework import viewsets

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


class MateriauViewSet(viewsets.ModelViewSet):
    queryset = Materiau.objects.all()
    serializer_class = MateriauSerializer


class AchatViewSet(viewsets.ModelViewSet):
    queryset = Achat.objects.all()
    serializer_class = AchatSerializer


class MouvementStockViewSet(viewsets.ModelViewSet):
    queryset = MouvementStock.objects.all()
    serializer_class = MouvementStockSerializer
