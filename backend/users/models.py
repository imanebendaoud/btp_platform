from django.db import models


class Role(models.Model):
    id_role = models.BigAutoField(primary_key=True)
    nom_role = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "roles"

    def __str__(self):
        return self.nom_role


class Utilisateur(models.Model):
    id_utilisateur = models.BigAutoField(primary_key=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.CharField(max_length=255, unique=True)
    mot_de_passe = models.TextField()
    id_role = models.ForeignKey(
        Role,
        on_delete=models.DO_NOTHING,
        db_column="id_role",
    )
    actif = models.BooleanField()
    date_creation = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "utilisateurs"

    def __str__(self):
        return f"{self.prenom} {self.nom}"