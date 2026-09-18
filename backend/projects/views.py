from django.shortcuts import render

from rest_framework import viewsets
from users.permissions import (
    IsAdminOrChefOrFinance,
    IsAdminOrChefOrFinanceOrMaintenance,
    IsAdminOrChefOrFinanceOrMaintenanceOrRH,
    IsAuthenticatedAndActive,)
from .models import (
    Projet,
    Tache,
    Avancement,
    RapportChantier,
    Photo,
    Document,
    Notification,
)

from .serializers import (
    ProjetSerializer,
    TacheSerializer,
    AvancementSerializer,
    RapportChantierSerializer,
    PhotoSerializer,
    DocumentSerializer,
    NotificationSerializer,
)


class ProjetViewSet(viewsets.ModelViewSet):
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer
    permission_classes = [IsAdminOrChefOrFinance]


class TacheViewSet(viewsets.ModelViewSet):
    queryset = Tache.objects.all()
    serializer_class = TacheSerializer
    permission_classes = [IsAdminOrChefOrFinance]


class AvancementViewSet(viewsets.ModelViewSet):
    queryset = Avancement.objects.all()
    serializer_class = AvancementSerializer
    permission_classes = [IsAdminOrChefOrFinance]

class RapportChantierViewSet(viewsets.ModelViewSet):
    queryset = RapportChantier.objects.all()
    serializer_class = RapportChantierSerializer
    permission_classes = [IsAdminOrChefOrFinanceOrMaintenance]


class PhotoViewSet(viewsets.ModelViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [IsAdminOrChefOrFinanceOrMaintenance]


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAdminOrChefOrFinanceOrMaintenanceOrRH]


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticatedAndActive]