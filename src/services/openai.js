// ─────────────────────────────────────────────────────────────
// Service OpenAI — parsing du menu Facebook brut en JSON structure
// ─────────────────────────────────────────────────────────────
//
// ⚠️  SECURITE — Cle API exposee cote client
// La cle OpenAI est lue depuis `VITE_OPENAI_API_KEY`. Le prefixe `VITE_`
// signifie qu'elle est integree au bundle JavaScript et donc VISIBLE par
// quiconque inspecte le code livre au navigateur.
//
// RISQUES:
// 1. N'importe qui peut extraire la cle et faire des appels non-autorises
// 2. Factures OpenAI potentiellement illimitees (DoS financier)
// 3. Limite de rate limit peut etre contournee
//
// MITIGATIONS ACTUELLES:
// - App Firebase-protected: un seul gerant authentifie peut acceder
// - Limites de taille d'input enforces (MAX_TEXT_LENGTH = 5000 chars)
// - Usage suppose etre marginal et interne
//
// POUR PRODUCTION GRAND PUBLIC:
// Migrer vers une Cloud Function / route serverless (ex: Firebase Cloud Functions,
// Vercel Serverless Function) qui garde la cle secrete et ajoute:
// - Rate limiting par utilisateur (max X appels/jour)
// - Quotas de tokens par utilisateur
// - Logging et monitoring des appels
// - Validation serveur-side des inputs
// - Timeout strict et gestion des erreurs robuste
// ─────────────────────────────────────────────────────────────
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

const MODELE = 'gpt-4o-mini'
const MAX_TOKENS = 2000
const TIMEOUT_MS = 15000

const SYSTEM_PROMPT = `Tu es un expert en extraction de donnees de menus de restaurants asiatiques. Tu recois un texte copie depuis Facebook (avec emojis, sauts de ligne, tirets, points, etc.) et tu dois en extraire TOUS les plats.

INSTRUCTIONS STRICTES :
1. Nettoie le texte : supprime les emojis, normalise les tirets/points en listes
2. DETECTE CHAQUE PLAT INDIVIDUELLEMENT — un plat par entree, un plat par option de "plat principal au choix"
3. Pour "Plat principal au choix : • Boeuf ... • Poulet ...", cree DEUX plats distincts
4. Champs obligatoires pour chaque plat :
   - jour : ex "Mardi 16 juin" (extrait du contexte)
   - type : "entree", "plat_principal", ou "dessert"
   - nom : nom du plat (corrige, orthographe standard)
   - description : 1-2 phrases gourmandes EN FRANCAIS
   - emoji : (entree), (plat), (dessert), i (info)
   - prix : null (sauf si explicitement taggue)
5. Prix menu : cherche "CHF X.XX" ou "X CHF" au debut
6. Semaine : cherche la plage de dates ("16 au 19 juin" -> "16-19 juin 2025")
7. Si "carte uniquement" -> type "info", nom "Carte uniquement", description="Services speciaux"
8. Reponds UNIQUEMENT avec du JSON valide. Pas de markdown, pas de texte avant/apres.`

const STRICT_SUFFIX = `

ERREUR : ta reponse n'etait pas du JSON valide. Reessaie avec ce schema EXACT :
{
  "semaine": "16-19 juin 2025",
  "prix_menu": 21.50,
  "description_menu": "2 entrees + plat principal a choix + dessert",
  "plats": [
    {"id": "mardi_entree_1", "jour": "Mardi 16 juin", "type": "entree", "emoji": "X", "nom": "Beignets de crevettes", "description": "...", "prix": null, "menu_prix": 21.50}
  ]
}
Reponds UNIQUEMENT avec ce JSON, zero texte autour.`

const EMOJI_PAR_TYPE = {
  entree:        '1',
  plat_principal: '2',
  dessert:       '3',
  info:          'i',
}

function extraireJSON(texte) {
  if (!texte) throw new Error('Reponse vide')
  let t = texte.trim()
  t = t.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  const debut = t.indexOf('{')
  const fin = t.lastIndexOf('}')
  if (debut !== -1 && fin !== -1) {
    t = t.slice(debut, fin + 1)
  }
  return JSON.parse(t)
}

function normaliser(data) {
  const plats = Array.isArray(data.plats) ? data.plats : []
  return {
    semaine: data.semaine || '',
    prix_menu:
      data.prix_menu === undefined || data.prix_menu === null
        ? null
        : Number(data.prix_menu),
    description_menu: data.description_menu || '',
    plats: plats.map((p, i) => ({
      id: p.id || `plat_${i}`,
      jour: p.jour || '',
      type: p.type || 'plat_principal',
      emoji: p.emoji || EMOJI_PAR_TYPE[p.type] || '?',
      nom: p.nom || '',
      description: p.description || '',
      prix: p.prix === undefined ? null : p.prix,
      menu_prix:
        p.menu_prix === undefined || p.menu_prix === null
          ? data.prix_menu ?? null
          : p.menu_prix,
    })),
  }
}

function avecTimeout(promesse, ms) {
  return Promise.race([
    promesse,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms)
    ),
  ])
}

async function appeler(texte, strict = false) {
  const completion = await avecTimeout(
    client.chat.completions.create({
      model: MODELE,
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + (strict ? STRICT_SUFFIX : '') },
        { role: 'user', content: texte },
      ],
    }),
    TIMEOUT_MS
  )
  return completion.choices?.[0]?.message?.content || ''
}

function nettoyerTexte(texte) {
  let t = texte
    .replace(/[\p{Emoji}]/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
  return t
}

// ⚠️  LIMITES DE SECURITE: protegent contre les abus grossiers
// mais une migration backend est ideale (voir src/BACKEND_SETUP.md)
const MAX_TEXT_LENGTH = 5000
const MIN_TEXT_LENGTH = 10

export async function parseMenuWithAI(texte) {
  if (!texte || !texte.trim()) {
    throw new Error('Veuillez coller le texte de votre menu avant l analyse.')
  }

  const cleaned = texte.trim()

  if (cleaned.length < MIN_TEXT_LENGTH) {
    throw new Error('Le texte est trop court. Minimum 10 caracteres.')
  }

  if (cleaned.length > MAX_TEXT_LENGTH) {
    throw new Error('Le texte est trop long. Maximum 5000 caracteres. Decoupez votre menu en plusieurs parties.')
  }

  try {
    const texteNettoy = nettoyerTexte(texte)
    const brut = await appeler(texteNettoy, false)
    try {
      return normaliser(extraireJSON(brut))
    } catch (_) {
      const brut2 = await appeler(texteNettoy, true)
      return normaliser(extraireJSON(brut2))
    }
  } catch (err) {
    if (err?.message === 'TIMEOUT') {
      throw new Error('L analyse prend du temps, reessaie.')
    }
    const status = err?.status || err?.response?.status
    if (status === 429) {
      throw new Error('Limite API atteinte, reessaie dans 1 minute.')
    }
    if (status === 401) {
      throw new Error('Cle OpenAI invalide. Verifie la configuration.')
    }
    if (err instanceof SyntaxError) {
      throw new Error('Reponse illisible de l IA. Reessaie.')
    }
    throw new Error('Erreur lors de l analyse. Reessaie dans un instant.')
  }
}
