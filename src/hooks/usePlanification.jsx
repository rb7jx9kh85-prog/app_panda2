import { useState, useCallback } from 'react'
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'

const RESTAURANT_ID = import.meta.env.VITE_PANDA_RESTAURANT_ID || 'panda_leytron'

export function usePlanification() {
  const [planifications, setPlanifications] = useState([])
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  const creerPlanification = useCallback(async (semaine, options = {}) => {
    try {
      setErreur('')
      const { menus = [], notes = '' } = options
      const id = `${RESTAURANT_ID}_${semaine}_${Date.now()}`
      const docRef = doc(db, `restaurants/${RESTAURANT_ID}/menus_planifies`, id)

      const planif = {
        semaine,
        menus,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'brouillon',
      }

      await setDoc(docRef, planif)

      // Mise a jour optimiste de l'etat local (pas besoin de recharger)
      setPlanifications(prev => [...prev, { id, ...planif }])

      return id
    } catch (err) {
      const msg = err?.message || 'Erreur lors de la creation'
      setErreur(msg)
      throw err
    }
  }, [])

  const chargerPlanifications = useCallback(async () => {
    try {
      setChargement(true)
      setErreur('')

      const q = query(
        collection(db, `restaurants/${RESTAURANT_ID}/menus_planifies`),
        where('status', '!=', 'publie')
      )
      const snapshot = await getDocs(q)

      const docs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }))

      docs.sort((a, b) => {
        const [anneeA, semaineA] = a.semaine.split('-W')
        const [anneeB, semaineB] = b.semaine.split('-W')
        return anneeA === anneeB
          ? parseInt(semaineA) - parseInt(semaineB)
          : anneeA - anneeB
      })

      setPlanifications(docs)
      return docs
    } catch (err) {
      const msg = err?.message || 'Erreur lors du chargement'
      setErreur(msg)
      throw err
    } finally {
      setChargement(false)
    }
  }, [])

  const mettreAJourPlanification = useCallback(async (id, updates) => {
    try {
      setErreur('')
      const docRef = doc(db, `restaurants/${RESTAURANT_ID}/menus_planifies`, id)

      await setDoc(
        docRef,
        {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )

      setPlanifications(prev =>
        prev.map(p => p.id === id ? { ...p, ...updates } : p)
      )
    } catch (err) {
      const msg = err?.message || 'Erreur lors de la mise a jour'
      setErreur(msg)
      throw err
    }
  }, [])

  const supprimerPlanification = useCallback(async (id) => {
    try {
      setErreur('')
      const docRef = doc(db, `restaurants/${RESTAURANT_ID}/menus_planifies`, id)
      await deleteDoc(docRef)

      setPlanifications(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      const msg = err?.message || 'Erreur lors de la suppression'
      setErreur(msg)
      throw err
    }
  }, [])

  const dupliquerVersAutreSemaine = useCallback(async (id, nouvelleSemaine) => {
    try {
      setErreur('')
      const source = planifications.find(p => p.id === id)
      if (!source) throw new Error('Planification non trouvee')

      const docId = `${RESTAURANT_ID}_${nouvelleSemaine}_${Date.now()}`
      const docRef = doc(db, `restaurants/${RESTAURANT_ID}/menus_planifies`, docId)

      await setDoc(docRef, {
        semaine: nouvelleSemaine,
        menus: source.menus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'brouillon',
      })

      return docId
    } catch (err) {
      const msg = err?.message || 'Erreur lors de la duplication'
      setErreur(msg)
      throw err
    }
  }, [planifications])

  return {
    planifications,
    chargement,
    erreur,
    creerPlanification,
    chargerPlanifications,
    mettreAJourPlanification,
    supprimerPlanification,
    dupliquerVersAutreSemaine,
  }
}
