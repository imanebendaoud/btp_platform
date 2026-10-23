from rest_framework.routers import DefaultRouter

from .views import (
    EmployeViewSet,
    AffectationEmployeViewSet,
    ContratViewSet,
    CongeAbsenceViewSet,
    PointageViewSet,
)

router = DefaultRouter()

router.register(r"employes", EmployeViewSet, basename="employe")
router.register(r"affectations", AffectationEmployeViewSet, basename="affectation")
router.register(r"contrats", ContratViewSet, basename="contrat")
router.register(r"conges-absences", CongeAbsenceViewSet, basename="conge-absence")
router.register(r"pointages", PointageViewSet, basename="pointage")

urlpatterns = router.urls