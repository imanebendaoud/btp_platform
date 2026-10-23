from rest_framework.routers import DefaultRouter
from .views import BudgetViewSet, DepenseViewSet, DemandeFinancementViewSet


router = DefaultRouter()

router.register(r"budgets", BudgetViewSet)
router.register(r"depenses", DepenseViewSet)
router.register(
    r"demandes-financement",
    DemandeFinancementViewSet,
    basename="demande-financement",
)

urlpatterns = router.urls