from django.db import connection
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        with connection.cursor() as cursor:

            # ==========================
            # PROJETS
            # ==========================

            cursor.execute("""
                SELECT COUNT(*)
                FROM projets
            """)
            total_projets = cursor.fetchone()[0]

            # ==========================
            # EMPLOYES
            # ==========================

            cursor.execute("""
                SELECT COUNT(*)
                FROM employes
            """)
            total_employes = cursor.fetchone()[0]

            # ==========================
            # MATERIAUX
            # ==========================

            cursor.execute("""
                SELECT COUNT(*)
                FROM materiaux
            """)
            total_materiaux = cursor.fetchone()[0]

            # ==========================
            # EQUIPEMENTS
            # ==========================

            cursor.execute("""
                SELECT COUNT(*)
                FROM equipements
            """)
            total_equipements = cursor.fetchone()[0]

            # ==========================
            # ALERTES STOCK
            # ==========================

            cursor.execute("""
                SELECT COUNT(*)
                FROM materiaux
                WHERE stock_actuel <= stock_minimum
            """)
            alertes_stock = cursor.fetchone()[0]

            # ==========================
            # DEPENSES
            # ==========================

            cursor.execute("""
                SELECT COALESCE(SUM(montant), 0)
                FROM depenses
            """)
            total_depenses = cursor.fetchone()[0]

            # ==========================
            # BUDGET INITIAL
            # ==========================

            cursor.execute("""
                SELECT COALESCE(SUM(budget_initial), 0)
                FROM projets
            """)
            budget_initial = cursor.fetchone()[0]

            # ==========================
            # PROJETS RECENTS
            # ==========================

            cursor.execute("""
                SELECT
                    numero_projet,
                    nom,
                    localisation,
                    statut
                FROM projets
                ORDER BY id_projet DESC
                LIMIT 5
            """)

            projets_recents = []

            for row in cursor.fetchall():
                projets_recents.append({
                    "numero_projet": row[0],
                    "nom": row[1],
                    "localisation": row[2],
                    "statut": row[3],
                })

        # ==========================
        # CALCUL DU BUDGET
        # ==========================

        if budget_initial and budget_initial > 0:
            budget_utilise = round(
                (float(total_depenses) / float(budget_initial)) * 100,
                1
            )
        else:
            budget_utilise = 0

        return Response({
            "projets": total_projets,
            "employes": total_employes,
            "materiaux": total_materiaux,
            "equipements": total_equipements,
            "alertes_stock": alertes_stock,
            "total_depenses": float(total_depenses),
            "budget_initial": float(budget_initial),
            "budget_utilise": budget_utilise,
            "projets_recents": projets_recents,
        })