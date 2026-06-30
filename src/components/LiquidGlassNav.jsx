// ─────────────────────────────────────────────────────────────
// LiquidGlassNav — barre de navigation mobile (style iOS « liquid glass »)
// Verre sombre neutre + bulle de sélection raffinée (accent doré marque)
// ─────────────────────────────────────────────────────────────
import { Calendar, CalendarDays, ClipboardList, BookOpen } from 'lucide-react'

const NAV_PRINCIPAL = [
  { id: 'semaine',       label: 'Menu',       Icone: CalendarDays  },
  { id: 'planification', label: 'Planif',     Icone: Calendar      },
  { id: 'reservations',  label: 'Résa',       Icone: BookOpen      },
  { id: 'historique',    label: 'Historique', Icone: ClipboardList },
]

export default function LiquidGlassNav({ ongletActif, setOngletActif }) {
  const total = NAV_PRINCIPAL.length
  const activeIndex = Math.max(0, NAV_PRINCIPAL.findIndex((n) => n.id === ongletActif))

  // Cellule = (largeur - padding) / nb d'items ; la bulle glisse dessus
  const cellWidth = `calc((100% - 12px) / ${total})`
  const selectorLeft = `calc(6px + ${activeIndex} * ((100% - 12px) / ${total}))`

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center md:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 14px)', pointerEvents: 'none' }}
    >
      <div
        className="relative flex"
        style={{
          pointerEvents: 'auto',
          width: 'min(420px, calc(100vw - 28px))',
          height: '64px',
          padding: '6px',
          borderRadius: '999px',
          background: 'rgba(28,28,32,0.55)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 10px 34px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.14)',
        }}
      >
        {/* Bulle de sélection (glisse en douceur) */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '6px',
            left: selectorLeft,
            width: cellWidth,
            height: 'calc(100% - 12px)',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.13)',
            border: '1px solid rgba(232,201,122,0.22)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.22)',
            transition: 'left 0.42s cubic-bezier(0.34, 1.32, 0.5, 1)',
            pointerEvents: 'none',
          }}
        />

        {NAV_PRINCIPAL.map(({ id, label, Icone }) => {
          const actif = ongletActif === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setOngletActif(id)}
              className="relative flex flex-1 flex-col items-center justify-center"
              style={{
                zIndex: 5,
                gap: '3px',
                color: actif ? '#e8c97a' : 'rgba(245,240,232,0.5)',
                transition: 'color 0.3s ease',
              }}
            >
              <Icone size={21} strokeWidth={actif ? 2.3 : 1.8} />
              <span
                className="font-medium"
                style={{ fontSize: '10px', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
