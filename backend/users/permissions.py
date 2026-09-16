from rest_framework.permissions import BasePermission


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