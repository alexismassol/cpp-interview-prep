/**
 * AnswerDisplay.jsx — Rendu Markdown-lite pour les réponses
 * Gère : blocs ```cpp, **gras**, `inline code`, bullets •→
 */
import CodeBlock from './CodeBlock.jsx'

export default function AnswerDisplay({ text }) {
  const parts = text.split(/(```[\s\S]*?```)/g)
  return (
    <div>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/^```\w*\n?/, '').replace(/```$/, '')
          return <CodeBlock key={i} code={code} />
        }
        return <TextBlock key={i} text={part} />
      })}
    </div>
  )
}

function TextBlock({ text }) {
  const lines = text.split('\n')
  return (
    <div>
      {lines.map((line, j) => {
        if (!line.trim()) return <div key={j} style={{ height: "6px" }} />
        const formatted = line
          .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f0a500">$1</strong>')
          .replace(/`([^`]+)`/g, '<code style="background:#1f2937;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;color:#79c0ff">$1</code>')
        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('→')
        return (
          <div
            key={j}
            style={{
              marginBottom: "4px",
              paddingLeft: isBullet ? "8px" : "0",
              color: "#c9d1d9",
              fontSize: "13.5px",
              lineHeight: "1.7",
            }}
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        )
      })}
    </div>
  )
}
