// ─────────────────────────────────────────────────────────────
// useMenu — orchestration analyse IA + publication Firestore
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { parseMenuWithAI } from '../services/openai'
import { publishMenu, getMenuHistory } from '../services/firestore'
import { useAuth } from './useAuth'

export function useMenu() {
  const { user } = useAuth()

  const [analyse, setAnalyse] = useState(false) // chargement analyse IA
  const [erreur, setErreur] = useState(null)
  const [menu, setMenu] = useState(null) // résultat IA éditable
  const [publication, setPublication] = useState(false) // chargement publish
  const [confirmation, setConfirmation] = useState(null) // { id, publie_le }

  /** Lance l'analyse OpenAI du texte brut. */
  async function analyser(texte) {
    setErreur(null)
    setConfirmation(null)
    setAnalyse(true)
    try {
      const resultat = await parseMenuWithAI(texte)
      setMenu(resultat)
      return resultat
    } catch (e) {
      setErreur(e.message)
      return null
    } finally {
      setAnalyse(false)
    }
  }

  /** Publie le menu courant (ou un menu fourni) sur Firestore. */
  async function publier(menuAPublier = menu, docId) {
    if (!menuAPublier) return
    setErreur(null)
    setPublication(true)
    try {
      const res = await publishMenu(menuAPublier, user?.email, docId)
      // La confirmation apparaît ~2s après la publication (cf. specs Bloc 3)
      await new Promise((r) => setTimeout(r, 2000))
      setConfirmation(res)
      return res
    } catch (e) {
      setErreur('Échec de la publication. Vérifie ta connexion et réessaie.')
      return null
    } finally {
      setPublication(false)
    }
  }

  /** Réinitialise le formulaire pour un nouveau menu. */
  function reset() {
    setMenu(null)
    setErreur(null)
    setConfirmation(null)
  }

  return {
    // état
    menu,
    setMenu,
    analyse,
    publication,
    confirmation,
    erreur,
    setErreur,
    // actions
    analyser,
    publier,
    reset,
    getMenuHistory,
  }
}
