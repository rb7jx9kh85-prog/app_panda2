// ─────────────────────────────────────────────────────────────
// Page /login — connexion du gérant
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

// Traduit les codes d'erreur Firebase en messages lisibles.
// Distingue le BLOCAGE TEMPORAIRE du mauvais mot de passe — c'est crucial :
// un message "Identifiants incorrects" lors d'un blocage pousse le gérant
// à réessayer, ce qui prolonge le blocage indéfiniment.
const MESSAGES_ERREUR = {
  'auth/too-many-requests':
    "Accès temporairement bloqué (trop de tentatives). Cliquez sur « Mot de passe oublié ? » pour débloquer immédiatement, ou patientez 15 minutes.",
  'auth/wrong-password':     'Mot de passe incorrect.',
  'auth/invalid-credential': 'Identifiants incorrects.',
  'auth/user-not-found':     'Aucun compte trouvé avec cet e-mail.',
  'auth/invalid-email':      'Adresse e-mail invalide.',
  'auth/user-disabled':      'Ce compte a été désactivé.',
  'auth/network-request-failed': 'Problème de connexion réseau.',
}

function messageErreur(code) {
  return MESSAGES_ERREUR[code] ?? 'Connexion impossible. Réessayez dans un instant.'
}

export default function Login() {
  const { user, chargement, seConnecter, reinitialiserMotDePasse } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [mdp, setMdp]           = useState('')
  const [erreur, setErreur]     = useState('')
  const [info, setInfo]         = useState('')
  const [enCours, setEnCours]   = useState(false)
  const [resetEnCours, setResetEnCours] = useState(false)

  useEffect(() => {
    if (!chargement && user) navigate('/admin', { replace: true })
  }, [user, chargement, navigate])

  async function handleConnexion() {
    if (enCours) return
    setErreur('')
    setInfo('')
    if (!email.trim() || !mdp) {
      setErreur('Veuillez renseigner votre e-mail et votre mot de passe.')
      return
    }
    setEnCours(true)
    try {
      await seConnecter(email.trim(), mdp)
      navigate('/admin', { replace: true })
    } catch (e) {
      setErreur(messageErreur(e?.code))
    } finally {
      setEnCours(false)
    }
  }

  async function handleReset() {
    if (resetEnCours) return
    setErreur('')
    setInfo('')
    if (!email.trim()) {
      setErreur("Saisissez d'abord votre adresse e-mail, puis cliquez à nouveau.")
      return
    }
    setResetEnCours(true)
    try {
      await reinitialiserMotDePasse(email.trim())
      setInfo(`E-mail envoyé à ${email.trim()}. Vérifiez votre boîte (et les spams).`)
    } catch (e) {
      setErreur(messageErreur(e?.code))
    } finally {
      setResetEnCours(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleConnexion()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="mb-6 text-center">
        <h1
          className="font-cormorant"
          style={{ color: 'var(--or)', fontSize: '2.5rem', lineHeight: 1.1 }}
        >
          Le Panda
        </h1>
        <p
          className="mt-1 text-xs font-medium uppercase tracking-[0.25em]"
          style={{ color: 'var(--muted)' }}
        >
          Administration
        </p>
      </div>

      {/* Séparateur */}
      <div className="mb-8" style={{ width: 60, height: 1, background: 'rgba(212,175,87,0.3)' }} />

      {/* Card */}
      <div
        className="w-full"
        style={{
          maxWidth: 400,
          background: 'var(--sombre)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: 40,
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div className="mb-5">
          <label className="field-label" htmlFor="email">Adresse e-mail</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="field"
            placeholder="gerant@lepanda.ch"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="mb-6">
          <label className="field-label" htmlFor="mdp">Mot de passe</label>
          <input
            id="mdp"
            type="password"
            autoComplete="current-password"
            className="field"
            placeholder="••••••••"
            value={mdp}
            onChange={(e) => setMdp(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          type="button"
          onClick={handleConnexion}
          disabled={enCours}
          className="btn-primary w-full"
        >
          {enCours
            ? <><Loader2 size={16} className="animate-spin-slow" /> Connexion…</>
            : 'Se connecter'
          }
        </button>

        {/* Lien reset */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleReset}
            disabled={resetEnCours}
            style={{ color: 'var(--muted)', fontSize: '0.75rem' }}
            className="underline-offset-2 transition-colors duration-200 hover:underline disabled:opacity-50"
          >
            {resetEnCours ? 'Envoi…' : 'Mot de passe oublié ?'}
          </button>
        </div>

        {erreur && (
          <div className="mt-4 flex justify-center">
            <span className="badge-erreur text-center">{erreur}</span>
          </div>
        )}

        {info && (
          <div className="mt-4 flex justify-center">
            <span className="badge-succes text-center">
              <CheckCircle2 size={14} />
              {info}
            </span>
          </div>
        )}
      </div>

      <p className="mt-10 text-xs" style={{ color: 'var(--muted)' }}>
        © Le Panda · Leytron, Valais
      </p>
    </div>
  )
}
