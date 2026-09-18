from django.shortcuts import render

from rest_framework import viewsets

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


class TacheViewSet(viewsets.ModelViewSet):
    queryset = Tache.objects.all()
    serializer_class = TacheSerializer


class AvancementViewSet(viewsets.ModelViewSet):
    queryset = Avancement.objects.all()
    serializer_class = AvancementSerializer


class RapportChantierViewSet(viewsets.ModelViewSet):
    queryset = RapportChantier.objects.all()
    serializer_class = RapportChantierSerializer


class PhotoViewSet(viewsets.ModelViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
