from rest_framework.routers import DefaultRouter

from .views import (
    ProjetViewSet,
    TacheViewSet,
    AvancementViewSet,
    RapportChantierViewSet,
    PhotoViewSet,
    DocumentViewSet,
    NotificationViewSet,
)


router = DefaultRouter()

router.register(r"projets", ProjetViewSet)
router.register(r"taches", TacheViewSet)
router.register(r"avancements", AvancementViewSet)
router.register(r"rapports", RapportChantierViewSet)
router.register(r"photos", PhotoViewSet)
router.register(r"documents", DocumentViewSet)
router.register(r"notifications", NotificationViewSet)

urlpatterns = router.urls