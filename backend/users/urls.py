from django.urls import path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import MeView, AdminTestView


urlpatterns = [
    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),

    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    path(
        "me/",
        MeView.as_view(),
        name="me",
    ),

    path(
        "admin-test/",
        AdminTestView.as_view(),
        name="admin_test",
    ),
]