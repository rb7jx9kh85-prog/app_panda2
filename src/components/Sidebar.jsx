// ─────────────────────────────────────────────────────────────
// Sidebar — navigation (desktop/tablet) + bottom tab bar (mobile)
// ─────────────────────────────────────────────────────────────
import { Calendar, CalendarDays, ClipboardList, Mail, LogOut, BookOpen, Settings, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

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
  const [showMenu, setShowMenu] = useState(false)

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

      {/* ───────── Mobile : bottom tab bar ───────── */}
      <nav
        className="fixed bottom-0 left-0 z-30 flex w-full items-stretch justify-around md:hidden"
        style={{
          background: 'var(--sombre)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {NAV_PRINCIPAL.map(({ id, label, Icone }) => {
          const actif = ongletActif === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setOngletActif(id)
                setShowMenu(false)
              }}
              className="flex flex-1 flex-col items-center gap-1 py-3 transition-colors"
              style={{ color: actif ? 'var(--or)' : 'var(--muted)' }}
            >
              <Icone size={20} />
              <span className="text-[0.6rem] uppercase tracking-wider">{label}</span>
            </button>
          )
        })}

        {/* Menu "Plus" pour options supplémentaires */}
        <div className="relative flex flex-1 flex-col items-center">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors"
            style={{ color: showMenu ? 'var(--or)' : 'var(--muted)' }}
          >
            <MoreVertical size={20} />
            <span className="text-[0.6rem] uppercase tracking-wider">Plus</span>
          </button>

          {/* Menu déroulant */}
          {showMenu && (
            <div
              className="absolute bottom-full left-0 right-0 mb-2 rounded-lg overflow-hidden shadow-lg"
              style={{ background: 'var(--sombre)', border: '1px solid var(--border)' }}
            >
              {NAV_EXTRA.map(({ id, label, Icone }) => {
                const actif = ongletActif === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setOngletActif(id)
                      setShowMenu(false)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
                    style={{
                      color: actif ? 'var(--or)' : 'var(--texte)',
                      background: actif ? 'rgba(212,175,87,0.1)' : 'transparent',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <Icone size={16} />
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleDeconnexion}
          className="flex flex-1 flex-col items-center gap-1 py-3 transition-colors"
          style={{ color: 'var(--muted)' }}
        >
          <LogOut size={20} />
          <span className="text-[0.6rem] uppercase tracking-wider">Quitter</span>
        </button>
      </nav>
    </>
  )
}
