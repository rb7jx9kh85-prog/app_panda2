// ─────────────────────────────────────────────────────────────
// FichesGrid — Bloc 2 : preview des fiches générées + métadonnées menu
// ─────────────────────────────────────────────────────────────
import FicheCard from './FicheCard'

export default function FichesGrid({ menu, setMenu }) {
  if (!menu) return null

  const plats = menu.plats || []

  // Remplace une fiche dans le tableau plats
  function majFiche(index, ficheModifiee) {
    const nouveaux = plats.map((p, i) => (i === index ? ficheModifiee : p))
    setMenu({ ...menu, plats: nouveaux })
  }

  return (
    <section className="panel">
      <div className="ligne-deco mb-6 -mt-7 -mx-7 rounded-t-[16px]" />

      {/* Titre + badge nombre de plats */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h2 className="font-cormorant" style={{ fontSize: '1.75rem', color: 'var(--or)' }}>
          Fiches générées
        </h2>
        <span className="badge-succes">
          {plats.length} plat{plats.length > 1 ? 's' : ''} détecté
          {plats.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid responsive : 1 / 2 / 3 colonnes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {plats.map((fiche, i) => (
          <FicheCard
            key={fiche.id || i}
            fiche={fiche}
            onChange={(f) => majFiche(i, f)}
          />
        ))}
      </div>

      {/* Métadonnées globales du menu */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="prix-menu">
            Prix du menu semaine
          </label>
          <input
            id="prix-menu"
            className="field"
            placeholder="CHF 21.50"
            value={menu.prix_menu ?? ''}
            onChange={(e) => {
              const v = e.target.value
                .replace(/[^0-9.,]/g, '')
                .replace(',', '.')
              setMenu({
                ...menu,
                prix_menu: v === '' ? null : Number(v),
              })
            }}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="semaine">
            Période (semaine)
          </label>
          <input
            id="semaine"
            className="field"
            placeholder="16–21 juin 2025"
            value={menu.semaine ?? ''}
            onChange={(e) => setMenu({ ...menu, semaine: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="field-label" htmlFor="desc-menu">
          Description globale du menu
        </label>
        <textarea
          id="desc-menu"
          className="field resize-y"
          style={{ minHeight: 60 }}
          placeholder="2 entrées + plat principal à choix + dessert"
          value={menu.description_menu ?? ''}
          onChange={(e) =>
            setMenu({ ...menu, description_menu: e.target.value })
          }
        />
      </div>
    </section>
  )
}
