// ─────────────────────────────────────────────────────────────
// MenuInput — Bloc 1 : textarea + bouton "Analyser avec l'IA"
// ─────────────────────────────────────────────────────────────
import { Loader2, Sparkles } from 'lucide-react'

const PLACEHOLDER = `Plats du jour de la semaine du 16 au 19 juin : CHF 21.50
Mardi 16 juin
Entrée : beignets de crevettes
Plat principal au choix :
• Bœuf 5 épices, riz parfumé
...`

export default function MenuInput({ texte, setTexte, onAnalyser, analyse }) {
  return (
    <section className="panel">
      <div className="ligne-deco mb-6 -mt-7 -mx-7 rounded-t-[16px]" />

      <h2 className="font-cormorant" style={{ fontSize: '2rem', color: 'var(--creme)' }}>
        Nouveau menu
      </h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
        Collez votre publication Facebook ci-dessous
      </p>

      {/* Zone textarea + overlay de chargement */}
      <div className="relative mt-5">
        <textarea
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          disabled={analyse}
          placeholder={PLACEHOLDER}
          className="field resize-y"
          style={{ minHeight: 280, lineHeight: 1.6 }}
        />

        {analyse && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[10px]"
            style={{ background: 'rgba(15,11,6,0.7)', backdropFilter: 'blur(2px)' }}
          >
            <Loader2 size={28} className="animate-spin-slow" style={{ color: 'var(--or)' }} />
            <span className="text-sm" style={{ color: 'var(--texte)' }}>
              Analyse en cours…
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onAnalyser}
        disabled={analyse || !texte.trim()}
        className="btn-primary mt-5 w-full"
      >
        {analyse ? (
          <>
            <Loader2 size={16} className="animate-spin-slow" />
            Analyse en cours…
          </>
        ) : (
          <>
            <Sparkles size={15} />
            Analyser avec l’IA
          </>
        )}
      </button>
    </section>
  )
}
