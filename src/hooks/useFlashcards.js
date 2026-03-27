/**
 * useFlashcards.js — Hook principal gérant l'état de l'application
 *
 * Responsabilités :
 *   - Filtrage par catégorie
 *   - Shuffle aléatoire
 *   - Navigation entre cartes avec animation
 *   - Scoring (ok / ko)
 *   - Affichage de la réponse
 */
import { useState, useEffect } from 'react'
import { questions } from '../data/questions.js'

export function useFlashcards() {
  const [currentIndex, setCurrentIndex]         = useState(0)
  const [showAnswer, setShowAnswer]             = useState(false)
  const [scores, setScores]                     = useState({})
  const [filter, setFilter]                     = useState("Tous")
  const [mode, setMode]                         = useState("cards") // cards | list | stats
  const [shuffled, setShuffled]                 = useState(questions)
  const [isShuffleActive, setIsShuffleActive]   = useState(false)
  const [animating, setAnimating]               = useState(false)

  const categories = ["Tous", ...new Set(questions.map(q => q.category))]

  // Filtre selon la catégorie sélectionnée
  const filtered = shuffled.filter(q => filter === "Tous" || q.category === filter)
  const current  = filtered[currentIndex % Math.max(filtered.length, 1)]

  // Reset de l'index et de la réponse lors d'un changement de filtre
  useEffect(() => {
    setCurrentIndex(0)
    setShowAnswer(false)
  }, [filter])

  const handleShuffle = () => {
    setShuffled([...questions].sort(() => Math.random() - 0.5))
    setCurrentIndex(0)
    setShowAnswer(false)
    setIsShuffleActive(prev => !prev)
  }

  /**
   * Navigation avec animation légère (fade + translateY)
   * @param {number} dir — +1 (suivante) ou -1 (précédente)
   */
  const navigate = (dir) => {
    setAnimating(true)
    setTimeout(() => {
      setCurrentIndex(prev => {
        const next = prev + dir
        if (next < 0) return filtered.length - 1
        if (next >= filtered.length) return 0
        return next
      })
      setShowAnswer(false)
      setAnimating(false)
    }, 150)
  }

  /**
   * Enregistre le score de la carte courante et avance automatiquement
   * @param {'ok'|'ko'} val
   */
  const scoreCard = (val) => {
    setScores(prev => ({ ...prev, [current.question]: val }))
    setTimeout(() => navigate(1), 400)
  }

  const selectFromList = (index) => {
    setCurrentIndex(index)
    setMode("cards")
    setShowAnswer(false)
  }

  return {
    // État
    current, currentIndex, filtered, showAnswer, scores,
    filter, mode, animating, isShuffleActive, categories,
    // Actions
    setFilter, setMode, setShowAnswer,
    navigate, scoreCard, handleShuffle, selectFromList,
  }
}
