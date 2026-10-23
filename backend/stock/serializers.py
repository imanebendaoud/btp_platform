from rest_framework import serializers

from .models import (
    Fournisseur,
    Materiau,
    Achat,
    MouvementStock,
    DemandeMateriau,
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

class DemandeMateriauSerializer(serializers.ModelSerializer):
    nom_materiau = serializers.CharField(
        source="id_materiau.nom",
        read_only=True,
    )

    nom_projet = serializers.CharField(
        source="id_projet.nom",
        read_only=True,
    )

    class Meta:
        model = DemandeMateriau
        fields = [
            "id_demande",
            "id_chef",
            "id_projet",
            "id_materiau",
            "nom_materiau",
            "nom_projet",
            "quantite",
            "date_besoin",
            "motif",
            "priorite",
            "statut",
            "commentaire_decision",
            "date_creation",
            "date_traitement",
        ]
        read_only_fields = [
            "id_demande",
            "id_chef",
            "statut",
            "commentaire_decision",
            "date_creation",
            "date_traitement",
        ]        