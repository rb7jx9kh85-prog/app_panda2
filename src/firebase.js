// ─────────────────────────────────────────────────────────────
// Initialisation Firebase — Auth + Firestore
// ─────────────────────────────────────────────────────────────
//
// La persistance locale est configurée SYNCHRONEMENT via initializeAuth
// (au lieu de setPersistence post-init) : la session survive à la fermeture
// du navigateur et le gérant reste connecté entre les visites.
//
// Config Firebase : valeurs publiques par nature (intégrées au bundle JS).
// La sécurité repose sur les règles Firestore + Firebase Auth, pas sur le
// secret de ces identifiants. Voir firestore.rules.
import { initializeApp } from 'firebase/app'
import { browserLocalPersistence, initializeAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyCsTOmKrSHUDuEfo81coIigi_vB_4VWEAE',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'le-panda.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'le-panda',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'le-panda.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '322625286794',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:322625286794:web:d48e60a23a5fca03c5b373',
}

const app = initializeApp(firebaseConfig)

// initializeAuth avec persistence locale (synchrone, garanti avant tout signIn)
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
})

export const db = getFirestore(app)

export const RESTAURANT_ID =
  import.meta.env.VITE_PANDA_RESTAURANT_ID || 'panda_leytron'

export default app
