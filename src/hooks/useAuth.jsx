// ─────────────────────────────────────────────────────────────
// useAuth — état d'authentification Firebase + helpers connexion
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth'
import { auth } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    // Écoute l'état de connexion Firebase (persiste entre rechargements)
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setChargement(false)
    })
    return unsub
  }, [])

  // Connexion email / mot de passe
  const seConnecter = (email, motDePasse) =>
    signInWithEmailAndPassword(auth, email, motDePasse)

  // Déconnexion
  const seDeconnecter = () => fbSignOut(auth)

  // Envoi d'un e-mail de réinitialisation du mot de passe.
  // Bonus : réinitialiser le mot de passe lève aussi le blocage temporaire
  // « trop de tentatives » imposé par Firebase.
  const reinitialiserMotDePasse = (email) =>
    sendPasswordResetEmail(auth, email)

  const valeur = {
    user,
    chargement,
    seConnecter,
    seDeconnecter,
    reinitialiserMotDePasse,
  }

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un <AuthProvider>')
  return ctx
}
