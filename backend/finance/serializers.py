from rest_framework import serializers
from .models import Budget, Depense, DemandeFinancement


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = "__all__"


class DepenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Depense
        fields = "__all__"
class DemandeFinancementSerializer(serializers.ModelSerializer):
    equipement_nom = serializers.CharField(source="id_equipement.nom", read_only=True)
    projet_nom = serializers.CharField(source="id_projet.nom", read_only=True)
    demandeur_nom = serializers.SerializerMethodField()
    decideur_nom = serializers.SerializerMethodField()

    class Meta:
        model = DemandeFinancement
        fields = "__all__"
        # Posés uniquement par le serveur : le client ne peut pas les forcer
        read_only_fields = [
            "statut",
            "montant_accorde",
            "commentaire_decision",
            "id_demandeur",
            "id_decideur",
            "id_depense",
            "date_demande",
            "date_decision",
        ]

    def _nom(self, user):
        if not user:
            return None
        return f"{getattr(user, 'prenom', '')} {getattr(user, 'nom', '')}".strip()

    def get_demandeur_nom(self, obj):
        return self._nom(obj.id_demandeur)

    def get_decideur_nom(self, obj):
        return self._nom(obj.id_decideur)

    def validate_montant_demande(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0.")
        return value