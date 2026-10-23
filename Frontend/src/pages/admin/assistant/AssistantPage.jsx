import { useEffect, useRef, useState } from "react";
import { sendAssistantMessage } from "../../../services/assistantService";
import "./AssistantPage.css";

const SUGGESTIONS = [
  "Fais-moi un résumé de la situation actuelle",
  "Quels équipements sont en panne ?",
  "Quels matériaux sont sous le seuil minimum ?",
  "Quel projet consomme le plus de budget par rapport à son avancement ?",
  "Y a-t-il des interventions ou des tâches en retard ?",
  "Quelles demandes de financement sont en attente ?",
];

const TOOL_LABELS = {
  resume_global: "Vue d'ensemble",
  liste_projets: "Projets",
  budget_projet: "Budget d'un projet",
  taches_en_retard: "Tâches en retard",
  stock_critique: "Stock critique",
  equipements_en_panne: "Équipements en panne",
  interventions_en_retard: "Interventions en retard",
  demandes_financement_en_attente: "Demandes de financement",
};

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

function RichText({ text }) {
  const blocks = [];
  let current = null;

  text.split("\n").forEach((rawLine) => {
    const line = rawLine.replace(/^#+\s*/, "");
    const item = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);

    if (item) {
      if (!current) {
        current = [];
        blocks.push({ type: "list", items: current });
      }
      current.push(item[1]);
    } else {
      current = null;
      if (line.trim()) blocks.push({ type: "p", text: line });
    }
  });

  return blocks.map((block, i) =>
    block.type === "list" ? (
      <ul key={i}>
        {block.items.map((it, j) => (
          <li key={j}>{renderInline(it)}</li>
        ))}
      </ul>
    ) : (
      <p key={i}>{renderInline(block.text)}</p>
    )
  );
}

function AssistantPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const question = text.trim();
    if (!question || loading) return;

    const history = messages
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendAssistantMessage([
        ...history,
        { role: "user", content: question },
      ]);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, tools: data.tools_used || [] },
      ]);
    } catch (err) {
      console.error(err);
      let message = "Impossible de contacter l'assistant.";
      if (err?.response?.status === 429) {
        message = "Limite de questions atteinte. Réessayez un peu plus tard.";
      } else if (err?.response?.data?.detail) {
        message = err.response.data.detail;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: message, error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="assistant-page">
      <div className="assistant-header">
        <div>
          <p className="assistant-eyebrow">✦ INTELLIGENCE ARTIFICIELLE</p>
          <h1>Assistant intelligent BTP</h1>
          <p className="assistant-subtitle">
            Posez vos questions sur les projets, budgets, stocks et équipements.
            L'assistant consulte vos données en lecture seule.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            className="assistant-reset"
            onClick={() => setMessages([])}
            disabled={loading}
          >
            Nouvelle conversation
          </button>
        )}
      </div>

      <div className="assistant-chat">
        <div className="assistant-messages">
          {messages.length === 0 && !loading && (
            <div className="assistant-empty">
              <div className="assistant-empty-icon">✦</div>
              <h2>Comment puis-je vous aider ?</h2>
              <p>Essayez une de ces questions :</p>
              <div className="assistant-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`assistant-row assistant-row-${m.role}`}>
              <div
                className={
                  "assistant-bubble assistant-bubble-" +
                  m.role +
                  (m.error ? " assistant-bubble-error" : "")
                }
              >
                {m.role === "assistant" ? <RichText text={m.content} /> : <p>{m.content}</p>}

                {m.tools && m.tools.length > 0 && (
                  <div className="assistant-tools">
                    <span>Données consultées :</span>
                    {[...new Set(m.tools.map((t) => t.name))].map((name) => (
                      <em key={name}>{TOOL_LABELS[name] || name}</em>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="assistant-row assistant-row-assistant">
              <div className="assistant-bubble assistant-bubble-assistant">
                <div className="assistant-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form
          className="assistant-input"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            rows={1}
            placeholder="Posez votre question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            maxLength={2000}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Envoyer
          </button>
        </form>
      </div>
    </div>
  );
}

export default AssistantPage;