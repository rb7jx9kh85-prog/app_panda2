import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { getReservations, updateStatutReservation } from '../services/firestore'

const STATUTS = [
  { id: 'tous',       label: 'Toutes'      },
  { id: 'en_attente', label: 'En attente'  },
  { id: 'confirme',   label: 'Confirmées'  },
  { id: 'refuse',     label: 'Refusées'    },
]

function badgeStatut(statut) {
  if (statut === 'confirme') return { label: 'Confirmée', color: 'var(--vert, #22c55e)', bg: 'rgba(34,197,94,0.12)' }
  if (statut === 'refuse')   return { label: 'Refusée',   color: '#ef4444',              bg: 'rgba(239,68,68,0.12)'  }
  return                            { label: 'En attente', color: 'var(--or)',             bg: 'rgba(212,175,87,0.12)' }
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-CH', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTs(ts) {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('fr-CH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function CarteReservation({ resa, onStatut }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const badge = badgeStatut(resa.statut)

  async function changer(statut) {
    setLoading(true)
    await onStatut(resa.id, statut)
    setLoading(false)
  }

  return (
    <div
      className="rounded-2xl p-5 transition-all"
      style={{ background: 'var(--surface, rgba(255,255,255,0.04))', border: '1px solid var(--border)' }}
    >
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold" style={{ color: 'var(--texte)' }}>
            {resa.nom}
          </span>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            {formatDate(resa.date)} · {resa.heure} · {resa.nb_personnes} pers.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ color: badge.color, background: badge.bg }}
          >
            {badge.label}
          </span>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            style={{ color: 'var(--muted)' }}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Détails expandés */}
      {expanded && (
        <div className="mt-4 flex flex-col gap-2 text-sm" style={{ color: 'var(--muted)' }}>
          {resa.telephone && <span>Tel : <a href={`tel:${resa.telephone}`} style={{ color: 'var(--or)' }}>{resa.telephone}</a></span>}
          {resa.email    && <span>Email : <a href={`mailto:${resa.email}`} style={{ color: 'var(--or)' }}>{resa.email}</a></span>}
          {resa.message  && <span className="italic">"{resa.message}"</span>}
          <span className="text-xs">Reçue le {formatTs(resa.cree_le)}</span>
        </div>
      )}

      {/* Actions */}
      {resa.statut === 'en_attente' && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => changer('confirme')}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <CheckCircle size={15} /> Confirmer
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => changer('refuse')}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <XCircle size={15} /> Refuser
          </button>
        </div>
      )}

      {/* Annuler un statut */}
      {resa.statut !== 'en_attente' && (
        <button
          type="button"
          disabled={loading}
          onClick={() => changer('en_attente')}
          className="mt-3 text-xs"
          style={{ color: 'var(--muted)' }}
        >
          Remettre en attente
        </button>
      )}
    </div>
  )
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [filtre, setFiltre] = useState('tous')
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  async function charger() {
    setChargement(true)
    setErreur('')
    try {
      const data = await getReservations(100)
      setReservations(data)
    } catch {
      setErreur('Erreur de chargement.')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [])

  async function handleStatut(id, statut) {
    await updateStatutReservation(id, statut)
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, statut } : r))
    )
  }

  const filtrees = filtre === 'tous'
    ? reservations
    : reservations.filter((r) => r.statut === filtre)

  const nbAttente = reservations.filter((r) => r.statut === 'en_attente').length

  return (
    <div className="flex flex-col gap-6">
      {/* Titre */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--or)', fontFamily: 'var(--font-cormorant, serif)' }}>
            Réservations
          </h2>
          {nbAttente > 0 && (
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
              {nbAttente} en attente de confirmation
            </p>
          )}
        </div>
        <button type="button" onClick={charger} style={{ color: 'var(--muted)' }} title="Actualiser">
          <RefreshCw size={18} className={chargement ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {STATUTS.map(({ id, label }) => {
          const actif = filtre === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setFiltre(id)}
              className="rounded-full px-4 py-1.5 text-sm font-medium transition-all"
              style={{
                color: actif ? 'var(--or)' : 'var(--muted)',
                background: actif ? 'rgba(212,175,87,0.12)' : 'transparent',
                border: actif ? '1px solid rgba(212,175,87,0.3)' : '1px solid var(--border)',
              }}
            >
              {label}
              {id === 'en_attente' && nbAttente > 0 && (
                <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-xs" style={{ background: 'var(--rouge, #c0392b)', color: '#fff' }}>
                  {nbAttente}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Contenu */}
      {chargement ? (
        <div className="flex justify-center py-12">
          <Clock size={24} className="animate-pulse" style={{ color: 'var(--muted)' }} />
        </div>
      ) : erreur ? (
        <p className="text-center text-sm" style={{ color: '#ef4444' }}>{erreur}</p>
      ) : filtrees.length === 0 ? (
        <p className="py-12 text-center text-sm" style={{ color: 'var(--muted)' }}>
          {filtre === 'tous' ? 'Aucune réservation pour l\'instant.' : 'Aucune réservation dans cette catégorie.'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrees.map((resa) => (
            <CarteReservation key={resa.id} resa={resa} onStatut={handleStatut} />
          ))}
        </div>
      )}
    </div>
  )
}
