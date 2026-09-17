from rest_framework.routers import DefaultRouter

from .views import (
    EquipementViewSet,
    AffectationEquipementViewSet,
    MaintenanceViewSet,
)


router = DefaultRouter()

router.register(r"equipements", EquipementViewSet)
router.register(r"affectations", AffectationEquipementViewSet)
router.register(r"maintenances", MaintenanceViewSet)


urlpatterns = router.urls