from django.db import models
from projects.models import Projet


class Equipement(models.Model):
    id_equipement = models.BigAutoField(primary_key=True)
    nom = models.CharField(max_length=255)
    type = models.CharField(max_length=100, blank=True, null=True)
    numero_serie = models.CharField(
        max_length=100,
        unique=True,
        blank=True,
        null=True,
    )
    marque = models.CharField(max_length=100, blank=True, null=True)
    modele = models.CharField(max_length=100, blank=True, null=True)
    date_acquisition = models.DateField(blank=True, null=True)
    etat = models.CharField(max_length=50, blank=True, null=True)
    disponibilite = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "equipements"

    def __str__(self):
        return self.nom


class AffectationEquipement(models.Model):
    id_affectation = models.BigAutoField(primary_key=True)
    id_equipement = models.ForeignKey(
        Equipement,
        on_delete=models.DO_NOTHING,
        db_column="id_equipement",
    )
    id_projet = models.ForeignKey(
        Projet,
        on_delete=models.CASCADE,
        db_column="id_projet",
    )
    date_debut = models.DateField()
    date_fin = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "affectations_equipements"


class Maintenance(models.Model):
    id_maintenance = models.BigAutoField(primary_key=True)
    id_equipement = models.ForeignKey(
        Equipement,
        on_delete=models.DO_NOTHING,
        db_column="id_equipement",
    )
    type_intervention = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )
    description = models.TextField(blank=True, null=True)
    date_declaration = models.DateField()
    date_planifiee = models.DateField(blank=True, null=True)
    date_intervention = models.DateField(blank=True, null=True)
    cout = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        blank=True,
        null=True,
    )
    statut = models.CharField(max_length=50, blank=True, null=True)
    technicien = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    class Meta:
        managed = False
        db_table = "maintenances"