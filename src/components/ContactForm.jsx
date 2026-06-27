// ─────────────────────────────────────────────────────────────
// ContactForm — demande de modification du site vitrine via Web3Forms
// ─────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

// Clé d'accès Web3Forms — à configurer dans les variables d'environnement Vercel
// ⚠️  SECURITE: Idealement, cette cle devrait etre sur un backend serverless
// voir src/BACKEND_SETUP.md pour instructions de migration
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || ''
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'noevouillamoz3@gmail.com'

// Rate limiting côté client: max 1 soumission par 30 secondes par utilisateur
const RATE_LIMIT_MS = 30000
const STORAGE_KEY = 'lepanda_contact_last_submit'

export default function ContactForm() {
  const { user } = useAuth()
  const [sujet, setSujet] = useState('')
  const [message, setMessage] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [succes, setSucces] = useState(false)
  const [erreur, setErreur] = useState('')
  const [rateLimitErreur, setRateLimitErreur] = useState('')
  const monteRef = useRef(true)

  useEffect(() => {
    return () => {
      monteRef.current = false
    }
  }, [])

  // Verifier le rate limiting
  function verifierRateLimit() {
    const lastSubmit = localStorage.getItem(STORAGE_KEY)
    if (!lastSubmit) return true

    const elapsed = Date.now() - parseInt(lastSubmit, 10)
    if (elapsed < RATE_LIMIT_MS) {
      const secondesRestantes = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000)
      return { ok: false, message: `Attendez ${secondesRestantes}s avant de renvoyer une demande.` }
    }
    return true
  }

  async function handleEnvoyer() {
    if (enCours) return
    setErreur('')
    setSucces(false)
    setRateLimitErreur('')

    // Verifier authentification
    if (!user) {
      setErreur('Vous devez etre connecte pour soumettre une demande.')
      return
    }

    if (!sujet.trim() || !message.trim()) {
      setErreur('Veuillez remplir le sujet et le message.')
      return
    }

    // Verifier rate limiting
    const rateLimitCheck = verifierRateLimit()
    if (rateLimitCheck !== true) {
      setRateLimitErreur(rateLimitCheck.message)
      return
    }

    if (!WEB3FORMS_KEY) {
      setErreur('Service de formulaire non configure. Veuillez contacter le support.')
      return
    }

    setEnCours(true)

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name: `Le Panda Admin (${user.email})`,
          from_email: 'noreply@lepanda.local',
          to_email: CONTACT_EMAIL,
          subject: `[Le Panda] Demande de modification : ${sujet}`,
          message: `Demande de: ${user.email}\n\n${message}`,
          redirect: 'https://lepanda-admin.vercel.app/',
        }),
      })

      const data = await response.json()

      if (data.success && monteRef.current) {
        setSucces(true)
        setSujet('')
        setMessage('')
        localStorage.setItem(STORAGE_KEY, String(Date.now()))
        setTimeout(() => {
          if (monteRef.current) setSucces(false)
        }, 4000)
      } else if (monteRef.current) {
        setErreur('Erreur lors de l\'envoi. Reessayez.')
      }
    } catch (_) {
      if (monteRef.current) {
        setErreur('Probleme de connexion. Reessayez.')
      }
    } finally {
      if (monteRef.current) {
        setEnCours(false)
      }
    }
  }

  return (
    <section className="panel">
      <div className="ligne-deco mb-6 -mx-7 -mt-7 rounded-t-[16px]" />

      <h2 className="font-cormorant" style={{ fontSize: '2rem', color: 'var(--creme)' }}>
        Demandes de modification
      </h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
        Envoyez vos demandes pour le site vitrine (lepanda.vercel.app)
      </p>
      {!user && (
        <div className="mt-4 flex justify-center">
          <span className="badge-erreur">
            <AlertCircle size={14} />
            Vous devez etre connecte pour soumettre une demande.
          </span>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {rateLimitErreur && (
          <div className="flex justify-center">
            <span className="badge-erreur">
              <AlertCircle size={14} />
              {rateLimitErreur}
            </span>
          </div>
        )}

        <div>
          <label className="field-label" htmlFor="sujet">
            Sujet
          </label>
          <input
            id="sujet"
            type="text"
            className="field"
            placeholder="ex. Ajouter horaires d\'ouverture, changer couleur du logo..."
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            disabled={enCours || !user}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="message">
            Message détaillé
          </label>
          <textarea
            id="message"
            className="field resize-y"
            style={{ minHeight: 100 }}
            placeholder="Décrivez précisément ce que vous souhaitez modifier ou ajouter..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={enCours || !user}
          />
        </div>

        <button
          type="button"
          onClick={handleEnvoyer}
          disabled={enCours || !sujet.trim() || !message.trim() || !user}
          className="btn-primary w-full"
        >
          {enCours ? (
            <>
              <Send size={15} className="animate-spin-slow" />
              Envoi…
            </>
          ) : (
            <>
              <Send size={15} />
              Envoyer la demande
            </>
          )}
        </button>

        {succes && (
          <div className="flex justify-center">
            <span className="badge-succes">
              <CheckCircle2 size={14} />
              Demande envoyée ! L\'équipe vous contactera bientôt.
            </span>
          </div>
        )}

        {erreur && (
          <div className="flex justify-center">
            <span className="badge-erreur">
              <AlertCircle size={14} />
              {erreur}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
