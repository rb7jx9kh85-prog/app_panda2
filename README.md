# 🐼 Le Panda — Panneau d'administration

Application web privée permettant au gérant du restaurant **Le Panda**
(Leytron, Valais) de :

1. Coller sa publication Facebook brute (le menu de la semaine) ;
2. La faire structurer automatiquement par **OpenAI** (`gpt-4o-mini`) ;
3. Prévisualiser / éditer les fiches plats générées ;
4. Publier le menu sur le site vitrine [lepanda.vercel.app](https://lepanda.vercel.app)
   via **Firestore** en temps réel.

---

## 🧱 Stack technique

| Domaine        | Techno                         |
| -------------- | ------------------------------ |
| Front          | React 18 + Vite                |
| Navigation     | React Router v6                |
| Auth & données | Firebase v10 (Auth + Firestore)|
| IA             | OpenAI SDK (`gpt-4o-mini`)     |
| Styles         | Tailwind CSS v3                |
| Icônes         | Lucide React                   |
| Déploiement    | Vercel                         |

---

## 📂 Structure du projet

```
src/
├── main.jsx
├── App.jsx              → Router + PrivateRoute
├── index.css           → variables CSS + styles globaux
├── firebase.js         → init Firebase (Auth + Firestore)
├── pages/
│   ├── Login.jsx
│   └── Admin.jsx
├── components/
│   ├── Sidebar.jsx
│   ├── MenuInput.jsx   → Textarea + bouton analyse
│   ├── FicheCard.jsx   → Une fiche plat (édition inline)
│   ├── FichesGrid.jsx  → Grid de FicheCard
│   ├── PublishBar.jsx  → Bouton publier + confirmation
│   └── HistoriqueList.jsx
├── hooks/
│   ├── useAuth.jsx     → onAuthStateChanged Firebase
│   └── useMenu.jsx     → orchestration IA + Firestore
└── services/
    ├── openai.js       → parseMenuWithAI(texte)
    └── firestore.js    → publishMenu(), getMenuHistory()
firestore.rules         → règles de sécurité Firestore
```

---

## 🚀 Installation locale

### 1. Pré-requis

- Node.js ≥ 18
- Un projet **Firebase** (Auth e-mail/mot de passe + Firestore activés)
- Une clé **API OpenAI**

### 2. Cloner et installer

```bash
npm install
```

### 3. Variables d'environnement

Copiez le template et renseignez vos valeurs :

```bash
cp .env.example .env.local
```

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_OPENAI_API_KEY=...
VITE_PANDA_RESTAURANT_ID=panda_leytron
```

> ⚠️ **Clé OpenAI exposée côté client** — Le préfixe `VITE_` rend la clé
> visible dans le bundle navigateur. C'est un compromis assumé : l'app est
> privée et protégée par le login Firebase (un seul gérant). Pour un usage
> grand public, déplacez l'appel OpenAI derrière une Cloud Function.
> Voir le commentaire détaillé en tête de `src/services/openai.js`.

### 4. Lancer en développement

```bash
npm run dev
```

L'app démarre sur <http://localhost:5173>.

---

## 🔐 Configuration Firebase

### Authentification

1. Console Firebase → **Authentication** → **Sign-in method**
2. Activez **E-mail/Mot de passe**
3. Créez l'utilisateur du gérant (onglet **Users** → *Add user*)

### Firestore

1. Console Firebase → **Firestore Database** → *Créer une base*
2. Onglet **Règles** → collez le contenu de [`firestore.rules`](./firestore.rules)
   puis **Publier**.

Arborescence créée automatiquement à la première publication :

```
restaurants/panda_leytron
├── live/current          ← lecture PUBLIQUE (site vitrine, onSnapshot)
└── menus/2025-W25        ← archives (lecture/écriture authentifiées)
```

Le site vitrine doit écouter le document **`restaurants/panda_leytron/live/current`** :

```js
import { doc, onSnapshot } from 'firebase/firestore'

onSnapshot(doc(db, 'restaurants', 'panda_leytron', 'live', 'current'), (snap) => {
  const menu = snap.data() // { semaine, prix_menu, description_menu, plats[] }
  // ... rendu des fiches sur le site vitrine
})
```

---

## ☁️ Déploiement sur Vercel

1. Poussez le repo sur GitHub.
2. Sur [vercel.com](https://vercel.com) → **New Project** → importez le repo.
3. Framework détecté : **Vite** (build `npm run build`, output `dist`).
4. **Settings → Environment Variables** : ajoutez les 8 variables `VITE_*`
   du fichier `.env.local`.
5. **Deploy**.

> Pensez à autoriser le domaine Vercel dans
> Firebase → Authentication → **Settings → Authorized domains**.

---

## 🧪 Flux fonctionnel

```
Login → Coller le texte Facebook → Analyser (OpenAI)
      → Prévisualiser / Éditer les fiches → Publier (Firestore)
      → Confirmation → visible sur lepanda.vercel.app
```

- **Onglet « Menu semaine »** : saisie, analyse IA, édition inline, publication.
- **Onglet « Historique »** : 10 derniers menus, re-publication, accordéon des fiches.

---

## 🎨 Identité visuelle

Reprise de la direction artistique du site vitrine (variables dans `src/index.css`) :
fond brun-noir, accents dorés `#D4AF57`, rouge profond `#C0392B`, typographies
*Cormorant Garamond* (titres) et *Inter* (corps).

---

## 📝 Scripts

| Commande          | Effet                              |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Serveur de développement (Vite)    |
| `npm run build`   | Build de production (`dist/`)      |
| `npm run preview` | Prévisualise le build localement   |

---

© Le Panda · Leytron, Valais
