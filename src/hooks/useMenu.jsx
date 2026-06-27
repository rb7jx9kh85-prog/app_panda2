// ─────────────────────────────────────────────────────────────
// useMenu — orchestration analyse IA + publication Firestore
// Séparation stricte : ce hook gère UNIQUEMENT l'état React.
// Les appels réseau restent dans leurs services respectifs.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { parseMenuWithAI } from '../services/openai'
import { publishMenu } from '../services/firestore'
import { useAuth } from './useAuth'

const ETAT_INITIAL = {
  menu: null,
  analyse: false,
  publication: false,
  confirmation: null,
  erreur: null,
}

export function useMenu() {
  const { user } = useAuth()
  const [etat, setEtat] = useState(ETAT_INITIAL)

  function setPartiel(partiel) {
    setEtat((prev) => ({ ...prev, ...partiel }))
  }

  async function analyser(texte) {
    setEtat({ ...ETAT_INITIAL, analyse: true })
    try {
      const menu = await parseMenuWithAI(texte)
      setPartiel({ menu, analyse: false })
    } catch (e) {
      setPartiel({ erreur: e.message, analyse: false })
    }
  }

  async function publier(menuAPublier = etat.menu, docId) {
    if (!menuAPublier) return
    setPartiel({ publication: true, erreur: null })
    try {
      const res = await publishMenu(menuAPublier, user?.email, docId)
      // Délai de 2s avant d'afficher la confirmation (UX — laisser le temps
      // à Firestore de propager vers le site vitrine)
      await new Promise((r) => setTimeout(r, 2000))
      setPartiel({ confirmation: res, publication: false })
    } catch (_) {
      setPartiel({
        erreur: 'Échec de la publication. Vérifie ta connexion et réessaie.',
        publication: false,
      })
    }
  }

  function majMenu(menu) {
    setPartiel({ menu })
  }

  function reset() {
    setEtat(ETAT_INITIAL)
  }

  return {
    ...etat,
    analyser,
    publier,
    majMenu,
    reset,
  }
}
