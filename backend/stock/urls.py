from rest_framework.routers import DefaultRouter

from .views import (
    FournisseurViewSet,
    MateriauViewSet,
    AchatViewSet,
    MouvementStockViewSet,
)


router = DefaultRouter()

router.register(r"fournisseurs", FournisseurViewSet)
router.register(r"materiaux", MateriauViewSet)
router.register(r"achats", AchatViewSet)
router.register(r"mouvements", MouvementStockViewSet)


urlpatterns = router.urls