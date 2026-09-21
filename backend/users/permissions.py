from rest_framework.permissions import BasePermission


# ============================================================
# PERMISSION DE BASE PAR ROLE
# ============================================================

class IsRole(BasePermission):
    required_role = None

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not request.user.actif:
            return False

        return request.user.id_role.nom_role == self.required_role


class IsAdministrateur(IsRole):
    required_role = "ADMINISTRATEUR"


class IsChefChantier(IsRole):
    required_role = "CHEF_CHANTIER"


class IsResponsableFinancier(IsRole):
    required_role = "RESPONSABLE_FINANCIER"


class IsResponsableMaintenance(IsRole):
    required_role = "RESPONSABLE_MAINTENANCE"


class IsResponsableRH(IsRole):
    required_role = "RESPONSABLE_RH"


# ============================================================
# PERMISSIONS COMBINEES
# ============================================================

class IsAdminOrFinance(BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not request.user.actif:
            return False

        return request.user.id_role.nom_role in [
            "ADMINISTRATEUR",
            "RESPONSABLE_FINANCIER",
        ]


class IsAdminOrMaintenance(BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not request.user.actif:
            return False

        return request.user.id_role.nom_role in [
            "ADMINISTRATEUR",
            "RESPONSABLE_MAINTENANCE",
        ]


class IsAdminOrRH(BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not request.user.actif:
            return False

        return request.user.id_role.nom_role in [
            "ADMINISTRATEUR",
            "RESPONSABLE_RH",
        ]


class IsAdminOrChefOrFinance(BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not request.user.actif:
            return False

        return request.user.id_role.nom_role in [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
        ]


# ============================================================
# PERMISSION PAR ACTION
# ============================================================

class IsActionAllowed(BasePermission):
    """
    Vérifie si le rôle de l'utilisateur est autorisé
    à effectuer l'action DRF demandée.
    """

    def has_permission(self, request, view):

        if not request.user.is_authenticated:
            return False

        if not request.user.actif:
            return False

        role = request.user.id_role.nom_role

        action = getattr(view, "action", None)

        allowed_roles = getattr(view, "action_roles", {}).get(
            action,
            []
        )

        return role in allowed_roles


# ============================================================
# PERMISSION : PROPRIETAIRE DU CHANTIER
# ============================================================

class IsOwnProject(BasePermission):
    """
    Vérifie qu'un Chef de chantier travaille sur son propre chantier.

    Cette permission est destinée principalement au modèle Projet,
    car Projet possède directement id_chef_projet.
    """

    def has_object_permission(self, request, view, obj):

        role = request.user.id_role.nom_role

        # Administrateur : accès à tous les projets
        if role == "ADMINISTRATEUR":
            return True

        # Responsable financier : accès aux projets autorisés
        if role == "RESPONSABLE_FINANCIER":
            return True

        # Chef de chantier : uniquement ses propres projets
        if role == "CHEF_CHANTIER":
            return (
                obj.id_chef_projet_id
                == request.user.id_utilisateur
            )

        return False


# ============================================================
# VERIFICATION D'ACCES A UN PROJET
# ============================================================

def check_project_access(user, project):
    """
    Vérifie qu'un utilisateur peut travailler sur un projet donné.

    Utilisé notamment lors de la création d'un objet lié à un projet.

    Exemple :
        Un Chef A ne doit pas pouvoir créer une tâche
        en indiquant le projet du Chef B.
    """

    role = user.id_role.nom_role

    # Administrateur
    if role == "ADMINISTRATEUR":
        return True

    # Responsable financier
    if role == "RESPONSABLE_FINANCIER":
        return True

    # Chef de chantier
    if role == "CHEF_CHANTIER":
        return (
            project.id_chef_projet_id
            == user.id_utilisateur
        )

    return False