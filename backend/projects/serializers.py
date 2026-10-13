import os

from rest_framework import serializers

from .models import (
    Projet,
    Tache,
    Avancement,
    RapportChantier,
    Photo,
    Document,
    Notification,
)


# ============================================================
# PROJETS
# ============================================================

class ProjetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projet
        fields = "__all__"


# ============================================================
# TACHES
# ============================================================

class TacheSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tache
        fields = "__all__"


# ============================================================
# AVANCEMENTS
# ============================================================

class AvancementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avancement
        fields = "__all__"


# ============================================================
# RAPPORTS DE CHANTIER
# ============================================================

class RapportChantierSerializer(serializers.ModelSerializer):
    class Meta:
        model = RapportChantier
        fields = "__all__"
        read_only_fields = ["id_utilisateur"]


# ============================================================
# PHOTOS
# ============================================================

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = "__all__"
        read_only_fields = [
            "id_photo",
            "date_ajout",
        ]


# ============================================================
# DOCUMENTS
# ============================================================

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = "__all__"
        read_only_fields = [
            "id_document",
            "id_utilisateur",
            "date_ajout",
        ]

    def validate_chemin_fichier(self, fichier):
        """
        Vérifie le format et la taille du fichier importé.
        Formats autorisés : PDF, DOC, DOCX, XLS, XLSX, TXT.
        Taille maximale : 10 Mo.
        """

        extensions_autorisees = {
            ".pdf",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".txt",
        }

        extension = os.path.splitext(fichier.name)[1].lower()

        if extension not in extensions_autorisees:
            raise serializers.ValidationError(
                "Format non autorisé. "
                "Formats acceptés : PDF, DOC, DOCX, XLS, XLSX et TXT."
            )

        taille_max = 10 * 1024 * 1024  # 10 Mo

        if fichier.size > taille_max:
            raise serializers.ValidationError(
                "Le fichier ne doit pas dépasser 10 Mo."
            )

        return fichier


# ============================================================
# NOTIFICATIONS
# ============================================================

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"