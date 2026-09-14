from django.db import models
from projects.models import Projet


class Employe(models.Model):
    id_employe = models.BigAutoField(primary_key=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    cin = models.CharField(max_length=30, unique=True, blank=True, null=True)
    telephone = models.CharField(max_length=30, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    poste = models.CharField(max_length=100, blank=True, null=True)
    date_embauche = models.DateField(blank=True, null=True)
    cout_journalier = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        blank=True,
        null=True,
    )
    statut = models.CharField(max_length=30, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "employes"

    def __str__(self):
        return f"{self.prenom} {self.nom}"


class AffectationEmploye(models.Model):
    id_affectation = models.BigAutoField(primary_key=True)
    id_employe = models.ForeignKey(
        Employe,
        on_delete=models.DO_NOTHING,
        db_column="id_employe",
    )
    id_projet = models.ForeignKey(
        Projet,
        on_delete=models.CASCADE,
        db_column="id_projet",
    )
    date_debut = models.DateField()
    date_fin = models.DateField(blank=True, null=True)
    fonction_sur_chantier = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )
    cout_journalier = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        blank=True,
        null=True,
    )

    class Meta:
        managed = False
        db_table = "affectations_employes"


class Contrat(models.Model):
    id_contrat = models.BigAutoField(primary_key=True)
    id_employe = models.ForeignKey(
        Employe,
        on_delete=models.DO_NOTHING,
        db_column="id_employe",
    )
    type_contrat = models.CharField(max_length=50)
    date_debut = models.DateField()
    date_fin = models.DateField(blank=True, null=True)
    salaire = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        blank=True,
        null=True,
    )
    statut = models.CharField(max_length=30, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "contrats"


class CongeAbsence(models.Model):
    id_absence = models.BigAutoField(primary_key=True)
    id_employe = models.ForeignKey(
        Employe,
        on_delete=models.DO_NOTHING,
        db_column="id_employe",
    )
    type = models.CharField(max_length=50)
    date_debut = models.DateField()
    date_fin = models.DateField()
    motif = models.TextField(blank=True, null=True)
    statut = models.CharField(max_length=30, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "conges_absences"


class Pointage(models.Model):
    id_pointage = models.BigAutoField(primary_key=True)
    id_employe = models.ForeignKey(
        Employe,
        on_delete=models.DO_NOTHING,
        db_column="id_employe",
    )
    id_projet = models.ForeignKey(
        Projet,
        on_delete=models.CASCADE,
        db_column="id_projet",
    )
    date = models.DateField()
    heure_entree = models.TimeField(blank=True, null=True)
    heure_sortie = models.TimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "pointages"