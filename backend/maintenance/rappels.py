from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone

from projects.models import Notification

from .models import Equipement, Maintenance


def _creer_si_absent(user, titre, message):
    """Crée la notification sauf si la même existe déjà aujourd'hui (anti-doublon)."""
    aujourdhui = timezone.localdate()
    existe = Notification.objects.filter(
        id_utilisateur=user,
        type="MAINTENANCE",
        titre=titre,
        message=message,
        date_creation__date=aujourdhui,
    ).exists()
    if existe:
        return
    Notification.objects.create(
        id_utilisateur=user,
        id_projet=None,
        type="MAINTENANCE",
        titre=titre,
        message=message,
        date_creation=timezone.now(),
        lue=False,
    )


def generer_rappels(user):
    """Rappels du jour pour le responsable maintenance.
    Appelée à chaque chargement de ses notifications (la cloche le fait toutes les 30 s)."""
    aujourdhui = timezone.localdate()

    ouvertes = (
        Maintenance.objects
        .exclude(statut__istartswith="TERMIN")
        .exclude(statut__istartswith="ANNUL")
        .exclude(date_planifiee__isnull=True)
        .select_related("id_equipement")
    )

    admins = list(
        get_user_model().objects.filter(id_role__nom_role="ADMINISTRATEUR")
    )

    # --- Rappels : prévues dans les 3 prochains jours ---
    limite = aujourdhui + timedelta(days=3)
    for m in ouvertes.filter(date_planifiee__range=(aujourdhui, limite)):
        jours = (m.date_planifiee - aujourdhui).days
        if jours == 0:
            quand = "aujourd'hui"
        elif jours == 1:
            quand = "demain"
        else:
            quand = f"dans {jours} jours ({m.date_planifiee.strftime('%d/%m/%Y')})"
        _creer_si_absent(
            user,
            "Rappel d'intervention",
            f"Intervention prévue {quand} sur « {m.id_equipement.nom} ».",
        )

    # --- Équipements en panne : rappel quotidien tant qu'il en reste ---
    en_panne = list(Equipement.objects.filter(etat__icontains="PANNE"))
    if en_panne:
        noms = ", ".join(f"« {e.nom} »" for e in en_panne[:3])
        suite = f" et {len(en_panne) - 3} autre(s)" if len(en_panne) > 3 else ""
        _creer_si_absent(
            user,
            "Équipements en panne",
            f"{len(en_panne)} équipement(s) en panne à traiter : {noms}{suite}.",
        )

    # --- En retard : date dépassée et pas terminée (responsable + admins) ---
    for m in ouvertes.filter(date_planifiee__lt=aujourdhui):
        jours = (aujourdhui - m.date_planifiee).days
        message = (
            f"L'intervention sur « {m.id_equipement.nom} » est en retard de "
            f"{jours} jour(s) (prévue le {m.date_planifiee.strftime('%d/%m/%Y')})."
        )
        for destinataire in [user] + admins:
            _creer_si_absent(destinataire, "Intervention en retard", message)