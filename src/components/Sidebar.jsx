// ─────────────────────────────────────────────────────────────
// Sidebar — navigation (desktop/tablet) + Liquid Glass nav (mobile)
// ─────────────────────────────────────────────────────────────
import { Calendar, CalendarDays, ClipboardList, Mail, LogOut, BookOpen, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LiquidGlassNav from './LiquidGlassNav'

const NAV_PRINCIPAL = [
  { id: 'semaine',       label: 'Menu semaine',  Icone: CalendarDays  },
  { id: 'planification', label: 'Planification', Icone: Calendar      },
  { id: 'reservations',  label: 'Réservations',  Icone: BookOpen      },
  { id: 'historique',    label: 'Historique',    Icone: ClipboardList },
]

const NAV_EXTRA = [
  { id: 'contact',       label: 'Demandes',      Icone: Mail          },
  { id: 'parametres',    label: 'Paramètres',    Icone: Settings      },
]

const NAV = [...NAV_PRINCIPAL, ...NAV_EXTRA]

export default function Sidebar({ ongletActif, setOngletActif }) {
  const { seDeconnecter } = useAuth()
  const navigate = useNavigate()

  async function handleDeconnexion() {
    await seDeconnecter()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* ───────── Desktop / tablet : sidebar fixe gauche ───────── */}
      <aside
        className="fixed left-0 top-0 z-20 hidden h-screen flex-col justify-between md:flex"
        style={{
          width: 240,
          background: 'var(--sombre)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <div>
          {/* Logo */}
          <div className="px-6 pb-8 pt-7">
            <h1
              className="font-cormorant leading-none"
              style={{ color: 'var(--or)', fontSize: '1.9rem' }}
            >
              Le Panda
            </h1>
            <p
              className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.25em]"
              style={{ color: 'var(--muted)' }}
            >
              Admin
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 px-3">
            {NAV.map(({ id, label, Icone }) => {
              const actif = ongletActif === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setOngletActif(id)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300"
                  style={{
                    color: actif ? 'var(--or)' : 'var(--texte)',
                    background: actif ? 'rgba(212,175,87,0.1)' : 'transparent',
                    border: actif
                      ? '1px solid rgba(212,175,87,0.2)'
                      : '1px solid transparent',
                  }}
                >
                  <Icone size={18} />
                  {label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Déconnexion */}
        <div className="p-4">
          <button
            type="button"
            onClick={handleDeconnexion}
            className="btn-secondary w-full"
          >
            <LogOut size={15} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ───────── Mobile : actions secondaires (barre verre groupée) ───────── */}
      <div
        className="fixed inset-x-0 z-30 flex justify-center md:hidden"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 86px)', pointerEvents: 'none' }}
      >
        <div
          className="flex items-center"
          style={{
            pointerEvents: 'auto',
            borderRadius: '999px',
            padding: '4px',
            background: 'rgba(28,28,32,0.5)',
            backdropFilter: 'blur(22px) saturate(180%)',
            WebkitBackdropFilter: 'blur(22px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 6px 22px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)',
          }}
        >
          {NAV_EXTRA.map(({ id, label, Icone }) => {
            const actif = ongletActif === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setOngletActif(id)}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all active:scale-95"
                style={{
                  fontSize: '12.5px',
                  fontWeight: 500,
                  color: actif ? '#e8c97a' : 'rgba(245,240,232,0.6)',
                  background: actif ? 'rgba(255,255,255,0.12)' : 'transparent',
                }}
              >
                <Icone size={14} />
                {label}
              </button>
            )
          })}

          <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.12)', margin: '0 3px' }} />

          <button
            type="button"
            onClick={handleDeconnexion}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all active:scale-95"
            style={{ fontSize: '12.5px', fontWeight: 500, color: 'rgba(255,118,108,0.9)' }}
          >
            <LogOut size={14} />
            Quitter
          </button>
        </div>
      </div>

      <LiquidGlassNav ongletActif={ongletActif} setOngletActif={setOngletActif} />
    </>
  )
}
