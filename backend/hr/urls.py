from rest_framework.routers import DefaultRouter

from .views import (
    EmployeViewSet,
    AffectationEmployeViewSet,
    ContratViewSet,
    CongeAbsenceViewSet,
    PointageViewSet,
)


router = DefaultRouter()

router.register(r"employes", EmployeViewSet)
router.register(r"affectations", AffectationEmployeViewSet)
router.register(r"contrats", ContratViewSet)
router.register(r"conges-absences", CongeAbsenceViewSet)
router.register(r"pointages", PointageViewSet)


urlpatterns = router.urls