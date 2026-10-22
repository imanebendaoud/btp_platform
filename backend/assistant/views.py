import logging

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .agent import AssistantError, run_agent

logger = logging.getLogger("assistant")

MAX_MESSAGES = 12
MAX_CHARS = 2000


def _nettoyer(messages):
    """Valide l'historique envoyé par le navigateur (on ne lui fait pas confiance)."""
    if not isinstance(messages, list) or not messages:
        return None, "Aucun message reçu."

    propres = []
    for m in messages[-MAX_MESSAGES:]:
        if not isinstance(m, dict):
            return None, "Format de message invalide."
        role = m.get("role")
        content = m.get("content")
        if role not in ("user", "assistant") or not isinstance(content, str) or not content.strip():
            return None, "Format de message invalide."
        propres.append({"role": role, "content": content.strip()[:MAX_CHARS]})

    while propres and propres[0]["role"] != "user":
        propres.pop(0)

    if not propres or propres[-1]["role"] != "user":
        return None, "Le dernier message doit venir de l'utilisateur."

    return propres, None


class ChatView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "assistant"

    def post(self, request):
        if request.user.id_role.nom_role != "ADMINISTRATEUR":
            return Response({"detail": "Accès réservé à l'administrateur."}, status=403)

        history, erreur = _nettoyer(request.data.get("messages"))
        if erreur:
            return Response({"detail": erreur}, status=400)

        try:
            result = run_agent(history)
        except AssistantError as exc:
            return Response({"detail": str(exc)}, status=503)

        logger.info(
            "assistant user=%s outils=%s tokens=%s",
            request.user.pk,
            [t["name"] for t in result["tools_used"]],
            result["usage"],
        )
        return Response(result)