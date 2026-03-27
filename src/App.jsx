/**
 * App.jsx — C/C++ Interview Prep
 * Stack : React 18, Vite — 100% client-side, aucun backend requis
 *
 * Structure :
 *   Header    — titre, compteurs, sélecteur de mode
 *   Filters   — filtres par catégorie + bouton shuffle
 *   Content   — FlashCard | ListView | StatsView selon le mode actif
 */
import { useFlashcards } from './hooks/useFlashcards.js'
import FlashCard  from './components/FlashCard.jsx'
import ListView   from './components/ListView.jsx'
import StatsView  from './components/StatsView.jsx'

export default function App() {
  const {
    current, currentIndex, filtered, showAnswer, scores,
    filter, mode, animating, isShuffleActive, categories,
    setFilter, setMode, setShowAnswer,
    navigate, scoreCard, handleShuffle, selectFromList,
  } = useFlashcards()

  const answered  = Object.keys(scores).length
  const correct   = Object.values(scores).filter(v => v === "ok").length
  const incorrect = Object.values(scores).filter(v => v === "ko").length

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
      color: "#e6edf3",
    }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{
        borderBottom: "1px solid #21262d",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#161b22",
      }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: "700", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#58a6ff" }}>C</span>
            <span style={{ color: "#e6edf3" }}>/</span>
            <span style={{ color: "#58a6ff" }}>C++</span>
            <span style={{ color: "#8b949e", fontSize: "13px", marginLeft: "10px", fontWeight: "400" }}>
              Interview Prep
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "#8b949e", marginTop: "2px" }}>
            {answered} répondues · {correct} ✓ · {incorrect} ✗ · {filtered.length} questions
          </div>
        </div>

        {/* Sélecteur de mode */}
        <div style={{ display: "flex", gap: "8px" }}>
          {["cards", "list", "stats"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border: "1px solid",
              borderColor: mode === m ? "#58a6ff" : "#30363d",
              background: mode === m ? "rgba(88,166,255,0.1)" : "transparent",
              color: mode === m ? "#58a6ff" : "#8b949e",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "inherit",
            }}>
              {m === "cards" ? "📇 Cards" : m === "list" ? "📋 Liste" : "📊 Stats"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filtres par catégorie ────────────────────────────────────────────── */}
      <div style={{
        padding: "12px 24px",
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        borderBottom: "1px solid #21262d",
        background: "#161b22",
        alignItems: "center",
      }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: "4px 12px",
            borderRadius: "20px",
            border: "1px solid",
            borderColor: filter === cat ? "#58a6ff" : "#30363d",
            background: filter === cat ? "rgba(88,166,255,0.15)" : "transparent",
            color: filter === cat ? "#58a6ff" : "#8b949e",
            cursor: "pointer",
            fontSize: "11px",
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}>
            {cat}
          </button>
        ))}
        <button onClick={handleShuffle} style={{
          marginLeft: "auto",
          padding: "4px 12px",
          borderRadius: "20px",
          border: "1px solid #30363d",
          background: isShuffleActive ? "rgba(240,165,0,0.1)" : "transparent",
          color: isShuffleActive ? "#f0a500" : "#8b949e",
          cursor: "pointer",
          fontSize: "11px",
          fontFamily: "inherit",
        }}>
          🔀 Aléatoire
        </button>
      </div>

      {/* ── Contenu principal ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px" }}>
        {mode === "stats" && (
          <StatsView scores={scores} />
        )}

        {mode === "list" && (
          <ListView
            questions={filtered}
            scores={scores}
            onSelect={selectFromList}
          />
        )}

        {mode === "cards" && (
          <FlashCard
            question={current}
            showAnswer={showAnswer}
            onReveal={() => setShowAnswer(true)}
            onScore={scoreCard}
            onNavigate={navigate}
            currentIndex={currentIndex}
            filteredLength={filtered.length}
            scores={scores}
            animating={animating}
          />
        )}
      </div>
    </div>
  )
}
