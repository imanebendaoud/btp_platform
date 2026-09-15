from rest_framework import serializers
from .models import Budget, Depense


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = "__all__"


class DepenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Depense
        fields = "__all__"