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


class ProjetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projet
        fields = "__all__"


class TacheSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tache
        fields = "__all__"


class AvancementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avancement
        fields = "__all__"


class RapportChantierSerializer(serializers.ModelSerializer):
    class Meta:
        model = RapportChantier
        fields = "__all__"


class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = "__all__"


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = "__all__"


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"