// ─────────────────────────────────────────────────────────────
// PublishBar — bouton "Valider et publier" + Bloc 3 (confirmation)
// ─────────────────────────────────────────────────────────────
import { ArrowRight, CheckCircle2, ExternalLink, Loader2, RotateCcw } from 'lucide-react'

const SITE_URL = 'https://lepanda.vercel.app'

// Formate l'horodatage de publication en français
function formaterDate(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  const jour = d.toLocaleDateString('fr-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const heure = d.toLocaleTimeString('fr-CH', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return { jour, heure }
}

export default function PublishBar({
  onPublier,
  publication,
  confirmation,
  onNouveau,
}) {
  // ───────── Bloc 3 : confirmation après publication ─────────
  if (confirmation) {
    const { jour, heure } = formaterDate(confirmation.publie_le)
    return (
      <section
        className="rounded-2xl p-7"
        style={{
          background: 'rgba(212,175,87,0.05)',
          border: '1px solid var(--or)',
        }}
      >
        <div className="flex items-center gap-3">
          <CheckCircle2 size={26} style={{ color: 'var(--or)' }} />
          <h3
            className="font-cormorant"
            style={{ fontSize: '1.6rem', color: 'var(--or)' }}
          >
            Menu publié avec succès
          </h3>
        </div>

        <p className="mt-2 text-sm" style={{ color: 'var(--texte)' }}>
          Publié le {jour} à {heure}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <ExternalLink size={15} />
            Voir sur le site
          </a>
          <button type="button" onClick={onNouveau} className="btn-primary">
            <RotateCcw size={15} />
            Publier un nouveau menu
          </button>
        </div>
      </section>
    )
  }

  // ───────── Bouton de publication ─────────
  return (
    <section>
      <button
        type="button"
        onClick={onPublier}
        disabled={publication}
        className="btn-primary w-full"
      >
        {publication ? (
          <>
            <Loader2 size={16} className="animate-spin-slow" />
            Publication en cours…
          </>
        ) : (
          <>
            <ArrowRight size={16} />
            Valider et publier sur le site
          </>
        )}
      </button>
      <p
        className="mt-3 text-center text-xs"
        style={{ color: 'var(--muted)' }}
      >
        Les fiches seront visibles sur lepanda.vercel.app dans les secondes
        suivantes.
      </p>
    </section>
  )
}
