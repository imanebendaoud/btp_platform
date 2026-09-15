from rest_framework.routers import DefaultRouter
from .views import BudgetViewSet, DepenseViewSet


router = DefaultRouter()

router.register(r"budgets", BudgetViewSet)
router.register(r"depenses", DepenseViewSet)

urlpatterns = router.urls