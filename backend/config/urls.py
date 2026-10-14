"""
URL configuration for config project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from users.dashboard_views import DashboardSummaryView


urlpatterns = [
    path("admin/", admin.site.urls),

    # AUTHENTIFICATION
    path("api/auth/", include("users.urls")),

    # UTILISATEURS
    path("api/users/", include("users.urls")),

    # FINANCE
    path("api/finance/", include("finance.urls")),

    # RH
    path("api/hr/", include("hr.urls")),

    # MAINTENANCE
    path("api/maintenance/", include("maintenance.urls")),

    # PROJETS
    path("api/projects/", include("projects.urls")),

    # STOCK
    path("api/stock/", include("stock.urls")),

    # DASHBOARD
    path(
        "api/dashboard/summary/",
        DashboardSummaryView.as_view(),
        name="dashboard-summary",
    ),
]

# Fichiers médias en environnement de développement
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
