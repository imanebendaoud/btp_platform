from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdministrateur


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