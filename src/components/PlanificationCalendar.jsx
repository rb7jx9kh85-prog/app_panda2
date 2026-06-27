import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Trash2,
  AlertCircle,
  Plus,
  Pencil,
  Check,
  X,
  Loader2,
} from 'lucide-react'

export default function PlanificationCalendar({
  planifications,
  onCharger,
  onCreer,
  onModifier,
  onDupliquer,
  onSupprimer,
}) {
  const [moisAffiche, setMoisAffiche] = useState(new Date())
  const [edition, setEdition] = useState(null) // semaine en cours d'edition
  const [texteNote, setTexteNote] = useState('')
  const [enregistrement, setEnregistrement] = useState(false)

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

  function planPour(semaine) {
    return planifications.find(p => p.semaine === semaine)
  }

  function ouvrirEdition(semaine, plan) {
    setEdition(semaine)
    setTexteNote(plan?.notes || '')
  }

  function fermerEdition() {
    setEdition(null)
    setTexteNote('')
  }

  async function enregistrer(semaine) {
    if (enregistrement) return
    const plan = planPour(semaine)
    setEnregistrement(true)
    try {
      if (plan) {
        await onModifier?.(plan.id, { notes: texteNote.trim() })
      } else {
        await onCreer?.(semaine, { notes: texteNote.trim() })
      }
      fermerEdition()
    } catch (err) {
      console.error('Erreur enregistrement planification:', err)
    } finally {
      setEnregistrement(false)
    }
  }

  async function handleDupliquer(semaine) {
    const p = planPour(semaine)
    if (!p) return
    const cible = prompt('Dupliquer vers quelle semaine ? (ex: 2026-W30)')
    if (cible) {
      try {
        await onDupliquer?.(p.id, cible.trim())
        onCharger?.()
      } catch (err) {
        console.error('Erreur duplication:', err)
      }
    }
  }

  return (
    <section className="panel anim-fade">
      <div className="ligne-deco mb-6 -mx-7 -mt-7 rounded-t-[16px]" />

      <div className="mb-8">
        <h2 className="font-cormorant" style={{ fontSize: '2rem', color: 'var(--creme)' }}>
          Planification des menus
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Planifiez vos menus 4-8 semaines à l'avance. Ajoutez une note par semaine.
        </p>
      </div>

      {/* Navigation mois */}
      <div
        className="mb-8 flex items-center justify-between rounded-lg border"
        style={{ borderColor: 'var(--border)', padding: '1rem' }}
      >
        <button
          type="button"
          onClick={() => allerAuMois(-1)}
          className="rounded-lg p-2 transition-transform duration-200 hover:-translate-x-0.5"
          style={{ color: 'var(--or)' }}
          aria-label="Mois précédent"
        >
          <ChevronLeft size={20} />
        </button>

        <h3 className="text-lg font-semibold capitalize" style={{ color: 'var(--creme)' }}>
          {moisAffiche.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </h3>

        <button
          type="button"
          onClick={() => allerAuMois(1)}
          className="rounded-lg p-2 transition-transform duration-200 hover:translate-x-0.5"
          style={{ color: 'var(--or)' }}
          aria-label="Mois suivant"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Grille de semaines */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {semaines.map((semaine, i) => {
          const plan = planPour(semaine)
          const [, num] = semaine.split('-W')
          const enEdition = edition === semaine

          return (
            <div
              key={semaine}
              className="carte-semaine anim-entree rounded-xl border p-4"
              style={{
                animationDelay: `${i * 55}ms`,
                borderColor: enEdition ? 'var(--or)' : 'var(--border)',
                background: plan ? 'rgba(212,175,87,0.04)' : 'transparent',
                borderWidth: enEdition ? '2px' : '1px',
              }}
            >
              {/* Entête carte */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--creme)' }}>
                    Semaine {num}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    {semaine}
                  </p>
                </div>

                {!enEdition && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => ouvrirEdition(semaine, plan)}
                      className="rounded p-1.5 transition-colors hover:bg-[rgba(212,175,87,0.12)]"
                      style={{ color: 'var(--or)' }}
                      title={plan ? 'Modifier la note' : 'Ajouter une planification'}
                    >
                      {plan ? <Pencil size={15} /> : <Plus size={16} />}
                    </button>
                    {plan && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDupliquer(semaine)}
                          className="rounded p-1.5 transition-colors hover:bg-[rgba(212,175,87,0.12)]"
                          style={{ color: 'var(--or)' }}
                          title="Dupliquer vers une autre semaine"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Supprimer cette planification ?')) {
                              onSupprimer?.(plan.id)
                            }
                          }}
                          className="rounded p-1.5 transition-colors hover:bg-[rgba(192,57,43,0.12)]"
                          style={{ color: 'var(--rouge)' }}
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mode édition : zone de saisie */}
              {enEdition ? (
                <div className="anim-fade mt-4">
                  <textarea
                    autoFocus
                    value={texteNote}
                    onChange={e => setTexteNote(e.target.value)}
                    placeholder="Ex: theme asiatique, prevoir crevettes et boeuf, dessert au choix..."
                    className="field resize-y"
                    style={{ minHeight: 80, fontSize: '0.85rem' }}
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => enregistrer(semaine)}
                      disabled={enregistrement}
                      className="btn-primary"
                      style={{ padding: '8px 18px' }}
                    >
                      {enregistrement ? (
                        <Loader2 size={14} className="animate-spin-slow" />
                      ) : (
                        <Check size={14} />
                      )}
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={fermerEdition}
                      disabled={enregistrement}
                      className="btn-secondary"
                      style={{ padding: '8px 16px' }}
                    >
                      <X size={14} />
                      Annuler
                    </button>
                  </div>
                </div>
              ) : plan ? (
                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="rounded px-2 py-1 text-xs font-medium"
                      style={{ background: 'rgba(192,57,43,0.12)', color: 'var(--rouge)' }}
                    >
                      Brouillon
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      Modifié le {new Date(plan.updatedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {plan.notes ? (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--texte)' }}>
                      {plan.notes}
                    </p>
                  ) : (
                    <p className="text-xs italic" style={{ color: 'var(--muted)' }}>
                      Aucune note — cliquez sur le crayon pour en ajouter.
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => ouvrirEdition(semaine, null)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-xs transition-colors hover:bg-[rgba(212,175,87,0.06)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                >
                  <Plus size={14} />
                  Planifier cette semaine
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <span className="badge-succes text-center">
          <AlertCircle size={14} />
          Astuce : notez ici vos idées de menus, puis publiez-les depuis l'onglet « Menu semaine ».
        </span>
      </div>
    </section>
  )
}

function genererSemaines(date, count) {
  const semaines = []
  const d = new Date(date)
  d.setDate(1)

  // Aligner sur le lundi de la semaine contenant le 1er du mois
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
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
}
