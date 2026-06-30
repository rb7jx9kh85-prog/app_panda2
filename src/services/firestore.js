// ─────────────────────────────────────────────────────────────
// Service Firestore — publication et historique des menus
// ─────────────────────────────────────────────────────────────
//
// Arborescence :
//   restaurants/{RESTAURANT_ID}
//     ├── live/current                  ← dernier menu publié (lu PUBLIQUEMENT
//     │                                    par le site vitrine via onSnapshot)
//     └── menus/{annee}-W{semaine_iso}  ← archive de chaque menu publié
//
// Le document live est volontairement séparé de la sous-collection `menus`
// pour (1) pouvoir l'ouvrir en lecture publique sans exposer les archives et
// (2) éviter qu'il pollue la requête d'historique.
//
import {
  collection,
  doc,
  getDocs,
  getDoc,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import { db, RESTAURANT_ID } from '../firebase'

/**
 * Calcule le numéro de semaine ISO 8601 et l'année ISO d'une date.
 * @param {Date} date
 * @returns {{ annee: number, semaine: number, id: string }} ex. id = "2025-W25"
 */
export function semaineISO(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  // Jeudi de la semaine courante détermine l'année ISO
  const jour = d.getUTCDay() || 7 // dimanche = 7
  d.setUTCDate(d.getUTCDate() + 4 - jour)
  const annee = d.getUTCFullYear()
  const debutAnnee = new Date(Date.UTC(annee, 0, 1))
  const semaine = Math.ceil(((d - debutAnnee) / 86400000 + 1) / 7)
  const id = `${annee}-W${String(semaine).padStart(2, '0')}`
  return { annee, semaine, id }
}

/** Référence du document archive `menus/{id}`. */
function refMenu(id) {
  return doc(db, 'restaurants', RESTAURANT_ID, 'menus', id)
}

/** Référence du document live `live/current` (écouté par le site vitrine). */
function refCurrent() {
  return doc(db, 'restaurants', RESTAURANT_ID, 'live', 'current')
}

/** Référence de la sous-collection `menus`. */
function refMenusCollection() {
  return collection(db, 'restaurants', RESTAURANT_ID, 'menus')
}

/**
 * Publie un menu : écrit à la fois dans l'archive `menus/{id}` et dans
 * le document `live/current` (écouté en temps réel par le site vitrine).
 *
 * @param {object} menu  { semaine, prix_menu, description_menu, plats[] }
 * @param {string} email email du gérant connecté
 * @param {string} [docId] id de semaine forcé (re-publication d'une archive)
 * @returns {Promise<{ id: string, publie_le: Date }>}
 */
export async function publishMenu(menu, email, docId) {
  const id = docId || semaineISO().id

  const donnees = {
    semaine: menu.semaine || '',
    prix_menu: menu.prix_menu ?? null,
    description_menu: menu.description_menu || '',
    plats: menu.plats || [],
    publie_le: serverTimestamp(),
    publie_par: email || 'inconnu',
    menu_id: id,
  }

  await Promise.all([
    setDoc(refMenu(id), donnees), // 1. archive de la semaine
    setDoc(refCurrent(), donnees), // 2. document live (site vitrine)
  ])

  return { id, publie_le: new Date() }
}

/**
 * Récupère les N derniers menus publiés, du plus récent au plus ancien.
 * @param {number} max
 * @returns {Promise<Array>}
 */
export async function getMenuHistory(max = 10) {
  const q = query(
    refMenusCollection(),
    orderBy('publie_le', 'desc'),
    limit(max)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ─── Réservations ─────────────────────────────────────────────

function refReservations() {
  return collection(db, 'restaurants', RESTAURANT_ID, 'reservations')
}

/**
 * Récupère les réservations triées par date de création décroissante.
 * @param {number} max
 */
export async function getReservations(max = 100) {
  const q = query(refReservations(), orderBy('cree_le', 'desc'), limit(max))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * Met à jour le statut d'une réservation.
 * @param {string} id
 * @param {'en_attente'|'confirme'|'refuse'} statut
 */
export async function updateStatutReservation(id, statut) {
  await updateDoc(doc(db, 'restaurants', RESTAURANT_ID, 'reservations', id), {
    statut,
    traite_le: serverTimestamp(),
  })
}

// ─── Jours fermés ─────────────────────────────────────────────

function refClosedDates() {
  return doc(db, 'restaurants', RESTAURANT_ID, 'closed_dates', 'config')
}

/**
 * Récupère la liste des jours fermés (format ISO YYYY-MM-DD).
 * @returns {Promise<string[]>}
 */
export async function getClosedDates() {
  const snap = await getDoc(refClosedDates())
  return snap.exists() ? snap.data().dates || [] : []
}

/**
 * Ajoute un jour fermé.
 * setDoc + merge : crée le document `closed_dates/config` s'il n'existe pas
 * encore (updateDoc échouerait avec « No document to update »).
 * @param {string} isoDate format YYYY-MM-DD
 */
export async function addClosedDate(isoDate) {
  await setDoc(
    refClosedDates(),
    { dates: arrayUnion(isoDate) },
    { merge: true }
  )
}

/**
 * Supprime un jour fermé.
 * setDoc + merge pour rester robuste même si le document n'existe pas encore.
 * @param {string} isoDate format YYYY-MM-DD
 */
export async function removeClosedDate(isoDate) {
  await setDoc(
    refClosedDates(),
    { dates: arrayRemove(isoDate) },
    { merge: true }
  )
}
