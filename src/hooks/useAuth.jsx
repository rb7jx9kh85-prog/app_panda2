// ─────────────────────────────────────────────────────────────
// useAuth — contexte d'authentification Firebase
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
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setChargement(false)
    })
    return unsub
  }, [])

  const seConnecter = (email, mdp) =>
    signInWithEmailAndPassword(auth, email, mdp)

  const seDeconnecter = () => fbSignOut(auth)

  // Envoie un e-mail de réinitialisation ET lève le blocage "trop de tentatives"
  const reinitialiserMotDePasse = (email) =>
    sendPasswordResetEmail(auth, email)

  return (
    <AuthContext.Provider
      value={{ user, chargement, seConnecter, seDeconnecter, reinitialiserMotDePasse }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être dans un <AuthProvider>')
  return ctx
}
