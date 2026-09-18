
from rest_framework.permissions import BasePermission


# ============================================================
# Permission de base : vérifier le rôle de l'utilisateur
# ============================================================

class IsRole(BasePermission):
    required_role = None

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not request.user.actif:
            return False

        return request.user.id_role.nom_role == self.required_role


# ============================================================
# Permissions pour un seul rôle
# ============================================================

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
# Permissions pour plusieurs rôles
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


class IsAdminOrChefOrFinanceOrMaintenance(BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not request.user.actif:
            return False

        return request.user.id_role.nom_role in [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
            "RESPONSABLE_MAINTENANCE",
        ]


class IsAdminOrChefOrFinanceOrMaintenanceOrRH(BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not request.user.actif:
            return False

        return request.user.id_role.nom_role in [
            "ADMINISTRATEUR",
            "CHEF_CHANTIER",
            "RESPONSABLE_FINANCIER",
            "RESPONSABLE_MAINTENANCE",
            "RESPONSABLE_RH",
        ]


# ============================================================
# Permission : tout utilisateur authentifié et actif
# ============================================================

class IsAuthenticatedAndActive(BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if not request.user.actif:
            return False

        return True
