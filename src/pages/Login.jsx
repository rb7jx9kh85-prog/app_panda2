// ─────────────────────────────────────────────────────────────
// Page /login — connexion du gérant
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

// Traduit le code d'erreur Firebase en message clair pour le gérant.
// IMPORTANT : on distingue le blocage temporaire (« trop de tentatives »)
// du vrai mauvais mot de passe — sinon le gérant croit à tort que son mot de
// passe est faux alors qu'il est simplement bloqué.
function traduireErreur(code) {
  switch (code) {
    case 'auth/too-many-requests':
      return 'Trop de tentatives : Firebase a temporairement bloqué l’accès par sécurité. Cliquez sur « Mot de passe oublié ? » pour débloquer tout de suite, ou patientez ~15 min (déblocage automatique).'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Identifiants incorrects. Réessayez.'
    case 'auth/network-request-failed':
      return 'Problème de connexion internet. Vérifiez votre réseau.'
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé.'
    default:
      return 'Connexion impossible. Réessayez dans un instant.'
  }
}

export default function Login() {
  const { user, chargement, seConnecter, reinitialiserMotDePasse } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [info, setInfo] = useState('') // message de succès (e-mail de reset)
  const [enCours, setEnCours] = useState(false)
  const [resetEnCours, setResetEnCours] = useState(false)

  // Si déjà connecté au chargement → redirection directe vers /admin
  useEffect(() => {
    if (!chargement && user) navigate('/admin', { replace: true })
  }, [user, chargement, navigate])

  async function handleConnexion() {
    if (enCours) return
    setErreur('')
    setInfo('')
    if (!email || !motDePasse) {
      setErreur('Veuillez renseigner votre e-mail et votre mot de passe.')
      return
    }
    setEnCours(true)
    try {
      await seConnecter(email.trim(), motDePasse)
      navigate('/admin', { replace: true })
    } catch (e) {
      setErreur(traduireErreur(e?.code))
    } finally {
      setEnCours(false)
    }
  }

  // Envoi de l'e-mail de réinitialisation (débloque aussi « trop de tentatives »)
  async function handleResetMotDePasse() {
    if (resetEnCours) return
    setErreur('')
    setInfo('')
    if (!email) {
      setErreur('Saisissez d’abord votre adresse e-mail, puis cliquez à nouveau.')
      return
    }
    setResetEnCours(true)
    try {
      await reinitialiserMotDePasse(email.trim())
      setInfo(
        `E-mail de réinitialisation envoyé à ${email.trim()}. Vérifiez votre boîte (et les spams).`
      )
    } catch (e) {
      setErreur(traduireErreur(e?.code))
    } finally {
      setResetEnCours(false)
    }
  }

  // Soumission au clavier (Entrée) sans <form> natif
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

      {/* Séparateur doré */}
      <div
        className="mb-8"
        style={{
          width: 60,
          height: 1,
          background: 'rgba(212,175,87,0.3)',
        }}
      />

      {/* Card de login */}
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
          <label className="field-label" htmlFor="email">
            Adresse e-mail
          </label>
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
          <label className="field-label" htmlFor="mdp">
            Mot de passe
          </label>
          <input
            id="mdp"
            type="password"
            autoComplete="current-password"
            className="field"
            placeholder="••••••••"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          type="button"
          onClick={handleConnexion}
          disabled={enCours}
          className="btn-primary w-full"
        >
          {enCours ? (
            <>
              <Loader2 size={16} className="animate-spin-slow" />
              Connexion…
            </>
          ) : (
            'Se connecter'
          )}
        </button>

        {/* Lien de réinitialisation / déblocage */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResetMotDePasse}
            disabled={resetEnCours}
            className="text-xs underline-offset-2 transition-colors duration-300 hover:underline disabled:opacity-50"
            style={{ color: 'var(--muted)' }}
          >
            {resetEnCours ? 'Envoi…' : 'Mot de passe oublié ?'}
          </button>
        </div>

        {erreur && (
          <div className="mt-4 flex justify-center">
            <span className="badge-erreur">
              <AlertCircle size={14} />
              {erreur}
            </span>
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

      {/* Bas de page */}
      <p
        className="mt-10 text-xs"
        style={{ color: 'var(--muted)' }}
      >
        © Le Panda · Leytron, Valais
      </p>
    </div>
  )
}
