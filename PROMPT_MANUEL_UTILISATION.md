# Prompt — Génération du manuel d'utilisation

Colle ce texte dans une nouvelle conversation Claude (pas Claude Code, juste Claude).

---

Tu vas rédiger un **manuel d'utilisation complet** destiné au gérant du restaurant
**Le Panda** (Leytron, Valais). Ce gérant n'est pas technique. Il sait utiliser
Facebook, WhatsApp, et un smartphone. Il ne sait pas ce qu'est une API, un repo,
ou un terminal.

## L'outil qu'il utilise

Un panneau d'administration web privé, accessible depuis son navigateur
(ordinateur ou iPad). Il permet de :

1. Se connecter avec un e-mail et un mot de passe
2. Coller le texte de sa publication Facebook du menu de la semaine
3. Cliquer sur un bouton pour que l'IA analyse automatiquement le texte
4. Voir les fiches plats générées (nom, description, jour, type, prix)
5. Corriger une fiche si besoin (clic sur l'icône crayon)
6. Publier les plats sur le site internet du restaurant en un clic
7. Consulter l'historique des menus déjà publiés
8. Re-publier un ancien menu si besoin

## Ce que fait l'outil automatiquement (sans intervention du gérant)

- L'IA (OpenAI) corrige les fautes d'orthographe dans les noms de plats
- L'IA génère une description élégante pour chaque plat
- L'IA identifie le type de plat : entrée, plat principal, dessert
- L'IA extrait le prix depuis le texte
- Le site vitrine (lepanda.vercel.app) se met à jour **instantanément**
  dès la publication, sans que le gérant n'ait rien à faire sur le site

## Format du manuel

Rédige le manuel en **français simple**, comme si tu expliquais à quelqu'un
qui n'a jamais utilisé ce genre d'outil. Utilise :

- Des titres clairs (##, ###)
- Des étapes numérotées pour chaque action
- Des encadrés "⚠️ Attention" pour les erreurs fréquentes
- Des encadrés "💡 Astuce" pour les raccourcis utiles
- Des exemples concrets avec le vrai texte Facebook du restaurant
- Un ton chaleureux et rassurant, jamais technique

## Structure attendue

1. **Introduction** — À quoi sert cet outil ? Pourquoi c'est utile ?
2. **Connexion** — Comment se connecter, que faire si on oublie son mot de passe
3. **Publier le menu de la semaine** — étape par étape avec captures d'écran
   décrites en texte (ex: "vous verrez apparaître un grand bouton rouge...")
4. **Comprendre les fiches générées** — que signifient les badges (Entrée, Plat,
   Dessert), comment lire une fiche, comment la modifier
5. **Corriger une fiche** — comment utiliser l'icône crayon pour éditer
6. **Publier sur le site** — ce qui se passe après le clic, combien de temps ça prend
7. **Vérifier que ça a marché** — aller voir le site vitrine
8. **L'historique** — comment retrouver un ancien menu, comment le re-publier
9. **Problèmes fréquents** — tableau avec Problème / Cause probable / Solution
   (ex: "L'analyse ne fonctionne pas" → "Vérifie ta connexion internet")
10. **Questions / Contact** — à qui s'adresser en cas de problème

## Exemple de texte Facebook que le gérant colle dans l'outil

```
Plats du jour de la semaine du 16 au 20 juin : CHF 21.50
(2 entrées + 1 plat principal à choix + dessert maison)

Mardi 16 juin
Entrée : beignets de crevettes / soupe won ton
Plat principal au choix : bœuf 5 épices riz parfumé / poulet
sauce soja miel légumes sautés riz parfumé

Mercredi 17 juin
Entrée : rouleaux de printemps frais / soupe won ton
Plat principal : canard laqué riz parfumé / tofu légumes sautés

Le weekend : carte uniquement
```

## Ton et style

- Vouvoiement (le gérant est adulte)
- Phrases courtes
- Jamais de jargon technique (pas de "API", "Firestore", "composant", "repo")
- Encourageant : "C'est aussi simple que d'envoyer un message sur WhatsApp"
- Si une action peut mal tourner, explique calmement quoi faire

## Longueur

Le manuel doit être **complet mais pas long** — environ 1000 à 1500 mots.
L'objectif : que le gérant puisse publier son premier menu en autonomie
totale après avoir lu le manuel une seule fois.
