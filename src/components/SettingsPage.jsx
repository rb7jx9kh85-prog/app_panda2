import { useState, useEffect } from 'react'
import { Calendar, Plus, X, RefreshCw } from 'lucide-react'
import { getClosedDates, addClosedDate, removeClosedDate } from '../services/firestore'

export default function SettingsPage() {
  const [closedDates, setClosedDates] = useState([])
  const [newDate, setNewDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    charger()
  }, [])

  async function charger() {
    setLoading(true)
    setError('')
    try {
      const dates = await getClosedDates()
      setClosedDates(dates.sort())
    } catch (err) {
      setError('Erreur de chargement.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function ajouter() {
    if (!newDate) return
    try {
      await addClosedDate(newDate)
      setClosedDates((prev) => [...prev, newDate].sort())
      setNewDate('')
    } catch (err) {
      setError('Erreur lors de l\'ajout.')
      console.error(err)
    }
  }

  async function supprimer(date) {
    try {
      await removeClosedDate(date)
      setClosedDates((prev) => prev.filter((d) => d !== date))
    } catch (err) {
      setError('Erreur lors de la suppression.')
      console.error(err)
    }
  }

  function formatDate(iso) {
    const d = new Date(iso + 'T00:00')
    return d.toLocaleDateString('fr-CH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Titre */}
      <div>
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--or)', fontFamily: 'var(--font-cormorant, serif)' }}>
          Paramètres
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Gérez les jours de fermeture du restaurant
        </p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="rounded-lg px-4 py-2 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {/* Ajouter un jour fermé */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface, rgba(255,255,255,0.04))', border: '1px solid var(--border)' }}>
        <p className="mb-3 font-semibold" style={{ color: 'var(--texte)' }}>
          ➕ Ajouter un jour fermé
        </p>
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--texte)' }}
          />
          <button
            onClick={ajouter}
            disabled={!newDate}
            className="rounded-lg px-4 py-2 font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
            style={{ background: 'var(--or)', color: '#000' }}
          >
            <Plus size={18} /> Ajouter
          </button>
        </div>
      </div>

      {/* Liste des jours fermés */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface, rgba(255,255,255,0.04))', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold" style={{ color: 'var(--texte)' }}>
            📅 Jours fermés ({closedDates.length})
          </p>
          <button onClick={charger} style={{ color: 'var(--muted)' }} title="Actualiser">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Chargement...</p>
        ) : closedDates.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Aucun jour fermé configuré. Le restaurant est ouvert tous les jours.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {closedDates.map((date) => (
              <div
                key={date}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm"
                style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)' }}
              >
                <Calendar size={14} style={{ color: '#ef4444' }} />
                <span style={{ color: 'var(--texte)' }}>
                  {formatDate(date)}
                </span>
                <button
                  onClick={() => supprimer(date)}
                  style={{ color: '#ef4444' }}
                  className="hover:opacity-70 transition-opacity"
                  title="Supprimer"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(212,175,87,0.1)', border: '1px solid rgba(212,175,87,0.2)', color: 'var(--texte)' }}>
        ℹ️ Les jours fermés seront désactivés dans le formulaire de réservation du site vitrine.
      </div>
    </div>
  )
}
