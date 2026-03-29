/**
 * questions.js - Base de données des questions C/C++ pour entretiens techniques
 *
 * Catégories :
 *   Mémoire       - malloc/free, RAII, smart pointers, const pointers
 *   Embedded      - volatile, bit manipulation, ISR, endianness
 *   C++ OOP       - virtual destructor, vtable, casts
 *   C++ Moderne   - move semantics, nullptr, constexpr
 *   Debug & Système - segfault, deadlock, concurrence
 *
 * Structure d'une question :
 *   { category, difficulty, question, answer, tip }
 */

export const questions = [
  // ═══════════════════════════════════════════════════════
  // MÉMOIRE
  // ═══════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════
  // EMBEDDED
  // ═══════════════════════════════════════════════════════
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
    tip: "SET=OR, CLEAR=AND NOT, TOGGLE=XOR - à savoir par cœur"
  },
  {
    category: "Embedded",
    difficulty: "🔥 Difficile",
    question: "Quelles sont les règles à respecter dans une ISR ?",
    answer: `Une ISR (Interrupt Service Routine) doit être :

**1. RAPIDE** - Le moins de code possible
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

  // ═══════════════════════════════════════════════════════
  // C++ OOP
  // ═══════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════
  // C++ OOP (suite)
  // ═══════════════════════════════════════════════════════
  {
    category: "C++ OOP",
    difficulty: "🔥 Difficile",
    question: "Qu'est-ce que la Rule of Five en C++ moderne ?",
    answer: `Si tu définis l'un des 5, tu dois probablement définir les 5 :

1. **Destructeur** \`~T()\`
2. **Copy constructor** \`T(const T&)\`
3. **Copy assignment** \`T& operator=(const T&)\`
4. **Move constructor** \`T(T&&) noexcept\`
5. **Move assignment** \`T& operator=(T&&) noexcept\`

\`\`\`cpp
class Buffer {
    int* data; size_t size;
public:
    ~Buffer()                          { delete[] data; }
    Buffer(const Buffer& o)            : data(new int[o.size]), size(o.size)
                                         { std::copy(o.data, o.data+size, data); }
    Buffer& operator=(const Buffer& o) { Buffer tmp(o); std::swap(*this, tmp); return *this; }
    Buffer(Buffer&& o) noexcept        : data(o.data), size(o.size)
                                         { o.data = nullptr; o.size = 0; }
    Buffer& operator=(Buffer&& o) noexcept {
        std::swap(data, o.data); std::swap(size, o.size); return *this;
    }
};
\`\`\`

**Rule of Zero** : si tes membres gèrent eux-mêmes leurs ressources (smart pointers, vector...) → ne définis aucun des 5.`,
    tip: "Rule of Five ou Rule of Zero. Jamais à moitié - sinon copie/move cassée."
  },

  // ═══════════════════════════════════════════════════════
  // C++ MODERNE
  // ═══════════════════════════════════════════════════════
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

  {
    category: "C++ Moderne",
    difficulty: "⚡ Moyen",
    question: "Qu'est-ce que constexpr ? Différence avec const ?",
    answer: `**const** : valeur non modifiable, calculée à la compilation OU à l'exécution.

**constexpr** : valeur/fonction évaluée **obligatoirement à la compilation**.

\`\`\`cpp
const int x = 5;          // OK : peut être runtime
constexpr int y = 5;      // Garanti compile-time

// Fonction constexpr
constexpr int square(int n) { return n * n; }
constexpr int s = square(4); // ✅ calculé à la compilation = 16

// Utilisation en template (impossible avec const runtime)
std::array<int, square(4)> arr; // ✅ taille connue à la compilation
\`\`\`

**En embarqué** : crucial pour les look-up tables, CRC précalculés, constantes de registres :
\`\`\`cpp
constexpr uint32_t GPIO_BASE = 0x40020000;
constexpr uint32_t GPIO_ODR  = GPIO_BASE + 0x14;
\`\`\`
→ Zero overhead : les constantes sont directement dans le code binaire.`,
    tip: "constexpr = compile-time garanti. Préférer à const pour les constantes vraiment fixes."
  },
  {
    category: "C++ Moderne",
    difficulty: "⚡ Moyen",
    question: "Qu'est-ce qu'une lambda en C++ ? Qu'est-ce qu'une capture ?",
    answer: `Une **lambda** est une fonction anonyme définie inline.

\`\`\`cpp
// Syntaxe : [capture](params) -> return_type { body }
auto add = [](int a, int b) { return a + b; };
int result = add(3, 4); // 7
\`\`\`

**Captures** : comment la lambda accède aux variables locales extérieures

\`\`\`cpp
int threshold = 10;

// Capture par valeur (copie)
auto gt_val = [threshold](int x) { return x > threshold; };

// Capture par référence
auto gt_ref = [&threshold](int x) { return x > threshold; };
threshold = 20;
gt_ref(15); // ✅ voit threshold = 20

// Capture tout par valeur
auto f1 = [=](int x) { return x > threshold; };

// Capture tout par référence ⚠️ dangereux si lambda survit à la portée
auto f2 = [&](int x) { return x > threshold; };
\`\`\`

**Usage courant** : std::sort, std::for_each, callbacks, std::thread.`,
    tip: "[=] copie tout, [&] capture tout par ref - attention à la durée de vie !"
  },

  // ═══════════════════════════════════════════════════════
  // DEBUG & SYSTÈME
  // ═══════════════════════════════════════════════════════
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
2. **std::lock** (C++11) - verrouille plusieurs mutex atomiquement
\`\`\`cpp
std::lock(src.mutex, dst.mutex); // ✅ deadlock-free
std::lock_guard<std::mutex> la(src.mutex, std::adopt_lock);
std::lock_guard<std::mutex> lb(dst.mutex, std::adopt_lock);
\`\`\`
3. **Try-lock avec timeout** (en RTOS)
4. **Minimiser les sections critiques** - moins de locks = moins de risques`,
    tip: "En RTOS embarqué : priority inversion + deadlock sont les 2 bugs concurrence classiques"
  },
  {
    category: "Embedded",
    difficulty: "⚡ Moyen",
    question: "À quoi sert un watchdog timer ? Comment l'utiliser correctement ?",
    answer: `Un **watchdog timer (WDT)** est un timer hardware qui redémarre le microcontrôleur si le logiciel ne le "nourrit" pas régulièrement.

**Principe :**
\`\`\`
Watchdog décrémente continuellement un compteur
Si compteur atteint 0 → RESET matériel du µC
Le logiciel doit périodiquement faire un "kick" (reset du compteur)
→ Si le logiciel plante ou boucle indéfiniment → le WDT déclenche un reset
\`\`\`

**Utilisation sur STM32 (IWDG) :**
\`\`\`cpp
// Init : timeout ~1 seconde
IWDG->KR = 0xCCCC; // démarrage
IWDG->KR = 0x5555; // déverrouillage
IWDG->PR = 4;       // prescaler /64
IWDG->RLR = 625;    // reload = 625 → ~1s

// Dans la boucle principale : kick régulier
void main_loop() {
    while (true) {
        IWDG->KR = 0xAAAA; // ✅ "kick" watchdog
        do_work();
    }
}
\`\`\`

⚠️ **Ne jamais kicker le WDT dans une ISR** - si la boucle principale est bloquée mais l'ISR tourne encore, le WDT ne détecterait pas le problème.`,
    tip: "WDT = filet de sécurité ultime. Kicker dans main(), jamais dans une ISR."
  },
  {
    category: "Debug & Système",
    difficulty: "🔥 Difficile",
    question: "Qu'est-ce que la priority inversion ? Comment l'éviter en RTOS ?",
    answer: `**Priority inversion** = une tâche haute priorité est bloquée par une tâche basse priorité qui détient un mutex.

**Scénario classique :**
\`\`\`
Tâche H (haute) attend mutex détenu par tâche L (basse)
Tâche M (moyenne) préempte L et empêche L de libérer le mutex
→ H attend indéfiniment à cause de M → inversion de priorité !
\`\`\`

**Exemple célèbre :** Mars Pathfinder (1997) - reset du système causé par priority inversion.

**Solutions :**

1. **Priority Inheritance** (héritage de priorité)
   → L reçoit temporairement la priorité de H le temps qu'elle détient le mutex
   → Implémenté dans FreeRTOS avec les mutex (pas les semaphores binaires !)

2. **Priority Ceiling** : le mutex a une priorité plafond fixe
   → Toute tâche qui prend le mutex hérite de cette priorité plafond

\`\`\`cpp
// FreeRTOS : utiliser xSemaphoreCreateMutex() (priority inheritance)
// PAS xSemaphoreCreateBinary() pour les ressources partagées
SemaphoreHandle_t mutex = xSemaphoreCreateMutex(); // ✅
\`\`\``,
    tip: "FreeRTOS : mutex = priority inheritance. Semaphore binaire = pas de priority inheritance."
  },
  {
    category: "Debug & Système",
    difficulty: "🟢 Facile",
    question: "Quelle est la différence entre stack et heap ? Quels sont les risques de chacun ?",
    answer: `**Stack (pile)** :
• Allocation automatique, gérée par le compilateur
• Taille fixe, connue à la compilation (variables locales, paramètres)
• Très rapide (juste décrémenter le stack pointer)
• Libération automatique à la sortie de portée

\`\`\`cpp
void foo() {
    int x = 5;        // stack
    int arr[100];     // stack - 400 octets réservés
} // libération automatique ici
\`\`\`

**Heap (tas)** :
• Allocation dynamique : malloc/new
• Taille variable, connue à l'exécution
• Plus lent (recherche de bloc libre)
• Libération manuelle - risque de fuite mémoire

\`\`\`cpp
int* p = new int[1000]; // heap - alloué dynamiquement
delete[] p;             // libération manuelle obligatoire
\`\`\`

**Risques :**
| | Stack | Heap |
|---|---|---|
| Problème courant | **Stack overflow** (récursion, gros tableaux locaux) | **Memory leak** (oubli de delete) |
| Embarqué | RAM limitée → stack overflow silencieux | Fragmentation sur long terme |

⚠️ En embarqué : souvent **pas de heap du tout** pour éviter la fragmentation et les comportements non déterministes.`,
    tip: "Embarqué temps-réel : stack uniquement, pas d'allocation dynamique. Taille stack fixée au link."
  },
]

/** Couleurs par catégorie (badge + accent sur la card) */
export const categoryColors = {
  "Mémoire":        { accent: "#e94560", light: "rgba(233,69,96,0.15)" },
  "Embedded":       { accent: "#58a6ff", light: "rgba(88,166,255,0.12)" },
  "C++ OOP":        { accent: "#bc8cff", light: "rgba(188,140,255,0.15)" },
  "C++ Moderne":    { accent: "#2ea043", light: "rgba(46,160,67,0.15)" },
  "Debug & Système":{ accent: "#e67e22", light: "rgba(230,126,34,0.15)" },
}

/** Couleur par niveau de difficulté */
export const difficultyColor = {
  "🟢 Facile":   "#2ea043",
  "⚡ Moyen":    "#f0a500",
  "🔥 Difficile":"#e94560",
}
