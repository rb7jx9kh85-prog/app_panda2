# Contexte — Projet Le Panda (restaurant, Leytron Valais)

## Situation actuelle

Tu travailles sur l'écosystème numérique du restaurant **Le Panda**.
Il y a **deux applications distinctes** :

### 1. Panneau d'administration (DÉJÀ TERMINÉ)
- **Repo GitHub** : `rb7jx9kh85-prog/app_panda2`
- **Branche** : `claude/le-panda-admin-app-o7d0gz`
- **Stack** : React 18 + Vite + Firebase + OpenAI
- **Fonctionnalités** : le gérant colle son menu Facebook brut → OpenAI analyse → il édite les fiches → il publie sur Firestore
- **Ce qu'il publie** : un document Firestore à l'adresse exacte :
  `restaurants/panda_leytron/live/current`
  Ce document est en **lecture PUBLIQUE** (pas besoin d'être connecté pour le lire)
- **Structure du document publié** :
```json
{
  "semaine": "16-21 juin 2025",
  "prix_menu": 21.50,
  "description_menu": "2 entrées + plat principal à choix + dessert",
  "plats": [
    {
      "id": "mardi_entree",
      "jour": "Mardi 16 juin",
      "type": "entree",
      "emoji": "🥟",
      "nom": "Beignets de crevettes",
      "description": "Beignets croustillants aux crevettes tigrées...",
      "prix": null,
      "menu_prix": 21.50
    }
  ],
  "publie_le": "Timestamp Firestore",
  "publie_par": "gerant@lepanda.ch"
}
```

### 2. Site vitrine (C'EST TON TRAVAIL)
- **URL** : https://lepanda.vercel.app/
- **Stack** : Next.js (App Router, SSR)
- **Repo GitHub** : à identifier via les outils Vercel MCP ou GitHub MCP
  (cherche un repo lié au projet Vercel "lepanda" dans l'équipe `team_5gHDyiQcUWaqKtGg0lzJKAzR`)
- **Problème** : il y a déjà une section `#plats-semaine` dans le site vitrine
  avec un composant appelé `PlatsSemaine`, mais les données sont **HARDCODÉES**
  (plats fictifs) et il n'y a **AUCUN code Firebase** dans le site vitrine.
- **Ce qu'il faut faire** : brancher ce composant sur Firestore pour qu'il lise
  `restaurants/panda_leytron/live/current` en temps réel.

---

## Config Firebase (projet "le-panda") — VALEURS PUBLIQUES OK À COMMITTER

```js
const firebaseConfig = {
  apiKey: "AIzaSyCsTOmKrSHUDuEfo81coIigi_vB_4VWEAE",
  authDomain: "le-panda.firebaseapp.com",
  projectId: "le-panda",
  storageBucket: "le-panda.firebasestorage.app",
  messagingSenderId: "322625286794",
  appId: "1:322625286794:web:d48e60a23a5fca03c5b373",
  measurementId: "G-NSE3JPMW0K"
}
```

Ces valeurs sont publiques par nature (elles partent dans le bundle navigateur).
La sécurité vient des règles Firestore + Auth, pas du secret de ces clés.
**Tu peux les committer directement** dans le repo vitrine.

---

## Identité visuelle (à respecter dans le composant)

Le site vitrine utilise ces variables CSS (déjà définies globalement) :
- `--or` : `#D4AF57` (doré)
- `--rouge` : `#C0392B` (rouge)
- `--noir` : `#1a1108` (fond)
- `--sombre` : `#120d06` (cartes)
- `--creme` : `#f5f0e8` (texte principal)
- `--muted` : `#8a7060` (texte secondaire)
- `--border` : `rgba(212,175,87,0.12)` (bordures)
- Classe `font-cormorant` = Cormorant Garamond (titres)
- Classe `section-title`, `section-tag` = classes globales du site

---

## Ta mission exacte

**Modifier le composant `PlatsSemaine`** du site vitrine pour qu'il :

1. Initialise Firebase (lire depuis Firestore, pas d'auth nécessaire)
2. Écoute en temps réel (`onSnapshot`) le document :
   `restaurants/panda_leytron/live/current`
3. Affiche les plats reçus dans le même style que les cartes hardcodées actuelles
4. Gère les états : chargement, aucun menu publié, menu affiché
5. Si aucun menu n'est encore publié → affiche un message élégant
   ("Le menu de la semaine sera disponible prochainement.")
6. Supprime les plats hardcodés et la mention "Ces plats sont présentatifs"

**Le site vitrine est Next.js donc :**
- Le composant `PlatsSemaine` est probablement un Client Component
  (il a besoin de `'use client'` pour utiliser `useEffect` + `onSnapshot`)
- Ajoute `firebase` aux dépendances si pas déjà présent
  (modifie `package.json` via GitHub MCP)

---

## Contrainte CRITIQUE : pas de terminal disponible

**L'utilisateur n'a AUCUN accès à un terminal.**
Tu dois tout faire via les outils MCP disponibles :
- **GitHub MCP** (`mcp__github__*`) pour lire/modifier/committer les fichiers
- **Vercel MCP** (`mcp__Vercel__*`) pour vérifier les déploiements et logs
- Pas de `Bash`, pas de `npm install` local, pas de CLI

Le déploiement sur Vercel se déclenche **automatiquement** dès que tu pousses
un commit sur la branche principale du repo vitrine (git integration Vercel).

---

## Étapes recommandées

1. **Trouver le repo vitrine** via Vercel MCP (`list_projects` avec teamId
   `team_5gHDyiQcUWaqKtGg0lzJKAzR`) ou GitHub MCP (cherche un repo
   avec "panda" ou "lepanda" dans le nom du compte de l'utilisateur)
2. **Lire le composant** `PlatsSemaine` (ou `plats-semaine`) actuel
3. **Lire `package.json`** pour voir si firebase est déjà une dépendance
4. **Modifier** : ajouter firebase à package.json + réécrire le composant
5. **Committer** directement via `mcp__github__create_or_update_file`
6. **Vérifier** le déploiement Vercel via `mcp__Vercel__list_deployments`

---

## Résultat attendu

Dès que le gérant publie un menu depuis le panneau admin (app_panda2),
les plats apparaissent **immédiatement et automatiquement** sur
https://lepanda.vercel.app/#plats-semaine sans aucune intervention manuelle.
