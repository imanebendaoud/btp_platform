from django.db import models
from projects.models import Projet


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