from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied

from .models import (
    Projet,
    Tache,
    Avancement,
    RapportChantier,
    Photo,
    Document,
    Notification,
)

from .serializers import (
    ProjetSerializer,
    TacheSerializer,
    AvancementSerializer,
    RapportChantierSerializer,
    PhotoSerializer,
    DocumentSerializer,
    NotificationSerializer,
)

from users.permissions import (
    IsActionAllowed,
    IsOwnProject,
    check_project_access,
)


# ============================================================
# PROJETS
# ============================================================

class ProjetViewSet(viewsets.ModelViewSet):

    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer

    permission_classes = [
        IsActionAllowed,
        IsOwnProject,
    ]

    action_roles = {

        "list": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "create": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "update": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "partial_update": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "destroy": [
            "ADMINISTRATEUR",
        ],
    }

    # --------------------------------------------------------
    # FILTRAGE DES PROJETS
    # --------------------------------------------------------

    def get_queryset(self):

        user = self.request.user

        role = user.id_role.nom_role

        # Administrateur
        if role == "ADMINISTRATEUR":
            return Projet.objects.all()

        # Responsable financier
        if role == "RESPONSABLE_FINANCIER":
            return Projet.objects.all()

        # Chef de chantier
        if role == "CHEF_CHANTIER":
            return Projet.objects.filter(
                id_chef_projet_id=user.id_utilisateur
            )

        # Autres rôles
        return Projet.objects.none()

    # --------------------------------------------------------
    # CREATION
    # --------------------------------------------------------

    def perform_create(self, serializer):

        user = self.request.user

        role = user.id_role.nom_role

        # Si un Chef crée un projet,
        # le projet lui est automatiquement attribué.
        if role == "CHEF_CHANTIER":

            serializer.save(
                id_chef_projet=user
            )

        else:

            serializer.save()

    # --------------------------------------------------------
    # MODIFICATION
    # --------------------------------------------------------

    def perform_update(self, serializer):

        user = self.request.user

        role = user.id_role.nom_role

        # Un Chef ne peut pas transférer son chantier
        # à un autre chef.
        if role == "CHEF_CHANTIER":

            serializer.save(
                id_chef_projet=user
            )

        else:

            serializer.save()


# ============================================================
# TACHES
# ============================================================

class TacheViewSet(viewsets.ModelViewSet):

    queryset = Tache.objects.all()
    serializer_class = TacheSerializer

    permission_classes = [
        IsActionAllowed,
    ]

    action_roles = {

        "list": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "create": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "update": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "partial_update": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "destroy": [
            "ADMINISTRATEUR",
        ],
    }

    # --------------------------------------------------------
    # FILTRAGE
    # --------------------------------------------------------

    def get_queryset(self):

        user = self.request.user

        role = user.id_role.nom_role

        if role in [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ]:
            return Tache.objects.all()

        if role == "CHEF_CHANTIER":

            return Tache.objects.filter(
                id_projet__id_chef_projet_id=user.id_utilisateur
            )

        return Tache.objects.none()

    # --------------------------------------------------------
    # CREATION
    # --------------------------------------------------------

    def perform_create(self, serializer):

        user = self.request.user

        projet = serializer.validated_data.get("id_projet")

        if projet is None:
            raise PermissionDenied(
                "Le projet est obligatoire."
            )

        if not check_project_access(user, projet):

            raise PermissionDenied(
                "Vous ne pouvez pas créer une tâche sur ce chantier."
            )

        serializer.save()


# ============================================================
# AVANCEMENTS
# ============================================================

class AvancementViewSet(viewsets.ModelViewSet):

    queryset = Avancement.objects.all()
    serializer_class = AvancementSerializer

    permission_classes = [
        IsActionAllowed,
    ]

    action_roles = {

        "list": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "create": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "update": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "partial_update": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "destroy": [
            "ADMINISTRATEUR",
        ],
    }

    def get_queryset(self):

        user = self.request.user

        role = user.id_role.nom_role

        if role in [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ]:
            return Avancement.objects.all()

        if role == "CHEF_CHANTIER":

            return Avancement.objects.filter(
                id_projet__id_chef_projet_id=user.id_utilisateur
            )

        return Avancement.objects.none()

    def perform_create(self, serializer):

        user = self.request.user

        projet = serializer.validated_data.get("id_projet")

        if projet is None:
            raise PermissionDenied(
                "Le projet est obligatoire."
            )

        if not check_project_access(user, projet):

            raise PermissionDenied(
                "Vous ne pouvez pas ajouter un avancement sur ce chantier."
            )

        serializer.save()


# ============================================================
# RAPPORTS CHANTIER
# ============================================================

class RapportChantierViewSet(viewsets.ModelViewSet):

    queryset = RapportChantier.objects.all()
    serializer_class = RapportChantierSerializer

    permission_classes = [
        IsActionAllowed,
    ]

    action_roles = {

        "list": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "create": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "update": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "partial_update": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "destroy": [
            "ADMINISTRATEUR",
        ],
    }

    def get_queryset(self):

        user = self.request.user

        role = user.id_role.nom_role

        if role in [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ]:
            return RapportChantier.objects.all()

        if role == "CHEF_CHANTIER":

            return RapportChantier.objects.filter(
                id_projet__id_chef_projet_id=user.id_utilisateur
            )

        return RapportChantier.objects.none()

    def perform_create(self, serializer):

        user = self.request.user

        projet = serializer.validated_data.get("id_projet")

        if projet is None:
            raise PermissionDenied(
                "Le projet est obligatoire."
            )

        if not check_project_access(user, projet):

            raise PermissionDenied(
                "Vous ne pouvez pas créer un rapport sur ce chantier."
            )

        serializer.save()


# ============================================================
# PHOTOS
# ============================================================

class PhotoViewSet(viewsets.ModelViewSet):

    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer

    permission_classes = [
        IsActionAllowed,
    ]

    action_roles = {

        "list": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "create": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "update": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "partial_update": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "destroy": [
            "ADMINISTRATEUR",
        ],
    }

    def get_queryset(self):

        user = self.request.user

        role = user.id_role.nom_role

        if role in [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ]:
            return Photo.objects.all()

        if role == "CHEF_CHANTIER":

            return Photo.objects.filter(
                id_projet__id_chef_projet_id=user.id_utilisateur
            )

        return Photo.objects.none()

    def perform_create(self, serializer):

        user = self.request.user

        projet = serializer.validated_data.get("id_projet")

        if projet is None:
            raise PermissionDenied(
                "Le projet est obligatoire."
            )

        if not check_project_access(user, projet):

            raise PermissionDenied(
                "Vous ne pouvez pas ajouter une photo sur ce chantier."
            )

        serializer.save()


# ============================================================
# DOCUMENTS
# ============================================================

class DocumentViewSet(viewsets.ModelViewSet):

    queryset = Document.objects.all()
    serializer_class = DocumentSerializer

    permission_classes = [
        IsActionAllowed,
    ]

    action_roles = {

        "list": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ],

        "create": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "update": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "partial_update": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
        ],

        "destroy": [
            "ADMINISTRATEUR",
        ],
    }

    def get_queryset(self):

        user = self.request.user

        role = user.id_role.nom_role

        if role in [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ]:
            return Document.objects.all()

        if role == "CHEF_CHANTIER":

            return Document.objects.filter(
                id_projet__id_chef_projet_id=user.id_utilisateur
            )

        return Document.objects.none()

    def perform_create(self, serializer):

        user = self.request.user

        projet = serializer.validated_data.get("id_projet")

        if projet is None:
            raise PermissionDenied(
                "Le projet est obligatoire."
            )

        if not check_project_access(user, projet):

            raise PermissionDenied(
                "Vous ne pouvez pas ajouter un document sur ce chantier."
            )

        serializer.save()


# ============================================================
# NOTIFICATIONS
# ============================================================

class NotificationViewSet(viewsets.ModelViewSet):

    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    permission_classes = [
        IsActionAllowed,
    ]

    action_roles = {

        "list": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
            "RESPONSABLE_MAINTENANCE",
            "RESPONSABLE_RH",
        ],

        "retrieve": [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
            "RESPONSABLE_MAINTENANCE",
            "RESPONSABLE_RH",
        ],

        "create": [
            "ADMINISTRATEUR",
        ],

        "update": [
            "ADMINISTRATEUR",
        ],

        "partial_update": [
            "ADMINISTRATEUR",
        ],

        "destroy": [
            "ADMINISTRATEUR",
        ],
    }

    def get_queryset(self):

        user = self.request.user

        role = user.id_role.nom_role

        # Administrateur voit toutes les notifications
        if role == "ADMINISTRATEUR":
            return Notification.objects.all()

        # Chaque utilisateur voit uniquement
        # ses propres notifications
        return Notification.objects.filter(
            id_utilisateur_id=user.id_utilisateur
        )