from django.db import models
from projects.models import Projet


class Fournisseur(models.Model):
    id_fournisseur = models.BigAutoField(primary_key=True)
    nom = models.CharField(max_length=255)
    telephone = models.CharField(max_length=30, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    adresse = models.TextField(blank=True, null=True)
    registre_commerce = models.CharField(max_length=100, blank=True, null=True)
    identifiant_fiscal = models.CharField(max_length=100, blank=True, null=True)
    ice = models.CharField(max_length=100, blank=True, null=True)
    date_creation = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "fournisseurs"

    def __str__(self):
        return self.nom


class Materiau(models.Model):
    id_materiau = models.BigAutoField(primary_key=True)
    nom = models.CharField(max_length=255)
    unite = models.CharField(max_length=50)
    stock_actuel = models.DecimalField(max_digits=15, decimal_places=3)
    stock_minimum = models.DecimalField(max_digits=15, decimal_places=3)

    class Meta:
        managed = False
        db_table = "materiaux"

    def __str__(self):
        return self.nom


class Achat(models.Model):
    id_achat = models.BigAutoField(primary_key=True)
    reference = models.CharField(max_length=100, unique=True)
    id_projet = models.ForeignKey(
        Projet,
        on_delete=models.DO_NOTHING,
        db_column="id_projet",
    )
    id_fournisseur = models.ForeignKey(
        Fournisseur,
        on_delete=models.DO_NOTHING,
        db_column="id_fournisseur",
    )
    id_materiau = models.ForeignKey(
        Materiau,
        on_delete=models.DO_NOTHING,
        db_column="id_materiau",
    )
    quantite = models.DecimalField(max_digits=15, decimal_places=3)
    unite = models.CharField(max_length=50, blank=True, null=True)
    prix_unitaire = models.DecimalField(max_digits=15, decimal_places=2)
    montant_total = models.DecimalField(max_digits=15, decimal_places=2)
    date_achat = models.DateField()
    statut = models.CharField(max_length=30, blank=True, null=True)
    facture = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "achats"

    def __str__(self):
        return self.reference


class MouvementStock(models.Model):
    id_mouvement = models.BigAutoField(primary_key=True)
    id_materiau = models.ForeignKey(
        Materiau,
        on_delete=models.DO_NOTHING,
        db_column="id_materiau",
    )
    id_projet = models.ForeignKey(
        Projet,
        on_delete=models.DO_NOTHING,
        db_column="id_projet",
        blank=True,
        null=True,
    )
    type_mouvement = models.CharField(max_length=20)
    quantite = models.DecimalField(max_digits=15, decimal_places=3)
    date_mouvement = models.DateTimeField()
    motif = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "mouvements_stock"

    def __str__(self):
        return f"{self.type_mouvement} - {self.quantite}"


class DemandeMateriau(models.Model):
    id_demande = models.BigAutoField(primary_key=True)

    id_chef = models.ForeignKey(
        "users.Utilisateur",
        on_delete=models.DO_NOTHING,
        db_column="id_chef",
        related_name="demandes_materiaux",
    )

    id_projet = models.ForeignKey(
        "projects.Projet",
        on_delete=models.DO_NOTHING,
        db_column="id_projet",
        related_name="demandes_materiaux",
    )

    id_materiau = models.ForeignKey(
        "stock.Materiau",
        on_delete=models.DO_NOTHING,
        db_column="id_materiau",
        related_name="demandes_materiaux",
    )

    quantite = models.DecimalField(max_digits=15, decimal_places=3)
    date_besoin = models.DateField()
    motif = models.TextField(blank=True, null=True)
    priorite = models.CharField(max_length=20, default="NORMALE")
    statut = models.CharField(max_length=30, default="EN_ATTENTE")
    commentaire_decision = models.TextField(blank=True, null=True)
    date_creation = models.DateTimeField(auto_now_add=False)
    date_traitement = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "demandes_materiaux"

    def __str__(self):
        return f"Demande #{self.id_demande} - {self.statut}"
    