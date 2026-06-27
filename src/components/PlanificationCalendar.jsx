import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Copy, Trash2, AlertCircle } from 'lucide-react'

export default function PlanificationCalendar({
  planifications,
  onCharger,
  onDupliquer,
  onSupprimer,
  onSelectionner,
}) {
  const [moisAffiche, setMoisAffiche] = useState(new Date())
  const [selectedSemaine, setSelectedSemaine] = useState(null)

  useEffect(() => {
    onCharger?.()
  }, [onCharger])

  const semaines = genererSemaines(moisAffiche, 6)

  function allerAuMois(delta) {
    setMoisAffiche(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + delta)
      return d
    })
  }

  function obtenirPlanificationPourSemaine(semaine) {
    return planifications.find(p => p.semaine === semaine)
  }

  async function handleDupliquer(semaine) {
    const p = obtenirPlanificationPourSemaine(semaine)
    if (!p) return

    const nouvelleSemaine = prompt('Dupliquer vers semaine (ex: 2025-W20):')
    if (nouvelleSemaine) {
      try {
        await onDupliquer(p.id, nouvelleSemaine)
        onCharger?.()
      } catch (err) {
        console.error('Erreur duplication:', err)
      }
    }
  }

  return (
    <section className="panel">
      <div className="ligne-deco mb-6 -mx-7 -mt-7 rounded-t-[16px]" />

      <div className="mb-8">
        <h2 className="font-cormorant" style={{ fontSize: '2rem', color: 'var(--creme)' }}>
          📅 Planification des menus
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Planifiez vos menus 4-8 semaines à l'avance. Drag-drop pour réorganiser.
        </p>
      </div>

      {/* Navigation mois */}
      <div className="mb-8 flex items-center justify-between rounded-lg border" style={{ borderColor: 'var(--border)', padding: '1rem' }}>
        <button
          type="button"
          onClick={() => allerAuMois(-1)}
          className="p-2 rounded-lg transition-all"
          style={{ color: 'var(--or)' }}
        >
          <ChevronLeft size={20} />
        </button>

        <h3 className="text-lg font-semibold" style={{ color: 'var(--creme)' }}>
          {moisAffiche.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </h3>

        <button
          type="button"
          onClick={() => allerAuMois(1)}
          className="p-2 rounded-lg transition-all"
          style={{ color: 'var(--or)' }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Grille de semaines */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {semaines.map(semaine => {
          const plan = obtenirPlanificationPourSemaine(semaine)
          const [annee, num] = semaine.split('-W')
          const nbPlats = plan?.menus?.length || 0

          return (
            <div
              key={semaine}
              onClick={() => {
                setSelectedSemaine(semaine)
                onSelectionner?.(plan)
              }}
              className="rounded-xl border p-4 transition-all cursor-pointer"
              style={{
                borderColor: selectedSemaine === semaine ? 'var(--or)' : 'var(--border)',
                background: selectedSemaine === semaine ? 'rgba(212,175,87,0.05)' : 'transparent',
                borderWidth: selectedSemaine === semaine ? '2px' : '1px',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--creme)' }}>
                    Semaine {num}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {semaine}
                  </p>
                </div>

                <div className="flex gap-2">
                  {plan && (
                    <>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          handleDupliquer(semaine)
                        }}
                        className="p-1 rounded transition-all"
                        style={{ color: 'var(--or)' }}
                        title="Dupliquer vers une autre semaine"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          if (confirm('Supprimer cette planification ?')) {
                            onSupprimer?.(plan.id)
                          }
                        }}
                        className="p-1 rounded transition-all"
                        style={{ color: 'var(--rouge)' }}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {plan ? (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--creme)' }}>
                      {nbPlats} plats
                    </span>
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        background: plan.status === 'brouillon' ? 'rgba(192,57,43,0.1)' : 'rgba(39,174,96,0.1)',
                        color: plan.status === 'brouillon' ? 'var(--rouge)' : 'var(--vert)',
                      }}
                    >
                      {plan.status === 'brouillon' ? 'Brouillon' : 'Publie'}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    Modifie: {new Date(plan.updatedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ) : (
                <div className="mt-4 text-center">
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    Pas de planification
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <span className="badge-succes">
          <AlertCircle size={14} />
          Conseil: Créez vos brouillons ici, puis copiez-les depuis l'onglet "Menu semaine" pour les publier
        </span>
      </div>
    </section>
  )
}

function genererSemaines(date, count) {
  const semaines = []
  const d = new Date(date)
  d.setDate(1)

  // Trouver le début de la semaine de la première date du mois
  const firstDay = d.getDay()
  d.setDate(d.getDate() - (firstDay === 0 ? 6 : firstDay - 1))

  for (let i = 0; i < count; i++) {
    const annee = d.getFullYear()
    const week = getWeekNumber(d)
    semaines.push(`${annee}-W${String(week).padStart(2, '0')}`)
    d.setDate(d.getDate() + 7)
  }

  return semaines
}

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return weekNum
}
