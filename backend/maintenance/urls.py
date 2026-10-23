
from rest_framework.routers import DefaultRouter

from .views import (
    EquipementViewSet,
    AffectationEquipementViewSet,
    MaintenanceViewSet,
    DemandeEquipementViewSet,
)

router = DefaultRouter()

router.register(
    r"equipements",
    EquipementViewSet,
)

router.register(
    r"affectations",
    AffectationEquipementViewSet,
)

router.register(
    r"maintenances",
    MaintenanceViewSet,
)

router.register(
    r"demandes-equipements",
    DemandeEquipementViewSet,
    basename="demande-equipement",
)

urlpatterns = router.urls
