from rest_framework import serializers

from .models import (
    Fournisseur,
    Materiau,
    Achat,
    MouvementStock,
)


class FournisseurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fournisseur
        fields = "__all__"


class MateriauSerializer(serializers.ModelSerializer):
    class Meta:
        model = Materiau
        fields = "__all__"


class AchatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achat
        fields = "__all__"


class MouvementStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = MouvementStock
        fields = "__all__"