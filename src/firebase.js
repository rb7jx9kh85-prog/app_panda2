// ─────────────────────────────────────────────────────────────
// Initialisation Firebase (Auth email/password + Firestore)
// ─────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuration Firebase du projet "le-panda".
//
// ⚠️ Ces valeurs ne sont PAS des secrets : la config web Firebase est conçue
// par Google pour être publique (elle est de toute façon embarquée dans le
// bundle navigateur). La sécurité repose sur les règles Firestore + Firebase
// Auth, pas sur le secret de ces identifiants. Il est donc sûr de les
// committer. On laisse néanmoins la priorité aux variables d'environnement
// VITE_* si elles sont définies (ex. sur Vercel).
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
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-NSE3JPMW0K',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

// Identifiant fixe du restaurant (collection restaurants/{id})
export const RESTAURANT_ID =
  import.meta.env.VITE_PANDA_RESTAURANT_ID || 'panda_leytron'

export default app
