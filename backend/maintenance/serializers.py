from rest_framework import serializers

from .models import (
    Equipement,
    AffectationEquipement,
    Maintenance,
)


class EquipementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipement
        fields = "__all__"


class AffectationEquipementSerializer(serializers.ModelSerializer):
    class Meta:
        model = AffectationEquipement
        fields = "__all__"


class MaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maintenance
        fields = "__all__"