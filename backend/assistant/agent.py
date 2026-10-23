import json
import logging
from datetime import date

from django.conf import settings
from openai import OpenAI, OpenAIError, RateLimitError

from .tools import TOOL_DEFINITIONS, execute_tool

logger = logging.getLogger("assistant")

MAX_ITERATIONS = 6
MAX_TOKENS = 1200

SYSTEM_PROMPT = """Tu es l'assistant IA d'une plateforme de gestion de chantiers BTP \
(BOUSSAKSOU DE CONSTRUCTION). Tu t'adresses à l'administrateur.

Règles :
- Réponds toujours en français, de façon claire et concise.
- Appuie-toi UNIQUEMENT sur les données renvoyées par tes outils. N'invente jamais un chiffre, un nom ou une date.
- Si les outils ne permettent pas de répondre, dis-le franchement et explique ce qui manque.
- Appelle les outils dont tu as besoin avant de répondre, plusieurs si nécessaire.
- Donne les montants en DH avec séparateur de milliers (ex. 20 000 DH) et les dates au format jj/mm/aaaa.
- Pour comparer ou analyser, donne ton raisonnement en une ou deux phrases et une recommandation concrète.
- Évite les tableaux : préfère de courtes listes à puces et du texte en **gras** pour les chiffres clés.
- Tu es en lecture seule : tu ne peux rien modifier dans la plateforme.
- Date du jour : {date}."""


class AssistantError(Exception):
    """Erreur affichable à l'utilisateur."""


def _client():
    if not getattr(settings, "LLM_API_KEY", None) or not getattr(settings, "LLM_BASE_URL", None):
        raise AssistantError(
            "L'IA n'est pas configurée sur le serveur (LLM_API_KEY / LLM_BASE_URL)."
        )
    return OpenAI(
        api_key=settings.LLM_API_KEY,
        base_url=settings.LLM_BASE_URL,
        timeout=60,
    )


def _tools_openai():
    """Convertit nos définitions d'outils au format 'compatible OpenAI'."""
    return [
        {
            "type": "function",
            "function": {
                "name": t["name"],
                "description": t["description"],
                "parameters": t["input_schema"],
            },
        }
        for t in TOOL_DEFINITIONS
    ]


def run_agent(history):
    """
    history : liste [{"role": "user"|"assistant", "content": str}, ...]
    Retourne {"answer": str, "tools_used": [...], "usage": {...}}.
    """
    client = _client()
    system = SYSTEM_PROMPT.format(date=date.today().strftime("%d/%m/%Y"))
    messages = [{"role": "system", "content": system}] + [dict(m) for m in history]
    tools = _tools_openai()
    tools_used = []
    tokens_in = 0
    tokens_out = 0

    for _ in range(MAX_ITERATIONS):
        try:
            response = client.chat.completions.create(
                model=settings.LLM_MODEL,
                messages=messages,
                tools=tools,
                tool_choice="auto",
                max_tokens=MAX_TOKENS,
                temperature=0.2,
            )
        except RateLimitError as exc:
            logger.warning("Limite du fournisseur atteinte : %s", exc)
            raise AssistantError(
                "Limite du fournisseur gratuit atteinte. Patientez une minute puis réessayez."
            ) from exc
        except OpenAIError as exc:
            logger.exception("Erreur API assistant")
            raise AssistantError(
                "Le service d'IA est momentanément indisponible. Vérifiez la clé et le nom du modèle."
            ) from exc

        if response.usage:
            tokens_in += response.usage.prompt_tokens or 0
            tokens_out += response.usage.completion_tokens or 0

        message = response.choices[0].message

        # Réponse finale : aucun outil demandé
        if not message.tool_calls:
            return {
                "answer": (message.content or "").strip()
                or "Je n'ai pas pu formuler de réponse.",
                "tools_used": tools_used,
                "usage": {"input_tokens": tokens_in, "output_tokens": tokens_out},
            }

        # Le modèle demande des outils : on mémorise sa demande...
        messages.append(
            {
                "role": "assistant",
                "content": message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        },
                    }
                    for tc in message.tool_calls
                ],
            }
        )

        # ... puis on les exécute et on lui renvoie les résultats
        for tc in message.tool_calls:
            try:
                args = json.loads(tc.function.arguments or "{}")
            except json.JSONDecodeError:
                args = {}
            tools_used.append({"name": tc.function.name, "input": args})
            output = execute_tool(tc.function.name, args)
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": json.dumps(output, ensure_ascii=False, default=str),
                }
            )

    raise AssistantError(
        "La question demande trop d'étapes. Reformulez-la de façon plus précise."
    )