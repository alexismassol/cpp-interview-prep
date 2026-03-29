# C/C++ Interview Prep

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?logo=javascript&logoColor=black)
![C++](https://img.shields.io/badge/C%2B%2B-17%2F20-00599C?logo=cplusplus&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red)

**Application web de flashcards** pour préparer des entretiens techniques C/C++.

> Interrogation interactive sur la mémoire, l'embarqué, la POO C++, le C++ moderne et le débogage système.

> **AVERTISSEMENT** : Ce projet est une **version de démonstration** destinée à un usage éducatif et portfolio uniquement. Voir [LICENSE](./LICENSE) pour les conditions d'utilisation.

---

## Présentation

**C/C++ Interview Prep** est une SPA (Single Page Application) React 18 permettant de réviser les concepts C/C++ essentiels avant un entretien technique, avec un focus sur les systèmes embarqués (microcontrôleurs ARM, RTOS, registres GPIO, protocoles CAN/ISO 15118).

3 modes d'utilisation :
- **📇 Cards** - flashcards interactives (révèle la réponse, note ton niveau)
- **📋 Liste** - vue d'ensemble de toutes les questions avec statut
- **📊 Stats** - progression par catégorie avec barres de complétion

---

## Démarrage rapide

### Prérequis
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/alexismassol/cpp-interview-prep.git
cd cpp-interview-prep

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173)

### Build production

```bash
npm run build    # génère dist/
npm run preview  # prévisualise le build
```

---

## Catégories de questions

| Catégorie | Sujets couverts |
|---|---|
| 🔴 **Mémoire** | `malloc`/`free` vs `new`/`delete`, RAII, `unique_ptr`/`shared_ptr`/`weak_ptr`, `const` pointers |
| 🔵 **Embedded** | `volatile`, manipulation de bits (SET/CLEAR/TOGGLE), règles ISR, endianness, registres GPIO, watchdog timer |
| 🟣 **C++ OOP** | Destructeur `virtual`, vtable et dispatch dynamique, `static_cast`/`dynamic_cast`/`reinterpret_cast`, Rule of Five |
| 🟢 **C++ Moderne** | Move semantics, `std::move`, `nullptr` vs `NULL`, `constexpr`, lambdas & captures |
| 🟠 **Debug & Système** | Segfault (causes + outils), deadlock (`std::lock`), priority inversion RTOS, stack vs heap |

---

## Architecture du projet

```
cpp-interview-prep/
├── index.html                  ← Point d'entrée HTML (fonts IBM Plex Mono)
├── vite.config.js              ← Config Vite (React plugin, port 5173)
├── package.json
├── LICENSE
└── src/
    ├── main.jsx                ← Bootstrap React 18 (createRoot)
    ├── App.jsx                 ← Orchestrateur : Header + Filters + Content
    ├── data/
    │   └── questions.js        ← Base de données des 14 questions + couleurs
    ├── components/
    │   ├── FlashCard.jsx       ← Carte interactive (question → réponse → score)
    │   ├── AnswerDisplay.jsx   ← Rendu Markdown-lite (gras, inline code, blocs)
    │   ├── CodeBlock.jsx       ← Affichage C++ avec coloration (commentaires, ✅, ❌)
    │   ├── ListView.jsx        ← Vue liste avec statut par question
    │   └── StatsView.jsx       ← Progression globale + barres par catégorie
    └── hooks/
        └── useFlashcards.js    ← Logique complète : filtrage, shuffle, navigation, scoring
```

---

## Stack technique

| Technologie | Rôle |
|---|---|
| **React 18** | UI composants fonctionnels, hooks |
| **Vite 5** | Build tool, dev server HMR |
| **JavaScript ES2024** | Modules natifs, `Array.sort`, destructuring |
| 100% client-side | Aucun backend, aucune dépendance externe |

---

## Fonctionnalités

- **20 questions** réparties sur 5 catégories, 3 niveaux de difficulté
- **Filtrage** par catégorie (Tous / Mémoire / Embedded / C++ OOP / C++ Moderne / Debug & Système)
- **Shuffle** - ordre aléatoire pour éviter la mémorisation séquentielle
- **Scoring** - marquer chaque carte "Maîtrisé ✓" ou "À revoir ✗"
- **Progression** barre par carte + statistiques par catégorie
- **Navigation** clavier-friendly (boutons ← →)
- **Mode liste** - vue d'ensemble et accès direct à une question
- **Coloration syntaxique** C++ dans les réponses (commentaires, ✅/❌)
- **Tips mnémotechniques** sur chaque réponse
- 100% client-side, fonctionne hors-ligne après premier chargement

---

## Auteur

**Alexis MASSOL** - Senior Software Engineer · Embedded Systems & Cloud Platforms

---

## Licence

© 2026 Alexis MASSOL - Tous droits réservés.

Projet portfolio de démonstration. Consultation et étude personnelle autorisées. Toute utilisation commerciale ou redistribution interdite. Voir [LICENSE](./LICENSE).
