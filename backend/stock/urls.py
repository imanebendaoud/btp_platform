
from rest_framework.routers import DefaultRouter

from .views import (
    FournisseurViewSet,
    MateriauViewSet,
    AchatViewSet,
    MouvementStockViewSet,
    DemandeMateriauViewSet,
)


router = DefaultRouter()

router.register(r"fournisseurs", FournisseurViewSet)
router.register(r"materiaux", MateriauViewSet)
router.register(r"achats", AchatViewSet)
router.register(r"mouvements", MouvementStockViewSet)
router.register(
    r"demandes-materiaux",
    DemandeMateriauViewSet,
    basename="demande-materiau",
)


urlpatterns = router.urls
