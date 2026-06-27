// ─────────────────────────────────────────────────────────────
// HistoriqueList — 10 derniers menus publiés
// Fix : AbortController pour éviter les setState après démontage
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Loader2, RefreshCw, Utensils } from 'lucide-react'
import { getMenuHistory } from '../services/firestore'

function formaterDate(ts) {
  if (!ts) return '—'
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('fr-CH', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function HistoriqueList({ onRepublier }) {
  const [menus, setMenus]       = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur]     = useState(null)
  const [ouvert, setOuvert]     = useState(null)
  const [republieId, setRepublieId] = useState(null)
  const [okId, setOkId]         = useState(null)

  // Ref pour annuler les setState si le composant est démonté
  const monte = useRef(true)
  useEffect(() => {
    monte.current = true
    return () => { monte.current = false }
  }, [])

  async function charger() {
    if (!monte.current) return
    setChargement(true)
    setErreur(null)
    try {
      const data = await getMenuHistory(10)
      if (monte.current) setMenus(data)
    } catch (_) {
      if (monte.current) setErreur("Impossible de charger l'historique.")
    } finally {
      if (monte.current) setChargement(false)
    }
  }

  useEffect(() => { charger() }, []) // eslint-disable-line

  async function handleRepublier(menu) {
    setRepublieId(menu.id)
    setOkId(null)
    try {
      await onRepublier(menu, menu.id)
      if (monte.current) {
        setOkId(menu.id)
        setTimeout(() => { if (monte.current) setOkId(null) }, 3000)
      }
    } catch (_) {
      if (monte.current) setErreur('Échec de la re-publication.')
    } finally {
      if (monte.current) setRepublieId(null)
    }
  }

  return (
    <section className="panel">
      <div className="ligne-deco mb-6 -mx-7 -mt-7 rounded-t-[16px]" />

      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-cormorant" style={{ fontSize: '2rem', color: 'var(--creme)' }}>
          Historique
        </h2>
        <button type="button" onClick={charger} className="btn-secondary">
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {chargement && (
        <div className="flex items-center gap-2 py-8" style={{ color: 'var(--muted)' }}>
          <Loader2 size={18} className="animate-spin-slow" /> Chargement…
        </div>
      )}

      {erreur && (
        <p className="badge-erreur my-4">{erreur}</p>
      )}

      {!chargement && !erreur && menus.length === 0 && (
        <p className="py-8 text-sm" style={{ color: 'var(--muted)' }}>
          Aucun menu publié pour l'instant.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {menus.map((menu) => {
          const estOuvert = ouvert === menu.id
          const nbPlats   = (menu.plats || []).length

          return (
            <div
              key={menu.id}
              className="rounded-2xl"
              style={{ background: 'var(--noir)', border: '1px solid var(--border)' }}
            >
              {/* Ligne résumé */}
              <div className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-cormorant" style={{ fontSize: '1.25rem', color: 'var(--creme)' }}>
                    {menu.semaine || menu.id}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs" style={{ color: 'var(--muted)' }}>
                    <span className="inline-flex items-center gap-1">
                      <Utensils size={12} />
                      {nbPlats} plat{nbPlats > 1 ? 's' : ''}
                    </span>
                    <span>Publié le {formaterDate(menu.publie_le)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRepublier(menu)}
                    disabled={!!republieId}
                    className="btn-secondary"
                  >
                    {republieId === menu.id
                      ? <Loader2 size={14} className="animate-spin-slow" />
                      : <RefreshCw size={14} />
                    }
                    {okId === menu.id ? 'Republié ✓' : 'Re-publier'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOuvert(estOuvert ? null : menu.id)}
                    className="btn-secondary"
                  >
                    {estOuvert ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    Fiches
                  </button>
                </div>
              </div>

              {/* Accordéon fiches */}
              {estOuvert && (
                <div className="border-t px-4 py-4" style={{ borderColor: 'var(--border)' }}>
                  {menu.description_menu && (
                    <p className="mb-3 text-sm" style={{ color: 'var(--texte)' }}>
                      {menu.description_menu}
                      {menu.prix_menu != null && (
                        <span style={{ color: 'var(--or)' }}>
                          {' '}· CHF {Number(menu.prix_menu).toFixed(2)}
                        </span>
                      )}
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {(menu.plats || []).map((p, i) => (
                      <div
                        key={p.id || i}
                        className="rounded-xl p-3"
                        style={{ background: 'var(--sombre)', border: '1px solid var(--border)' }}
                      >
                        <span className="text-[0.6rem] font-semibold uppercase tracking-widest" style={{ color: 'var(--rouge)' }}>
                          {p.emoji} {p.jour}
                        </span>
                        <p className="mt-1 font-cormorant" style={{ fontSize: '1.05rem', color: 'var(--creme)' }}>
                          {p.nom}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                          {p.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
