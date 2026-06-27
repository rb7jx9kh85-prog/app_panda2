// ─────────────────────────────────────────────────────────────
// ContactForm — demande de modification du site vitrine via Web3Forms
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'

// Clé d'accès Web3Forms — à configurer dans les variables d'environnement Vercel
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || ''

export default function ContactForm() {
  const [sujet, setSujet] = useState('')
  const [message, setMessage] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [succes, setSucces] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleEnvoyer() {
    if (enCours) return
    setErreur('')
    setSucces(false)

    if (!sujet.trim() || !message.trim()) {
      setErreur('Veuillez remplir le sujet et le message.')
      return
    }

    if (!WEB3FORMS_KEY) {
      setErreur('Service de formulaire non configuré. Veuillez contacter le support.')
      return
    }

    setEnCours(true)

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name: 'Le Panda Admin',
          from_email: 'noreply@lepanda.local',
          to_email: 'noevouillamoz3@gmail.com',
          subject: `[Le Panda] Demande de modification : ${sujet}`,
          message: message,
          redirect: 'https://lepanda-admin.vercel.app/',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSucces(true)
        setSujet('')
        setMessage('')
        // Masquer le message de succès après 4s
        setTimeout(() => setSucces(false), 4000)
      } else {
        setErreur('Erreur lors de l\'envoi. Réessayez.')
      }
    } catch (_) {
      setErreur('Problème de connexion. Réessayez.')
    } finally {
      setEnCours(false)
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

      <div className="mt-6 space-y-4">
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
            disabled={enCours}
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
            disabled={enCours}
          />
        </div>

        <button
          type="button"
          onClick={handleEnvoyer}
          disabled={enCours || !sujet.trim() || !message.trim()}
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
