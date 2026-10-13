from rest_framework import serializers
from .models import (
    Employe,
    AffectationEmploye,
    Contrat,
    CongeAbsence,
    Pointage,
)


class EmployeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employe
        fields = "__all__"


class AffectationEmployeSerializer(serializers.ModelSerializer):
    employe_nom = serializers.CharField(
        source="id_employe.nom",
        read_only=True
    )
    employe_prenom = serializers.CharField(
        source="id_employe.prenom",
        read_only=True
    )
    projet_numero = serializers.CharField(
        source="id_projet.numero_projet",
        read_only=True
    )
    projet_nom = serializers.CharField(
        source="id_projet.nom",
        read_only=True
    )

    class Meta:
        model = AffectationEmploye
        fields = "__all__"


class ContratSerializer(serializers.ModelSerializer):
    employe_nom = serializers.CharField(
        source="id_employe.nom",
        read_only=True
    )
    employe_prenom = serializers.CharField(
        source="id_employe.prenom",
        read_only=True
    )

    class Meta:
        model = Contrat
        fields = "__all__"


class CongeAbsenceSerializer(serializers.ModelSerializer):
    employe_nom = serializers.CharField(
        source="id_employe.nom",
        read_only=True
    )
    employe_prenom = serializers.CharField(
        source="id_employe.prenom",
        read_only=True
    )

    class Meta:
        model = CongeAbsence
        fields = "__all__"


class PointageSerializer(serializers.ModelSerializer):
    employe_nom = serializers.CharField(
        source="id_employe.nom",
        read_only=True
    )
    employe_prenom = serializers.CharField(
        source="id_employe.prenom",
        read_only=True
    )
    projet_numero = serializers.CharField(
        source="id_projet.numero_projet",
        read_only=True
    )
    projet_nom = serializers.CharField(
        source="id_projet.nom",
        read_only=True
    )

    class Meta:
        model = Pointage
        fields = "__all__"