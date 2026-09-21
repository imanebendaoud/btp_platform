from rest_framework import serializers
from .models import Utilisateur


class UtilisateurSerializer(serializers.ModelSerializer):
    role = serializers.CharField(
        source="id_role.nom_role",
        read_only=True
    )

    class Meta:
        model = Utilisateur
        fields = [
            "id_utilisateur",
            "nom",
            "prenom",
            "email",
            "id_role",
            "role",
            "actif",
            "date_creation",
        ]
        read_only_fields = [
            "id_utilisateur",
            "date_creation",
            "role",
        ]


class UtilisateurCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = Utilisateur
        fields = [
            "nom",
            "prenom",
            "email",
            "password",
            "id_role",
            "actif",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = Utilisateur(
            **validated_data
        )

        user.set_password(password)
        user.save()

        return user