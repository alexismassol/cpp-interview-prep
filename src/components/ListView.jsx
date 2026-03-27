/**
 * ListView.jsx — Mode liste : toutes les questions avec statut
 * Clic sur une ligne → passe en mode cards sur cette question
 */
import { difficultyColor } from '../data/questions.js'

export default function ListView({ questions, scores, onSelect }) {
  return (
    <div>
      {questions.map((q, i) => {
        const s = scores[q.question]
        return (
          <div
            key={i}
            onClick={() => onSelect(i)}
            style={{
              background: "#161b22",
              border: "1px solid",
              borderColor: s === "ok" ? "#238636" : s === "ko" ? "#da3633" : "#21262d",
              borderRadius: "10px",
              padding: "14px 16px",
              marginBottom: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {/* Indicateur de statut */}
            <div style={{
              width: "28px", height: "28px", borderRadius: "6px", flexShrink: 0,
              background: s === "ok" ? "rgba(35,134,54,0.2)" : s === "ko" ? "rgba(218,54,51,0.2)" : "#21262d",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
            }}>
              {s === "ok" ? "✓" : s === "ko" ? "✗" : (i + 1)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", color: "#e6edf3", marginBottom: "3px" }}>{q.question}</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ fontSize: "10px", color: "#8b949e" }}>{q.category}</span>
                <span style={{ fontSize: "10px", color: difficultyColor[q.difficulty] || "#8b949e" }}>
                  {q.difficulty}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
