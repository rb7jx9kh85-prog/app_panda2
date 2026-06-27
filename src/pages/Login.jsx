// ─────────────────────────────────────────────────────────────
// Page /login — connexion du gérant
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { user, chargement, seConnecter } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [enCours, setEnCours] = useState(false)

  // Si déjà connecté au chargement → redirection directe vers /admin
  useEffect(() => {
    if (!chargement && user) navigate('/admin', { replace: true })
  }, [user, chargement, navigate])

  async function handleConnexion() {
    if (enCours) return
    setErreur('')
    if (!email || !motDePasse) {
      setErreur('Veuillez renseigner votre e-mail et votre mot de passe.')
      return
    }
    setEnCours(true)
    try {
      await seConnecter(email.trim(), motDePasse)
      navigate('/admin', { replace: true })
    } catch (_) {
      setErreur('Identifiants incorrects. Réessayez.')
    } finally {
      setEnCours(false)
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

        {erreur && (
          <div className="mt-4 flex justify-center">
            <span className="badge-erreur">
              <AlertCircle size={14} />
              {erreur}
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
