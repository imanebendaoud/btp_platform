from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class Role(models.Model):
    id_role = models.BigAutoField(primary_key=True)
    nom_role = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "roles"

    def __str__(self):
        return self.nom_role


class UtilisateurManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'adresse email est obligatoire.")

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            **extra_fields
        )

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        user = self.create_user(
            email=email,
            password=password,
            **extra_fields
        )

        return user


class Utilisateur(AbstractBaseUser):
    last_login = None
    id_utilisateur = models.BigAutoField(primary_key=True)

    nom = models.CharField(max_length=100)

    prenom = models.CharField(max_length=100)

    email = models.CharField(
        max_length=255,
        unique=True
    )

    # Très important :
    # Django utilise le nom "password",
    # mais PostgreSQL possède la colonne "mot_de_passe".
    password = models.TextField(
        db_column="mot_de_passe"
    )

    id_role = models.ForeignKey(
        Role,
        on_delete=models.DO_NOTHING,
        db_column="id_role"
    )

    actif = models.BooleanField()

    date_creation = models.DateTimeField()

    objects = UtilisateurManager()

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = []

    class Meta:
        managed = False
        db_table = "utilisateurs"

    @property
    def is_active(self):
        return self.actif

    @property
    def is_staff(self):
        return False

    def __str__(self):
        return f"{self.prenom} {self.nom}"