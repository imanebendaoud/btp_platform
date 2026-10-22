"""
Outils en LECTURE SEULE que l'agent peut appeler.
Aucune écriture en base ici : l'IA ne peut que consulter.
"""
from datetime import date
from decimal import Decimal

from django.db.models import Count, F, Sum

from finance.models import Budget, DemandeFinancement, Depense
from maintenance.models import Equipement, Maintenance
from projects.models import Avancement, Projet, Tache
from stock.models import Materiau


# ------------------------------------------------------------
# Utilitaires
# ------------------------------------------------------------

def _n(value):
    """Decimal -> float pour la sérialisation JSON."""
    if value is None:
        return None
    if isinstance(value, Decimal):
        return float(value)
    return value


def _trouver_projet(ref):
    ref = str(ref).strip()
    if ref.isdigit():
        p = Projet.objects.filter(pk=int(ref)).first()
        if p:
            return p
    return (
        Projet.objects.filter(numero_projet__iexact=ref).first()
        or Projet.objects.filter(nom__icontains=ref).first()
    )


def _avancement_actuel(projet_id):
    a = (
        Avancement.objects.filter(id_projet_id=projet_id)
        .order_by("-date_avancement", "-id_avancement")
        .first()
    )
    return _n(a.pourcentage) if a else None


def _depenses_total(projet_id):
    total = Depense.objects.filter(id_projet_id=projet_id).aggregate(t=Sum("montant"))["t"]
    return _n(total) or 0.0


def _interventions_ouvertes():
    return Maintenance.objects.exclude(statut__istartswith="TERMIN").exclude(
        statut__istartswith="ANNUL"
    )


# ------------------------------------------------------------
# Outils
# ------------------------------------------------------------

def resume_global():
    projets = Projet.objects.all()
    par_statut = {
        (r["statut"] or "inconnu"): r["n"]
        for r in projets.values("statut").annotate(n=Count("pk"))
    }
    budget_total = projets.aggregate(t=Sum("budget_initial"))["t"]
    depenses_total = Depense.objects.aggregate(t=Sum("montant"))["t"]
    demandes = DemandeFinancement.objects.filter(statut="EN_ATTENTE")

    return {
        "date_du_jour": date.today().isoformat(),
        "projets_total": projets.count(),
        "projets_par_statut": par_statut,
        "budget_initial_total_dh": _n(budget_total) or 0.0,
        "depenses_total_dh": _n(depenses_total) or 0.0,
        "materiaux_sous_seuil": Materiau.objects.filter(
            stock_actuel__lte=F("stock_minimum")
        ).count(),
        "equipements_en_panne": Equipement.objects.filter(etat__icontains="PANNE").count(),
        "interventions_ouvertes": _interventions_ouvertes().count(),
        "demandes_financement_en_attente": demandes.count(),
        "demandes_financement_montant_dh": _n(
            demandes.aggregate(t=Sum("montant_demande"))["t"]
        )
        or 0.0,
    }


def liste_projets(statut=None, limite=20):
    qs = Projet.objects.all().order_by("-id_projet")
    if statut:
        qs = qs.filter(statut__icontains=statut)

    projets = []
    for p in qs[: int(limite or 20)]:
        projets.append(
            {
                "id": p.id_projet,
                "numero": p.numero_projet,
                "nom": p.nom,
                "client": p.client,
                "statut": p.statut,
                "date_debut": p.date_debut,
                "date_fin_prevue": p.date_fin_prevue,
                "budget_initial_dh": _n(p.budget_initial),
                "depenses_dh": _depenses_total(p.id_projet),
                "avancement_pourcent": _avancement_actuel(p.id_projet),
            }
        )
    return {"nombre_total": qs.count(), "projets": projets}


def budget_projet(projet):
    p = _trouver_projet(projet)
    if not p:
        return {"erreur": f"Projet introuvable : {projet}"}

    budget = Budget.objects.filter(id_projet=p).first()
    budget_total = _n(budget.montant_total) if budget else _n(p.budget_initial)

    par_categorie = [
        {"categorie": r["categorie"], "total_dh": _n(r["total"])}
        for r in Depense.objects.filter(id_projet=p)
        .values("categorie")
        .annotate(total=Sum("montant"))
        .order_by("-total")
    ]
    total_depenses = _depenses_total(p.id_projet)
    taux = round(total_depenses / budget_total * 100, 1) if budget_total else None
    avancement = _avancement_actuel(p.id_projet)
    ecart = (
        round(taux - avancement, 1)
        if taux is not None and avancement is not None
        else None
    )

    return {
        "projet": p.nom,
        "numero": p.numero_projet,
        "statut": p.statut,
        "budget_total_dh": budget_total,
        "depenses_total_dh": total_depenses,
        "taux_consommation_pourcent": taux,
        "avancement_pourcent": avancement,
        "ecart_consommation_moins_avancement": ecart,
        "depenses_par_categorie": par_categorie,
    }


def taches_en_retard(projet=None):
    qs = (
        Tache.objects.select_related("id_projet")
        .filter(date_fin_reelle__isnull=True, date_fin_prevue__lt=date.today())
        .exclude(statut__istartswith="TERMIN")
        .order_by("date_fin_prevue")
    )
    if projet:
        p = _trouver_projet(projet)
        if not p:
            return {"erreur": f"Projet introuvable : {projet}"}
        qs = qs.filter(id_projet=p)

    today = date.today()
    return {
        "nombre": qs.count(),
        "taches": [
            {
                "projet": t.id_projet.nom,
                "tache": t.titre,
                "priorite": t.priorite,
                "date_fin_prevue": t.date_fin_prevue,
                "jours_de_retard": (today - t.date_fin_prevue).days,
            }
            for t in qs[:20]
        ],
    }


def stock_critique():
    qs = Materiau.objects.filter(stock_actuel__lte=F("stock_minimum")).order_by("nom")
    return {
        "nombre": qs.count(),
        "materiaux": [
            {
                "nom": m.nom,
                "unite": m.unite,
                "stock_actuel": _n(m.stock_actuel),
                "stock_minimum": _n(m.stock_minimum),
                "manque": _n(m.stock_minimum - m.stock_actuel),
            }
            for m in qs[:20]
        ],
    }


def equipements_en_panne():
    qs = Equipement.objects.filter(etat__icontains="PANNE").order_by("nom")
    return {
        "nombre": qs.count(),
        "equipements": [
            {
                "nom": e.nom,
                "type": e.type,
                "numero_serie": e.numero_serie,
                "etat": e.etat,
                "disponibilite": e.disponibilite,
            }
            for e in qs[:20]
        ],
    }


def interventions_en_retard():
    today = date.today()
    qs = (
        _interventions_ouvertes()
        .select_related("id_equipement")
        .filter(date_planifiee__lt=today)
        .order_by("date_planifiee")
    )
    return {
        "nombre": qs.count(),
        "interventions": [
            {
                "equipement": m.id_equipement.nom,
                "type": m.type_intervention,
                "statut": m.statut,
                "date_planifiee": m.date_planifiee,
                "jours_de_retard": (today - m.date_planifiee).days,
                "technicien": m.technicien,
            }
            for m in qs[:20]
        ],
    }


def demandes_financement_en_attente():
    qs = (
        DemandeFinancement.objects.select_related("id_equipement", "id_projet")
        .filter(statut="EN_ATTENTE")
        .order_by("-date_demande")
    )
    return {
        "nombre": qs.count(),
        "demandes": [
            {
                "equipement": d.id_equipement.nom,
                "projet": d.id_projet.nom,
                "motif": d.motif,
                "montant_demande_dh": _n(d.montant_demande),
                "urgence": d.urgence,
                "date_demande": d.date_demande,
            }
            for d in qs[:20]
        ],
    }


# ------------------------------------------------------------
# Déclaration des outils pour le modèle
# ------------------------------------------------------------

_AUCUN_PARAM = {"type": "object", "properties": {}}

TOOL_DEFINITIONS = [
    {
        "name": "resume_global",
        "description": "Vue d'ensemble de la plateforme : nombre de projets par statut, budget et dépenses totaux, stock sous le seuil, équipements en panne, interventions ouvertes, demandes de financement en attente. À utiliser pour les questions générales.",
        "input_schema": _AUCUN_PARAM,
    },
    {
        "name": "liste_projets",
        "description": "Liste les projets avec leur statut, budget initial, dépenses cumulées et avancement actuel.",
        "input_schema": {
            "type": "object",
            "properties": {
                "statut": {"type": "string", "description": "Filtre facultatif sur le statut (recherche partielle)."},
                "limite": {"type": "integer", "description": "Nombre maximum de projets (20 par défaut)."},
            },
        },
    },
    {
        "name": "budget_projet",
        "description": "Détail budgétaire d'un projet : budget, dépenses par catégorie, taux de consommation, avancement, et écart entre consommation et avancement (un écart positif élevé signale un risque de dépassement).",
        "input_schema": {
            "type": "object",
            "properties": {
                "projet": {"type": "string", "description": "Identifiant, numéro ou nom (même partiel) du projet."}
            },
            "required": ["projet"],
        },
    },
    {
        "name": "taches_en_retard",
        "description": "Tâches non terminées dont la date de fin prévue est dépassée, pour tous les projets ou pour un projet précis.",
        "input_schema": {
            "type": "object",
            "properties": {
                "projet": {"type": "string", "description": "Identifiant, numéro ou nom du projet (facultatif)."}
            },
        },
    },
    {
        "name": "stock_critique",
        "description": "Matériaux dont le stock actuel est inférieur ou égal au stock minimum.",
        "input_schema": _AUCUN_PARAM,
    },
    {
        "name": "equipements_en_panne",
        "description": "Équipements actuellement en panne.",
        "input_schema": _AUCUN_PARAM,
    },
    {
        "name": "interventions_en_retard",
        "description": "Interventions de maintenance ouvertes dont la date planifiée est dépassée.",
        "input_schema": _AUCUN_PARAM,
    },
    {
        "name": "demandes_financement_en_attente",
        "description": "Demandes de financement du service maintenance en attente de décision du responsable financier.",
        "input_schema": _AUCUN_PARAM,
    },
]

_REGISTRE = {
    "resume_global": resume_global,
    "liste_projets": liste_projets,
    "budget_projet": budget_projet,
    "taches_en_retard": taches_en_retard,
    "stock_critique": stock_critique,
    "equipements_en_panne": equipements_en_panne,
    "interventions_en_retard": interventions_en_retard,
    "demandes_financement_en_attente": demandes_financement_en_attente,
}


def execute_tool(name, args):
    """Exécute un outil de la liste blanche. Ne lève jamais d'exception."""
    func = _REGISTRE.get(name)
    if func is None:
        return {"erreur": f"Outil inconnu : {name}"}
    try:
        return func(**(args if isinstance(args, dict) else {}))
    except TypeError:
        return {"erreur": "Paramètres invalides pour cet outil."}
    except Exception as exc:
        return {"erreur": f"Échec de l'outil : {exc}"}