from django.db import models
from users.models import Utilisateur


class Projet(models.Model):
    id_projet = models.BigAutoField(primary_key=True)
    numero_projet = models.CharField(max_length=50, unique=True)
    nom = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    client = models.CharField(max_length=255, blank=True, null=True)
    localisation = models.TextField(blank=True, null=True)
    date_debut = models.DateField(blank=True, null=True)
    date_fin_prevue = models.DateField(blank=True, null=True)
    budget_initial = models.DecimalField(max_digits=15, decimal_places=2)
    id_chef_projet = models.ForeignKey(
        Utilisateur,
        on_delete=models.DO_NOTHING,
        db_column="id_chef_projet",
        blank=True,
        null=True,
    )
    statut = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = "projets"

    def __str__(self):
        return f"{self.numero_projet} - {self.nom}"


class Tache(models.Model):
    id_tache = models.BigAutoField(primary_key=True)
    id_projet = models.ForeignKey(
        Projet,
        on_delete=models.CASCADE,
        db_column="id_projet",
    )
    titre = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    date_debut = models.DateField(blank=True, null=True)
    date_fin_prevue = models.DateField(blank=True, null=True)
    date_fin_reelle = models.DateField(blank=True, null=True)
    statut = models.CharField(max_length=30, blank=True, null=True)
    priorite = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "taches"

    def __str__(self):
        return self.titre


class Avancement(models.Model):
    id_avancement = models.BigAutoField(primary_key=True)
    id_projet = models.ForeignKey(
        Projet,
        on_delete=models.CASCADE,
        db_column="id_projet",
    )
    pourcentage = models.DecimalField(max_digits=5, decimal_places=2)
    date_avancement = models.DateField()
    commentaire = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "avancements"

    def __str__(self):
        return f"{self.pourcentage}% - {self.date_avancement}"


class RapportChantier(models.Model):
    id_rapport = models.BigAutoField(primary_key=True)
    id_projet = models.ForeignKey(
        Projet,
        on_delete=models.CASCADE,
        db_column="id_projet",
    )
    id_utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.DO_NOTHING,
        db_column="id_utilisateur",
    )
    titre = models.CharField(max_length=255)
    type_rapport = models.CharField(max_length=100, blank=True, null=True)
    contenu = models.TextField(blank=True, null=True)
    date_rapport = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "rapports_chantier"

    def __str__(self):
        return self.titre


class Photo(models.Model):
    id_photo = models.BigAutoField(primary_key=True)
    id_projet = models.ForeignKey(
        Projet,
        on_delete=models.CASCADE,
        db_column="id_projet",
    )
    chemin_photo = models.TextField()
    description = models.TextField(blank=True, null=True)
    date_ajout = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "photos"

    def __str__(self):
        return f"Photo {self.id_photo}"


class Document(models.Model):
    id_document = models.BigAutoField(primary_key=True)
    id_projet = models.ForeignKey(
        Projet,
        on_delete=models.CASCADE,
        db_column="id_projet",
    )
    id_utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.DO_NOTHING,
        db_column="id_utilisateur",
    )
    nom_document = models.CharField(max_length=255)
    type_document = models.CharField(max_length=100, blank=True, null=True)
    chemin_fichier = models.TextField()
    date_ajout = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "documents"

    def __str__(self):
        return self.nom_document


class Notification(models.Model):
    id_notification = models.BigAutoField(primary_key=True)
    id_utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.DO_NOTHING,
        db_column="id_utilisateur",
    )
    id_projet = models.ForeignKey(
        Projet,
        on_delete=models.DO_NOTHING,
        db_column="id_projet",
        blank=True,
        null=True,
    )
    type = models.CharField(max_length=100, blank=True, null=True)
    titre = models.CharField(max_length=255)
    message = models.TextField()
    date_creation = models.DateTimeField()
    lue = models.BooleanField()

    class Meta:
        managed = False
        db_table = "notifications"

    def __str__(self):
        return self.titre