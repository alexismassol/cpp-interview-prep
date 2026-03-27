import { useState, useEffect } from "react";

const questions = [
  // === MÉMOIRE ===
  {
    category: "Mémoire",
    difficulty: "⚡ Moyen",
    question: "Quelle est la différence entre malloc/free et new/delete ?",
    answer: `**malloc/free (C)** :
• Alloue des octets bruts, ne connaît pas les types
• Ne construit/détruit PAS les objets
• Retourne void*, nécessite un cast

**new/delete (C++)** :
• Alloue ET appelle le constructeur
• delete appelle le destructeur PUIS libère
• Lance une exception std::bad_alloc si échec (malloc retourne NULL)

⚠️ Ne JAMAIS mélanger : pas de free() sur un new, pas de delete sur un malloc !`,
    tip: "Pense : new = malloc + constructeur, delete = destructeur + free"
  },
  {
    category: "Mémoire",
    difficulty: "⚡ Moyen",
    question: "Qu'est-ce que le RAII ? Donne un exemple concret.",
    answer: `**RAII = Resource Acquisition Is Initialization**

L'idée : lier la durée de vie d'une ressource à celle d'un objet.
La ressource est acquise dans le constructeur, libérée dans le destructeur.

\`\`\`cpp
class FileHandle {
    FILE* f;
public:
    FileHandle(const char* path) { f = fopen(path, "r"); }
    ~FileHandle() { if(f) fclose(f); } // libération automatique
};

void foo() {
    FileHandle fh("data.bin"); // ouverture
    // ... même si exception levée ...
} // destructeur appelé → fichier fermé automatiquement
\`\`\`

Les **smart pointers** sont l'exemple RAII par excellence.`,
    tip: "RAII = pas de fuite mémoire même en cas d'exception"
  },
  {
    category: "Mémoire",
    difficulty: "🔥 Difficile",
    question: "Explique unique_ptr, shared_ptr et weak_ptr. Quand utiliser chacun ?",
    answer: `**unique_ptr** → propriété exclusive
• Un seul propriétaire, non copiable (mais movable)
• Overhead zéro par rapport à un raw pointer
• Utiliser par défaut

**shared_ptr** → propriété partagée
• Référence comptée (thread-safe pour le compteur)
• Overhead : allocation du bloc de contrôle
• Utiliser quand plusieurs objets partagent la propriété

**weak_ptr** → observation sans propriété
• Ne participe pas au comptage de références
• Évite les cycles de références (memory leaks avec shared_ptr)
• Doit être "locké" (lock()) avant utilisation

\`\`\`cpp
// Cycle dangereux → weak_ptr
struct Node {
    shared_ptr<Node> next;  // ✅
    weak_ptr<Node> parent;  // ✅ évite le cycle
};
\`\`\``,
    tip: "unique_ptr par défaut, shared_ptr si vraie propriété partagée, weak_ptr pour casser les cycles"
  },
  {
    category: "Mémoire",
    difficulty: "🔥 Difficile",
    question: "Que signifie const int*, int* const et const int* const ?",
    answer: `Lis de droite à gauche pour comprendre :

**int* const p** → pointeur CONSTANT vers int
• Le pointeur ne peut pas changer d'adresse
• La valeur pointée PEUT être modifiée
\`\`\`cpp
int x=1, y=2;
int* const p = &x;
*p = 5;   // ✅ OK
p = &y;   // ❌ ERREUR
\`\`\`

**const int* p** → pointeur vers int CONSTANT
• Le pointeur PEUT changer d'adresse
• La valeur pointée ne peut pas être modifiée
\`\`\`cpp
const int* p = &x;
p = &y;   // ✅ OK
*p = 5;   // ❌ ERREUR
\`\`\`

**const int* const p** → tout est constant`,
    tip: "Astuce : lis de droite à gauche depuis le nom de la variable"
  },

  // === EMBEDDED ===
  {
    category: "Embedded",
    difficulty: "⚡ Moyen",
    question: "Pourquoi utilise-t-on volatile en C/C++ embarqué ?",
    answer: `**volatile** indique au compilateur que la variable peut changer à tout moment, en dehors du flux normal d'exécution.

Sans volatile, le compilateur peut optimiser (mettre en cache dans un registre) et rater les changements !

**Cas d'usage critiques :**

1. **Registre matériel**
\`\`\`cpp
volatile uint32_t* const GPIO_STATUS = (volatile uint32_t*)0x40020010;
while (!(*GPIO_STATUS & 0x01)) {} // sans volatile → boucle infinie optimisée !
\`\`\`

2. **Variables partagées avec une ISR**
\`\`\`cpp
volatile bool data_ready = false;

void ISR_handler() {
    data_ready = true; // modifié dans l'interruption
}

void main_loop() {
    while (!data_ready) {} // doit relire la vraie valeur
}
\`\`\`

⚠️ volatile ≠ thread-safe ! Pour le multithreading, utiliser std::atomic.`,
    tip: "volatile = 'ne pas optimiser, toujours lire depuis la mémoire'"
  },
  {
    category: "Embedded",
    difficulty: "🟢 Facile",
    question: "Comment set/clear/toggle un bit spécifique sans affecter les autres ?",
    answer: `Les 3 opérations fondamentales sur les bits :

\`\`\`cpp
// SET le bit N (mettre à 1)
reg |= (1 << N);

// CLEAR le bit N (mettre à 0)
reg &= ~(1 << N);

// TOGGLE le bit N (inverser)
reg ^= (1 << N);

// LIRE le bit N
bool bit_value = (reg >> N) & 0x01;
\`\`\`

**Exemple concret (GPIO)** :
\`\`\`cpp
#define LED_PIN 5
#define GPIOA_ODR  (*((volatile uint32_t*)0x40020014))

GPIOA_ODR |= (1 << LED_PIN);   // allumer LED
GPIOA_ODR &= ~(1 << LED_PIN);  // éteindre LED
GPIOA_ODR ^= (1 << LED_PIN);   // toggle LED
\`\`\``,
    tip: "SET=OR, CLEAR=AND NOT, TOGGLE=XOR — à savoir par cœur"
  },
  {
    category: "Embedded",
    difficulty: "🔥 Difficile",
    question: "Quelles sont les règles à respecter dans une ISR ?",
    answer: `Une ISR (Interrupt Service Routine) doit être :

**1. RAPIDE** — Le moins de code possible
• Pas d'opérations lentes (I2C, UART bloquant, printf...)
• Pattern classique : setter un flag, traiter dans la main loop

**2. PAS D'ALLOCATIONS DYNAMIQUES**
• Pas de malloc/new dans une ISR
• Risque de deadlock si le heap est locké

**3. Variables partagées = volatile**
\`\`\`cpp
volatile bool uart_rx_ready = false;
volatile uint8_t rx_buffer[64];

void USART1_IRQHandler(void) {
    rx_buffer[idx++] = USART1->DR;
    if(idx >= expected_len) uart_rx_ready = true;
}
\`\`\`

**4. Sections critiques si accès multi-octets**
\`\`\`cpp
// Variable 32-bit sur archi 8-bit = non-atomique !
__disable_irq();
uint32_t snapshot = shared_counter; // lecture atomique protégée
__enable_irq();
\`\`\`

**5. Pas d'exceptions C++** dans une ISR`,
    tip: "ISR = lever un flag, tout traiter dans main(). Court, volatile, sans alloc."
  },
  {
    category: "Embedded",
    difficulty: "⚡ Moyen",
    question: "Qu'est-ce que l'endianness ? Comment détecter celle de ton système ?",
    answer: `**Endianness** = ordre de stockage des octets d'un mot multi-octets en mémoire.

**Big-Endian** : octet de poids FORT en premier (adresse basse)
→ Réseau (TCP/IP), certains DSP

**Little-Endian** : octet de poids FAIBLE en premier (adresse basse)
→ x86, ARM Cortex-M (par défaut)

Exemple pour 0x12345678 :
| Adresse | Big-Endian | Little-Endian |
|---------|-----------|---------------|
| 0x00    | 0x12      | 0x78          |
| 0x01    | 0x34      | 0x56          |

**Détection à runtime :**
\`\`\`cpp
bool is_little_endian() {
    uint32_t val = 1;
    return *((uint8_t*)&val) == 1;
}
\`\`\`

**Pertinent pour toi :** ISO 15118 utilise Big-Endian (réseau), mais ton ARM est Little-Endian → htons/ntohl pour convertir !`,
    tip: "ISO 15118 / CAN = protocoles réseau = Big-Endian. ARM = Little-Endian."
  },

  // === C++ OOP ===
  {
    category: "C++ OOP",
    difficulty: "⚡ Moyen",
    question: "Pourquoi faut-il un destructeur virtual dans une classe de base ?",
    answer: `Sans destructeur virtual, si tu delete un objet dérivé via un pointeur de base → **undefined behavior** (fuite mémoire, crash).

\`\`\`cpp
class Base {
public:
    ~Base() { cout << "~Base"; } // ❌ NON virtual !
};
class Derived : public Base {
    int* data;
public:
    Derived() { data = new int[100]; }
    ~Derived() { delete[] data; cout << "~Derived"; }
};

Base* obj = new Derived();
delete obj; // ❌ appelle SEULEMENT ~Base → fuite sur data !
\`\`\`

**Avec virtual :**
\`\`\`cpp
class Base {
public:
    virtual ~Base() {} // ✅
};
// delete obj → appelle ~Derived PUIS ~Base ✅
\`\`\`

**Règle** : toute classe avec au moins une méthode virtual doit avoir un destructeur virtual.`,
    tip: "Classe polymorphe = toujours virtual ~Destructor()"
  },
  {
    category: "C++ OOP",
    difficulty: "🔥 Difficile",
    question: "Explique la vtable et le mécanisme de dispatch dynamique.",
    answer: `**Vtable (Virtual Table)** = table de pointeurs de fonctions créée par le compilateur pour chaque classe avec des méthodes virtual.

**Comment ça marche :**
1. Chaque classe virtuelle a sa vtable (statique, partagée entre instances)
2. Chaque objet contient un **vptr** (pointeur caché vers la vtable)
3. Un appel virtuel = déréférencement du vptr → accès à la vtable → appel

\`\`\`
Objet Derived en mémoire :
[ vptr ] → vtable_Derived → [ &Derived::speak ]
[ data ]                   → [ &Base::move    ]

Objet Base en mémoire :
[ vptr ] → vtable_Base → [ &Base::speak ]
[ data ]               → [ &Base::move  ]
\`\`\`

**Coût du dispatch dynamique :**
• 1 déréférence supplémentaire (vptr → vtable → fonction)
• Cache miss possible
• En embedded critique : parfois évité au profit de templates (CRTP)

**CRTP (Curiously Recurring Template Pattern)** = polymorphisme statique, zero overhead !`,
    tip: "vtable = overhead léger mais réel. En embedded temps-réel strict → CRTP"
  },
  {
    category: "C++ OOP",
    difficulty: "⚡ Moyen",
    question: "Quelle est la différence entre static_cast, reinterpret_cast et dynamic_cast ?",
    answer: `**static_cast** → conversion vérifiée à la COMPILATION
\`\`\`cpp
double d = 3.14;
int i = static_cast<int>(d); // ✅ conversion numérique
Base* b = static_cast<Base*>(derived_ptr); // ✅ upcast safe
\`\`\`

**reinterpret_cast** → réinterprétation brute des bits, DANGEREUX
\`\`\`cpp
uint32_t* reg = reinterpret_cast<uint32_t*>(0x40020000); // ✅ registre HW
// C'est le seul cast légitime pour les registres embarqués !
\`\`\`

**dynamic_cast** → cast vérifié à RUNTIME via RTTI
\`\`\`cpp
Base* b = new Derived();
Derived* d = dynamic_cast<Derived*>(b); // vérifie le type réel
if (d) { /* ✅ cast réussi */ }
// Retourne nullptr si échec (pour les pointeurs)
\`\`\`

⚠️ **dynamic_cast en embedded** : souvent désactivé (RTTI = overhead, mémoire flash précieuse) !`,
    tip: "static_cast = compile-time, dynamic_cast = runtime+RTTI, reinterpret_cast = bits bruts"
  },

  // === C++ Moderne ===
  {
    category: "C++ Moderne",
    difficulty: "🔥 Difficile",
    question: "Qu'est-ce que la move semantics ? Pourquoi c'est important ?",
    answer: `**Move semantics (C++11)** = transférer les ressources d'un objet plutôt que les copier.

**Problème sans move :**
\`\`\`cpp
std::vector<int> create_big_vector() {
    std::vector<int> v(1000000);
    return v; // COPIE de 1M éléments ? (avant C++11)
}
\`\`\`

**Avec move :**
\`\`\`cpp
// Move constructor : "vole" les ressources de l'objet source
MyBuffer(MyBuffer&& other) noexcept 
    : data(other.data), size(other.size) {
    other.data = nullptr; // source laissée dans état valide vide
    other.size = 0;
}
\`\`\`

**std::move** : cast vers une rvalue reference (permet le move)
\`\`\`cpp
std::vector<int> a = {1,2,3};
std::vector<int> b = std::move(a); // a est vide après !
\`\`\`

**En pratique** : les conteneurs STL, strings, etc. bénéficient automatiquement du move. C'est transparent et bien plus rapide.`,
    tip: "Move = transfert de propriété sans copie. std::move = 'prends tout, laisse une coquille vide'"
  },
  {
    category: "C++ Moderne",
    difficulty: "🟢 Facile",
    question: "Quelle est la différence entre nullptr et NULL ?",
    answer: `**NULL** (C legacy) = macro définie comme 0 ou (void*)0
→ Ambiguïté : est-ce un entier ou un pointeur ?

\`\`\`cpp
void foo(int x) { cout << "int"; }
void foo(int* p) { cout << "ptr"; }

foo(NULL);    // ⚠️ Appelle foo(int) ! Comportement ambigu
foo(nullptr); // ✅ Appelle foo(int*) clairement
\`\`\`

**nullptr (C++11)** = littéral de type std::nullptr_t
• Type-safe : ne se confond pas avec un entier
• Convertible en n'importe quel type pointeur
• Rejette les conversions en entier

\`\`\`cpp
int* p = nullptr;       // ✅
if (p == nullptr) {}    // ✅ clair
if (p == 0) {}          // ⚠️ fonctionne mais moins clair
\`\`\`

**Règle** : toujours nullptr en C++ moderne, jamais NULL ni 0 pour les pointeurs.`,
    tip: "nullptr = type-safe, NULL = legacy C. En C++ moderne : toujours nullptr."
  },

  // === Debugging & System ===
  {
    category: "Debug & Système",
    difficulty: "⚡ Moyen",
    question: "Qu'est-ce qu'un segmentation fault ? Quelles en sont les causes principales ?",
    answer: `Un **Segfault** = accès mémoire non autorisé. Le CPU (via MMU) génère une exception → le kernel envoie SIGSEGV.

**Causes principales :**

1. **Déréférencement de nullptr**
\`\`\`cpp
int* p = nullptr;
*p = 5; // 💥 segfault
\`\`\`

2. **Dangling pointer** (pointeur vers mémoire libérée)
\`\`\`cpp
int* p = new int(5);
delete p;
*p = 10; // 💥 undefined behavior → souvent segfault
\`\`\`

3. **Buffer overflow** (écriture hors tableau)
\`\`\`cpp
int arr[5];
arr[10] = 0; // 💥 hors bounds
\`\`\`

4. **Stack overflow** (récursion infinie)

5. **Utilisation de mémoire non initialisée**

**Outils de debug :**
• GDB : backtrace, watchpoints
• Valgrind : détection fuites + accès invalides
• Address Sanitizer (ASan) : compile avec -fsanitize=address`,
    tip: "En embedded sans MMU → pas de segfault mais corruption mémoire silencieuse. Encore pire !"
  },
  {
    category: "Debug & Système",
    difficulty: "🔥 Difficile",
    question: "Qu'est-ce qu'un deadlock ? Comment l'éviter ?",
    answer: `**Deadlock** = deux threads ou plus s'attendent mutuellement → blocage infini.

**Exemple classique :**
\`\`\`
Thread A : verrouille mutex1, attend mutex2
Thread B : verrouille mutex2, attend mutex1
→ Les deux attendent indéfiniment
\`\`\`

\`\`\`cpp
// ❌ Deadlock possible
void transfert(Account& src, Account& dst) {
    src.mutex.lock();
    dst.mutex.lock(); // si autre thread fait l'inverse...
    // transfert...
}
\`\`\`

**Solutions :**

1. **Ordre d'acquisition fixe** (toujours locker dans le même ordre)
2. **std::lock** (C++11) — verrouille plusieurs mutex atomiquement
\`\`\`cpp
std::lock(src.mutex, dst.mutex); // ✅ deadlock-free
std::lock_guard<std::mutex> la(src.mutex, std::adopt_lock);
std::lock_guard<std::mutex> lb(dst.mutex, std::adopt_lock);
\`\`\`
3. **Try-lock avec timeout** (en RTOS)
4. **Minimiser les sections critiques** — moins de locks = moins de risques`,
    tip: "En RTOS embarqué : priority inversion + deadlock sont les 2 bugs concurrence classiques"
  }
];

const categoryColors = {
  "Mémoire": { bg: "#1a1a2e", accent: "#e94560", light: "rgba(233,69,96,0.15)" },
  "Embedded": { bg: "#0f3460", accent: "#16213e", light: "rgba(22,33,62,0.8)" },
  "C++ OOP": { bg: "#1a1a2e", accent: "#533483", light: "rgba(83,52,131,0.2)" },
  "C++ Moderne": { bg: "#0d1117", accent: "#2ea043", light: "rgba(46,160,67,0.15)" },
  "Debug & Système": { bg: "#1a1a2e", accent: "#e67e22", light: "rgba(230,126,34,0.15)" },
};

const difficultyColor = {
  "🟢 Facile": "#2ea043",
  "⚡ Moyen": "#f0a500",
  "🔥 Difficile": "#e94560",
};

function CodeBlock({ code }) {
  const lines = code.split('\n');
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
        const isComment = line.trim().startsWith('//') || line.trim().startsWith('#');
        const isError = line.includes('❌');
        const isOk = line.includes('✅');
        return (
          <div key={i} style={{
            color: isComment ? "#8b949e" : isError ? "#f85149" : isOk ? "#3fb950" : "#e6edf3",
            whiteSpace: "pre",
          }}>{line}</div>
        );
      })}
    </div>
  );
}

function AnswerDisplay({ text }) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const code = part.replace(/^```\w*\n?/, '').replace(/```$/, '');
          return <CodeBlock key={i} code={code} />;
        }
        const lines = part.split('\n');
        return (
          <div key={i}>
            {lines.map((line, j) => {
              if (!line.trim()) return <div key={j} style={{ height: "6px" }} />;
              const formatted = line
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f0a500">$1</strong>')
                .replace(/`([^`]+)`/g, '<code style="background:#1f2937;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px;color:#79c0ff">$1</code>');
              const isBullet = line.trim().startsWith('•') || line.trim().startsWith('→');
              return (
                <div key={j} style={{
                  marginBottom: "4px",
                  paddingLeft: isBullet ? "8px" : "0",
                  color: "#c9d1d9",
                  fontSize: "13.5px",
                  lineHeight: "1.7",
                }}
                  dangerouslySetInnerHTML={{ __html: formatted }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [scores, setScores] = useState({});
  const [filter, setFilter] = useState("Tous");
  const [mode, setMode] = useState("cards"); // cards | list | stats
  const [shuffle, setShuffle] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState(questions);
  const [animating, setAnimating] = useState(false);

  const categories = ["Tous", ...new Set(questions.map(q => q.category))];
  const filtered = shuffledQuestions.filter(q => filter === "Tous" || q.category === filter);
  const current = filtered[currentIndex % Math.max(filtered.length, 1)];

  const answered = Object.keys(scores).length;
  const correct = Object.values(scores).filter(v => v === "ok").length;
  const incorrect = Object.values(scores).filter(v => v === "ko").length;

  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
  }, [filter]);

  const handleShuffle = () => {
    const arr = [...questions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(arr);
    setCurrentIndex(0);
    setShowAnswer(false);
    setShuffle(!shuffle);
  };

  const navigate = (dir) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => {
        const next = prev + dir;
        if (next < 0) return filtered.length - 1;
        if (next >= filtered.length) return 0;
        return next;
      });
      setShowAnswer(false);
      setAnimating(false);
    }, 150);
  };

  const score = (val) => {
    setScores(prev => ({ ...prev, [current.question]: val }));
    setTimeout(() => navigate(1), 400);
  };

  const catColor = current ? (categoryColors[current.category] || categoryColors["Mémoire"]) : categoryColors["Mémoire"];
  const progress = filtered.length > 0 ? ((currentIndex) / filtered.length) * 100 : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace",
      color: "#e6edf3",
    }}>
      {/* HEADER */}
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

      {/* FILTERS */}
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
          }}>{cat}</button>
        ))}
        <button onClick={handleShuffle} style={{
          marginLeft: "auto",
          padding: "4px 12px",
          borderRadius: "20px",
          border: "1px solid #30363d",
          background: shuffle ? "rgba(240,165,0,0.1)" : "transparent",
          color: shuffle ? "#f0a500" : "#8b949e",
          cursor: "pointer",
          fontSize: "11px",
          fontFamily: "inherit",
        }}>🔀 Aléatoire</button>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px" }}>

        {/* STATS MODE */}
        {mode === "stats" && (
          <div>
            <div style={{ fontSize: "14px", color: "#8b949e", marginBottom: "20px" }}>
              Progression globale
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginBottom: "24px",
            }}>
              {[
                { label: "Répondues", value: answered, color: "#58a6ff" },
                { label: "Correctes", value: correct, color: "#2ea043" },
                { label: "Incorrectes", value: incorrect, color: "#e94560" },
              ].map(s => (
                <div key={s.label} style={{
                  background: "#161b22",
                  border: "1px solid #21262d",
                  borderRadius: "10px",
                  padding: "20px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "32px", fontWeight: "700", color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "12px", color: "#8b949e", marginTop: "4px" }}>{s.label}</div>
                </div>
              ))}
            </div>
            {Object.entries(categoryColors).map(([cat, colors]) => {
              const catQs = questions.filter(q => q.category === cat);
              const catAnswered = catQs.filter(q => scores[q.question]).length;
              const catOk = catQs.filter(q => scores[q.question] === "ok").length;
              return (
                <div key={cat} style={{
                  background: "#161b22",
                  border: "1px solid #21262d",
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "8px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "#e6edf3", fontSize: "13px" }}>{cat}</span>
                    <span style={{ color: "#8b949e", fontSize: "12px" }}>{catAnswered}/{catQs.length}</span>
                  </div>
                  <div style={{ background: "#21262d", borderRadius: "4px", height: "6px" }}>
                    <div style={{
                      background: colors.accent || "#58a6ff",
                      width: `${catQs.length ? (catOk / catQs.length) * 100 : 0}%`,
                      height: "6px",
                      borderRadius: "4px",
                      transition: "width 0.5s",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LIST MODE */}
        {mode === "list" && (
          <div>
            {filtered.map((q, i) => {
              const s = scores[q.question];
              return (
                <div key={i} onClick={() => { setCurrentIndex(i); setMode("cards"); setShowAnswer(false); }} style={{
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
                }}>
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: s === "ok" ? "rgba(35,134,54,0.2)" : s === "ko" ? "rgba(218,54,51,0.2)" : "#21262d",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    flexShrink: 0,
                  }}>
                    {s === "ok" ? "✓" : s === "ko" ? "✗" : (i + 1)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", color: "#e6edf3", marginBottom: "3px" }}>{q.question}</div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ fontSize: "10px", color: "#8b949e" }}>{q.category}</span>
                      <span style={{ fontSize: "10px", color: difficultyColor[q.difficulty] || "#8b949e" }}>{q.difficulty}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CARDS MODE */}
        {mode === "cards" && current && (
          <div>
            {/* Progress bar */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", color: "#8b949e" }}>
                  {currentIndex + 1} / {filtered.length}
                </span>
                <span style={{ fontSize: "11px", color: difficultyColor[current.difficulty] }}>
                  {current.difficulty}
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
              {/* Category bar */}
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
                  {current.category}
                </span>
                {scores[current.question] && (
                  <span style={{
                    marginLeft: "auto",
                    fontSize: "12px",
                    color: scores[current.question] === "ok" ? "#2ea043" : "#e94560",
                  }}>
                    {scores[current.question] === "ok" ? "✓ Maîtrisé" : "✗ À revoir"}
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
                  {current.question}
                </div>
              </div>

              {/* Show/Hide Answer */}
              {!showAnswer ? (
                <div style={{ padding: "0 24px 24px" }}>
                  <button onClick={() => setShowAnswer(true)} style={{
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
                  }}>
                    ▶ Révéler la réponse
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{
                    padding: "20px 24px",
                    borderTop: "1px solid #21262d",
                    background: "#0d1117",
                  }}>
                    <AnswerDisplay text={current.answer} />

                    {/* Tip */}
                    <div style={{
                      marginTop: "16px",
                      padding: "10px 14px",
                      background: "rgba(240,165,0,0.08)",
                      border: "1px solid rgba(240,165,0,0.2)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#f0a500",
                    }}>
                      💡 {current.tip}
                    </div>
                  </div>

                  {/* Score buttons */}
                  <div style={{
                    padding: "16px 24px",
                    borderTop: "1px solid #21262d",
                    display: "flex",
                    gap: "10px",
                  }}>
                    <button onClick={() => score("ko")} style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #da3633",
                      background: "rgba(218,54,51,0.1)",
                      color: "#f85149",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontFamily: "inherit",
                    }}>
                      ✗ À revoir
                    </button>
                    <button onClick={() => score("ok")} style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #238636",
                      background: "rgba(35,134,54,0.1)",
                      color: "#3fb950",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontFamily: "inherit",
                    }}>
                      ✓ Maîtrisé
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "16px",
              gap: "10px",
            }}>
              <button onClick={() => navigate(-1)} style={{
                padding: "10px 24px",
                borderRadius: "8px",
                border: "1px solid #30363d",
                background: "transparent",
                color: "#8b949e",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "inherit",
              }}>
                ← Précédente
              </button>
              <button onClick={() => navigate(1)} style={{
                padding: "10px 24px",
                borderRadius: "8px",
                border: "1px solid #30363d",
                background: "transparent",
                color: "#8b949e",
                cursor: "pointer",
                fontSize: "13px",
                fontFamily: "inherit",
              }}>
                Suivante →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
