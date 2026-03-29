/**
 * FlashCard.jsx - Carte interactive question/réponse
 * Props : question, scores, currentIndex, filteredLength, onScore, onNavigate
 */
import { categoryColors, difficultyColor } from '../data/questions.js'
import AnswerDisplay from './AnswerDisplay.jsx'

export default function FlashCard({
  question: q,
  showAnswer,
  onReveal,
  onScore,
  onNavigate,
  currentIndex,
  filteredLength,
  scores,
  animating,
}) {
  if (!q) return null

  const catColor = categoryColors[q.category] || { accent: "#58a6ff", light: "rgba(88,166,255,0.12)" }
  const progress = filteredLength > 0 ? (currentIndex / filteredLength) * 100 : 0

  return (
    <div>
      {/* Barre de progression */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", color: "#8b949e" }}>
            {currentIndex + 1} / {filteredLength}
          </span>
          <span style={{ fontSize: "11px", color: difficultyColor[q.difficulty] || "#8b949e" }}>
            {q.difficulty}
          </span>
        </div>
        <div style={{ background: "#21262d", borderRadius: "4px", height: "4px" }}>
          <div style={{
            background: "#58a6ff",
            width: `${progress}%`,
            height: "4px",
            borderRadius: "4px",
            transition: "width 0.3s",
          }} />
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: "#161b22",
        border: "1px solid #21262d",
        borderRadius: "14px",
        overflow: "hidden",
        opacity: animating ? 0.4 : 1,
        transform: animating ? "translateY(8px)" : "translateY(0)",
        transition: "all 0.15s ease",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      }}>
        {/* Badge catégorie */}
        <div style={{
          padding: "10px 20px",
          background: "#0d1117",
          borderBottom: "1px solid #21262d",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{
            padding: "2px 10px",
            borderRadius: "20px",
            background: catColor.light,
            color: catColor.accent,
            border: `1px solid ${catColor.accent}40`,
            fontSize: "11px",
          }}>
            {q.category}
          </span>
          {scores[q.question] && (
            <span style={{
              marginLeft: "auto",
              fontSize: "12px",
              color: scores[q.question] === "ok" ? "#2ea043" : "#e94560",
            }}>
              {scores[q.question] === "ok" ? "✓ Maîtrisé" : "✗ À revoir"}
            </span>
          )}
        </div>

        {/* Question */}
        <div style={{ padding: "24px 24px 20px" }}>
          <div style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#e6edf3",
            lineHeight: "1.5",
            letterSpacing: "-0.2px",
          }}>
            {q.question}
          </div>
        </div>

        {/* Bouton révéler / Réponse */}
        {!showAnswer ? (
          <div style={{ padding: "0 24px 24px" }}>
            <button
              onClick={onReveal}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #30363d",
                background: "rgba(88,166,255,0.07)",
                color: "#58a6ff",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "inherit",
                letterSpacing: "0.5px",
                transition: "all 0.2s",
              }}
            >
              ▶ Révéler la réponse
            </button>
          </div>
        ) : (
          <div>
            {/* Réponse */}
            <div style={{
              padding: "20px 24px",
              borderTop: "1px solid #21262d",
              background: "#0d1117",
            }}>
              <AnswerDisplay text={q.answer} />

              {/* Tip mnémotechnique */}
              <div style={{
                marginTop: "16px",
                padding: "10px 14px",
                background: "rgba(240,165,0,0.08)",
                border: "1px solid rgba(240,165,0,0.2)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#f0a500",
              }}>
                💡 {q.tip}
              </div>
            </div>

            {/* Boutons score */}
            <div style={{
              padding: "16px 24px",
              borderTop: "1px solid #21262d",
              display: "flex",
              gap: "10px",
            }}>
              <button onClick={() => onScore("ko")} style={{
                flex: 1, padding: "10px", borderRadius: "8px",
                border: "1px solid #da3633", background: "rgba(218,54,51,0.1)",
                color: "#f85149", cursor: "pointer", fontSize: "13px", fontFamily: "inherit",
              }}>
                ✗ À revoir
              </button>
              <button onClick={() => onScore("ok")} style={{
                flex: 1, padding: "10px", borderRadius: "8px",
                border: "1px solid #238636", background: "rgba(35,134,54,0.1)",
                color: "#3fb950", cursor: "pointer", fontSize: "13px", fontFamily: "inherit",
              }}>
                ✓ Maîtrisé
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", gap: "10px" }}>
        <button onClick={() => onNavigate(-1)} style={{
          padding: "10px 24px", borderRadius: "8px",
          border: "1px solid #30363d", background: "transparent",
          color: "#8b949e", cursor: "pointer", fontSize: "13px", fontFamily: "inherit",
        }}>
          ← Précédente
        </button>
        <button onClick={() => onNavigate(1)} style={{
          padding: "10px 24px", borderRadius: "8px",
          border: "1px solid #30363d", background: "transparent",
          color: "#8b949e", cursor: "pointer", fontSize: "13px", fontFamily: "inherit",
        }}>
          Suivante →
        </button>
      </div>
    </div>
  )
}
