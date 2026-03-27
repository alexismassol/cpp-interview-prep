/**
 * StatsView.jsx — Mode stats : progression par catégorie
 */
import { questions, categoryColors } from '../data/questions.js'

export default function StatsView({ scores }) {
  const answered  = Object.keys(scores).length
  const correct   = Object.values(scores).filter(v => v === "ok").length
  const incorrect = Object.values(scores).filter(v => v === "ko").length

  return (
    <div>
      <div style={{ fontSize: "14px", color: "#8b949e", marginBottom: "20px" }}>
        Progression globale
      </div>

      {/* Compteurs globaux */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px",
        marginBottom: "24px",
      }}>
        {[
          { label: "Répondues",  value: answered,  color: "#58a6ff" },
          { label: "Correctes",  value: correct,   color: "#2ea043" },
          { label: "Incorrectes",value: incorrect, color: "#e94560" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#161b22", border: "1px solid #21262d",
            borderRadius: "10px", padding: "20px", textAlign: "center",
          }}>
            <div style={{ fontSize: "32px", fontWeight: "700", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#8b949e", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Barres par catégorie */}
      {Object.entries(categoryColors).map(([cat, colors]) => {
        const catQs       = questions.filter(q => q.category === cat)
        const catAnswered  = catQs.filter(q => scores[q.question]).length
        const catOk        = catQs.filter(q => scores[q.question] === "ok").length
        return (
          <div key={cat} style={{
            background: "#161b22", border: "1px solid #21262d",
            borderRadius: "10px", padding: "16px", marginBottom: "8px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#e6edf3", fontSize: "13px" }}>{cat}</span>
              <span style={{ color: "#8b949e", fontSize: "12px" }}>{catAnswered}/{catQs.length}</span>
            </div>
            <div style={{ background: "#21262d", borderRadius: "4px", height: "6px" }}>
              <div style={{
                background: colors.accent,
                width: `${catQs.length ? (catOk / catQs.length) * 100 : 0}%`,
                height: "6px",
                borderRadius: "4px",
                transition: "width 0.5s",
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
