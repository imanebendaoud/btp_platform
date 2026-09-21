from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from .models import Utilisateur
from .permissions import IsAdministrateur, IsAdminOrRH
from .serializers import (
    UtilisateurSerializer,
    UtilisateurCreateSerializer,
)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id_utilisateur,
            "nom": user.nom,
            "prenom": user.prenom,
            "email": user.email,
            "role": user.id_role.nom_role,
            "actif": user.actif,
        })

class AdminTestView(APIView):
    permission_classes = [IsAdministrateur]

    def get(self, request):
        return Response({
            "message": "Accès autorisé",
            "role": request.user.id_role.nom_role,
        })

class UtilisateurViewSet(ModelViewSet):
    queryset = Utilisateur.objects.all()
    permission_classes = [IsAdminOrRH]

    def get_serializer_class(self):
        if self.action == "create":
            return UtilisateurCreateSerializer

        return UtilisateurSerializer    