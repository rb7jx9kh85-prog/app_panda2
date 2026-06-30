// ─────────────────────────────────────────────────────────────
// LiquidGlassNav — barre de navigation mobile "Liquid Glass" (iOS-like)
// Bulle de sélection animée + reflet (shine). Effet verre via .liquid-glass
// ─────────────────────────────────────────────────────────────
import { Calendar, CalendarDays, ClipboardList, BookOpen } from 'lucide-react'

const NAV_PRINCIPAL = [
  { id: 'semaine',       label: 'Menu',          Icone: CalendarDays  },
  { id: 'planification', label: 'Planif',        Icone: Calendar      },
  { id: 'reservations',  label: 'Résa',          Icone: BookOpen      },
  { id: 'historique',    label: 'Historique',    Icone: ClipboardList },
]

export default function LiquidGlassNav({ ongletActif, setOngletActif }) {
  const total = NAV_PRINCIPAL.length
  const activeIndex = Math.max(0, NAV_PRINCIPAL.findIndex((n) => n.id === ongletActif))

  // Largeur d'une cellule = (100% - padding gauche/droite) / nb d'items
  const cellWidth = `calc((100% - 16px) / ${total})`
  const selectorLeft = `calc(8px + ${activeIndex} * ((100% - 16px) / ${total}))`

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center md:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 14px)', pointerEvents: 'none' }}
    >
      <div
        className="liquid-glass relative flex"
        style={{
          pointerEvents: 'auto',
          width: 'min(430px, calc(100vw - 24px))',
          height: '74px',
          padding: '8px',
          borderRadius: '999px',
        }}
      >
        {/* Reflet animé */}
        <span className="shine" />

        {/* Bulle de sélection */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '8px',
            left: selectorLeft,
            width: cellWidth,
            height: 'calc(100% - 16px)',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.14)',
            boxShadow:
              '0 10px 25px rgba(0,0,0,0.25), inset 0 1px rgba(255,255,255,0.4), inset 0 -1px rgba(255,255,255,0.08)',
            transition: 'left 0.45s cubic-bezier(0.22,0.9,0.2,1)',
            pointerEvents: 'none',
          }}
        />

        {/* Boutons */}
        {NAV_PRINCIPAL.map(({ id, label, Icone }) => {
          const actif = ongletActif === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setOngletActif(id)}
              className="relative flex flex-1 flex-col items-center justify-center gap-1"
              style={{
                zIndex: 5,
                color: actif ? '#0A84FF' : 'rgba(255,255,255,0.7)',
                transition: 'color 0.35s ease',
              }}
            >
              <Icone size={22} strokeWidth={actif ? 2.4 : 1.9} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
