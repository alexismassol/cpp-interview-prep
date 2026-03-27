/**
 * CodeBlock.jsx — Affichage de code C/C++ avec coloration syntaxique légère
 * Colore : commentaires (gris), lignes ✅ OK (vert), lignes ❌ ERREUR (rouge)
 */
export default function CodeBlock({ code }) {
  const lines = code.split('\n')
  return (
    <div style={{
      background: "#0d1117",
      border: "1px solid #30363d",
      borderRadius: "8px",
      padding: "12px 16px",
      margin: "8px 0",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: "12px",
      lineHeight: "1.6",
      overflowX: "auto",
    }}>
      {lines.map((line, i) => {
        const isComment = line.trim().startsWith('//') || line.trim().startsWith('#')
        const isError   = line.includes('❌')
        const isOk      = line.includes('✅')
        return (
          <div key={i} style={{
            color: isComment ? "#8b949e" : isError ? "#f85149" : isOk ? "#3fb950" : "#e6edf3",
            whiteSpace: "pre",
          }}>
            {line}
          </div>
        )
      })}
    </div>
  )
}
