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
    class Meta:
        model = AffectationEmploye
        fields = "__all__"


class ContratSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contrat
        fields = "__all__"


class CongeAbsenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CongeAbsence
        fields = "__all__"


class PointageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pointage
        fields = "__all__"