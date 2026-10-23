from django.db import models
from projects.models import Projet
from django.conf import settings

class Budget(models.Model):
    id_budget = models.BigAutoField(primary_key=True)
    id_projet = models.OneToOneField(
        Projet,
        on_delete=models.CASCADE,
        db_column="id_projet",
    )
    montant_main_oeuvre = models.DecimalField(max_digits=15, decimal_places=2)
    montant_materiaux = models.DecimalField(max_digits=15, decimal_places=2)
    montant_equipements = models.DecimalField(max_digits=15, decimal_places=2)
    montant_sous_traitance = models.DecimalField(max_digits=15, decimal_places=2)
    montant_transport = models.DecimalField(max_digits=15, decimal_places=2)
    montant_divers = models.DecimalField(max_digits=15, decimal_places=2)
    montant_total = models.DecimalField(max_digits=15, decimal_places=2)

    class Meta:
        managed = False
        db_table = "budgets"

    def __str__(self):
        return f"Budget - {self.id_projet}"


class Depense(models.Model):
    id_depense = models.BigAutoField(primary_key=True)
    id_projet = models.ForeignKey(
        Projet,
        on_delete=models.CASCADE,
        db_column="id_projet",
    )
    categorie = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    montant = models.DecimalField(max_digits=15, decimal_places=2)
    date_depense = models.DateField()
    justification = models.TextField(blank=True, null=True)
    piece_justificative = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "depenses"

    def __str__(self):
        return f"{self.categorie} - {self.montant}"
class DemandeFinancement(models.Model):
    id_demande = models.BigAutoField(primary_key=True)
    id_equipement = models.ForeignKey(
        "maintenance.Equipement",
        on_delete=models.CASCADE,
        db_column="id_equipement",
        db_constraint=False,
    )
    id_maintenance = models.ForeignKey(
        "maintenance.Maintenance",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="id_maintenance",
        db_constraint=False,
    )
    id_projet = models.ForeignKey(
        Projet,
        on_delete=models.CASCADE,
        db_column="id_projet",
        db_constraint=False,
    )
    motif = models.CharField(max_length=40)
    montant_demande = models.DecimalField(max_digits=15, decimal_places=2)
    montant_accorde = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True
    )
    urgence = models.CharField(max_length=20, default="NORMALE")
    justification = models.TextField()
    statut = models.CharField(max_length=20, default="EN_ATTENTE")
    commentaire_decision = models.TextField(null=True, blank=True)
    id_demandeur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column="id_demandeur",
        db_constraint=False,
        related_name="+",
    )
    id_decideur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="id_decideur",
        db_constraint=False,
        related_name="+",
    )
    id_depense = models.ForeignKey(
        Depense,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="id_depense",
        db_constraint=False,
        related_name="+",
    )
    date_demande = models.DateTimeField()
    date_decision = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = "demandes_financement"

    def __str__(self):
        return f"Demande #{self.id_demande} - {self.montant_demande}"