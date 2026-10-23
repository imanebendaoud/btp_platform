from django.db.models import Q

from rest_framework import serializers

from .models import (
    Equipement,
    AffectationEquipement,
    Maintenance,
    DemandeEquipement,
)


# ============================================================
# ÉQUIPEMENTS
# ============================================================

class EquipementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipement
        fields = "__all__"


# ============================================================
# AFFECTATIONS DES ÉQUIPEMENTS
# ============================================================

class AffectationEquipementSerializer(serializers.ModelSerializer):
    class Meta:
        model = AffectationEquipement
        fields = "__all__"

    def validate(self, attrs):
        # En PATCH, compléter les valeurs manquantes
        # avec celles de l'affectation existante.
        instance = getattr(self, "instance", None)

        equipement = attrs.get(
            "id_equipement",
            getattr(instance, "id_equipement", None),
        )

        debut = attrs.get(
            "date_debut",
            getattr(instance, "date_debut", None),
        )

        fin = attrs.get(
            "date_fin",
            getattr(instance, "date_fin", None),
        )

        # Vérifier la cohérence des dates.
        if debut and fin and fin < debut:
            raise serializers.ValidationError({
                "date_fin": (
                    "La date de fin doit être postérieure "
                    "ou égale à la date de début."
                )
            })

        # Vérifier que l'équipement n'est pas déjà affecté
        # sur une période qui chevauche la nouvelle période.
        if equipement and debut:
            conflits = AffectationEquipement.objects.filter(
                id_equipement=equipement
            )

            # Exclure l'affectation courante lors d'une modification.
            if instance is not None:
                conflits = conflits.exclude(pk=instance.pk)

            # Une affectation existante doit commencer avant
            # ou à la date de fin de la nouvelle affectation.
            if fin:
                conflits = conflits.filter(
                    date_debut__lte=fin
                )

            # La date de fin existante doit être nulle
            # ou postérieure ou égale au début demandé.
            conflits = conflits.filter(
                Q(date_fin__isnull=True)
                | Q(date_fin__gte=debut)
            )

            conflit = conflits.order_by("date_debut").first()

            if conflit:
                fin_txt = (
                    conflit.date_fin.strftime("%d/%m/%Y")
                    if conflit.date_fin
                    else "une date indéterminée"
                )

                raise serializers.ValidationError({
                    "non_field_errors": [
                        (
                            "Cet équipement n'est pas disponible "
                            "sur cet intervalle : il est déjà affecté "
                            f"du {conflit.date_debut.strftime('%d/%m/%Y')} "
                            f"au {fin_txt}."
                        )
                    ]
                })

        return attrs


# ============================================================
# MAINTENANCES
# ============================================================

class MaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maintenance
        fields = "__all__"


# ============================================================
# DEMANDES D'ÉQUIPEMENT
# ============================================================

class DemandeEquipementSerializer(serializers.ModelSerializer):
    nom_chef = serializers.SerializerMethodField()

    nom_chantier = serializers.CharField(
        source="id_projet.nom",
        read_only=True,
    )

    class Meta:
        model = DemandeEquipement
        fields = "__all__"

        read_only_fields = [
            "id_demande",
            "id_chef",
            "statut",
            "commentaire_decision",
            "date_creation",
            "date_traitement",
        ]

    def get_nom_chef(self, obj):
        chef = obj.id_chef

        if chef is None:
            return ""

        return f"{chef.prenom} {chef.nom}".strip()

