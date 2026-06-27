// ─────────────────────────────────────────────────────────────
// FicheCard — une fiche plat avec édition inline
// Hover géré via la classe CSS .fiche-card (pas de JS onMouseEnter)
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Check, Edit3 } from 'lucide-react'

const LIBELLE_TYPE = {
  entree:        'Entrée',
  plat_principal: 'Plat principal',
  dessert:       'Dessert',
  info:          'Info',
}

export default function FicheCard({ fiche, onChange }) {
  const [edition, setEdition] = useState(false)

  function maj(champ, valeur) {
    onChange({ ...fiche, [champ]: valeur })
  }

  return (
    <article className="fiche-card flex flex-col">
      <div className="ligne-deco" />

      <div className="flex flex-1 flex-col p-5">
        {/* Entête */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <span
            className="text-[0.65rem] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--rouge)' }}
          >
            {fiche.emoji} {LIBELLE_TYPE[fiche.type] ?? fiche.type}
          </span>

          <div className="flex shrink-0 items-center gap-2">
            {edition ? (
              <input
                value={fiche.jour}
                onChange={(e) => maj('jour', e.target.value)}
                className="field"
                style={{ padding: '2px 8px', fontSize: '0.75rem', width: 130 }}
              />
            ) : (
              fiche.jour && <span className="pill-jour">{fiche.jour}</span>
            )}

            <button
              type="button"
              onClick={() => setEdition((v) => !v)}
              className="rounded-md p-1"
              style={{
                color: edition ? 'var(--or)' : 'var(--muted)',
                transition: 'color 0.2s ease',
              }}
              title={edition ? 'Terminer' : 'Modifier'}
            >
              {edition ? <Check size={16} /> : <Edit3 size={15} />}
            </button>
          </div>
        </div>

        {/* Nom */}
        {edition ? (
          <input
            value={fiche.nom}
            onChange={(e) => maj('nom', e.target.value)}
            className="field mb-2"
            placeholder="Nom du plat"
          />
        ) : (
          <h3
            className="font-cormorant font-medium"
            style={{ fontSize: '1.25rem', color: 'var(--creme)' }}
          >
            {fiche.nom}
          </h3>
        )}

        {/* Description */}
        {edition ? (
          <textarea
            value={fiche.description}
            onChange={(e) => maj('description', e.target.value)}
            className="field mt-1 resize-y"
            style={{ minHeight: 70, fontSize: '0.85rem' }}
            placeholder="Description"
          />
        ) : (
          <p className="mt-1 flex-1 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            {fiche.description}
          </p>
        )}

        {/* Prix */}
        {edition ? (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--muted)' }}>Prix CHF</span>
            <input
              type="number"
              step="0.5"
              min="0"
              value={fiche.prix ?? ''}
              onChange={(e) =>
                maj('prix', e.target.value === '' ? null : Number(e.target.value))
              }
              className="field"
              style={{ padding: '4px 10px', width: 100 }}
              placeholder="—"
            />
          </div>
        ) : (
          fiche.prix != null && (
            <p className="mt-3 font-cormorant" style={{ fontSize: '1.1rem', color: 'var(--or)' }}>
              CHF {Number(fiche.prix).toFixed(2)}
            </p>
          )
        )}
      </div>
    </article>
  )
}
