// ─────────────────────────────────────────────────────────────
// Service OpenAI — parsing du menu Facebook brut en JSON structuré
// ─────────────────────────────────────────────────────────────
//
// ⚠️ SÉCURITÉ — Clé API exposée côté client
// La clé OpenAI est lue depuis `VITE_OPENAI_API_KEY`. Le préfixe `VITE_`
// signifie qu'elle est intégrée au bundle JavaScript et donc VISIBLE par
// quiconque inspecte le code livré au navigateur.
//
// C'est un compromis ACCEPTÉ pour cette application interne : l'accès au
// panneau d'administration est protégé par le login Firebase (un seul
// gérant), l'app n'est jamais publique, et l'usage de l'API reste marginal.
// `dangerouslyAllowBrowser: true` est requis par le SDK pour autoriser
// explicitement cet usage navigateur.
//
// 👉 Pour une mise en production grand public, déplacer cet appel derrière
//    une Cloud Function / route serverless qui garde la clé secrète.
// ─────────────────────────────────────────────────────────────
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

const MODELE = 'gpt-4o-mini'
const MAX_TOKENS = 2000
const TIMEOUT_MS = 15000 // 15s

const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans la structuration de menus de restaurants asiatiques en Suisse romande. Tu reçois un texte brut copié depuis Facebook et tu dois en extraire une structure JSON propre.
Règles importantes :
- Corrige les fautes d'orthographe et de casse dans les noms de plats
- Génère une description courte et appétissante (1-2 phrases max) pour chaque plat, en français, dans un style élégant et gourmand
- Si le prix global est mentionné, inclus-le dans chaque objet si c'est un menu
- Identifie correctement le type : entrée, plat_principal, ou dessert
- Si weekend = 'carte uniquement', crée un objet spécial avec type 'info'
- Réponds UNIQUEMENT avec du JSON valide, sans markdown, sans explication`

// Renfort utilisé lors du retry si le premier JSON est invalide
const STRICT_SUFFIX = `

RAPPEL STRICT : ta réponse précédente n'était pas du JSON valide. Réponds cette fois EXCLUSIVEMENT avec un objet JSON valide respectant exactement ce schéma, sans aucun texte autour, sans backticks, sans commentaire :
{"semaine": string, "prix_menu": number|null, "description_menu": string, "plats": [{"id": string, "jour": string, "type": "entree"|"plat_principal"|"dessert"|"info", "emoji": string, "nom": string, "description": string, "prix": number|null, "menu_prix": number|null}]}`

// Emojis par défaut selon le type (au cas où l'IA en oublie un)
const EMOJI_PAR_TYPE = {
  entree: '🥟',
  plat_principal: '🍱',
  dessert: '🍮',
  info: 'ℹ️',
}

/**
 * Nettoie une réponse texte de l'IA pour en extraire le JSON brut.
 * (Supprime d'éventuels fences markdown ```json … ```).
 */
function extraireJSON(texte) {
  if (!texte) throw new Error('Réponse vide')
  let t = texte.trim()
  // Retire les fences markdown éventuels
  t = t.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  // Tente de localiser le premier { et le dernier }
  const debut = t.indexOf('{')
  const fin = t.lastIndexOf('}')
  if (debut !== -1 && fin !== -1) {
    t = t.slice(debut, fin + 1)
  }
  return JSON.parse(t)
}

/**
 * Normalise le résultat : garantit la présence des champs attendus
 * et génère des id/emoji manquants.
 */
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
      id: p.id || `${(p.jour || 'plat').toLowerCase().replace(/\s+/g, '_')}_${i}`,
      jour: p.jour || '',
      type: p.type || 'plat_principal',
      emoji: p.emoji || EMOJI_PAR_TYPE[p.type] || '🍽️',
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

/** Promesse de timeout pour borner l'appel réseau. */
function avecTimeout(promesse, ms) {
  return Promise.race([
    promesse,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms)
    ),
  ])
}

/**
 * Appel unitaire à l'API OpenAI.
 * @param {string} texte  texte brut collé par le gérant
 * @param {boolean} strict ajoute le rappel strict (utilisé au retry)
 */
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

/**
 * Analyse un menu Facebook brut et retourne la structure JSON normalisée.
 * Gère : timeout (>15s), JSON invalide (retry strict 1×), quota dépassé.
 *
 * @param {string} texte
 * @returns {Promise<{semaine, prix_menu, description_menu, plats: []}>}
 * @throws {Error} message en français prêt à afficher
 */
export async function parseMenuWithAI(texte) {
  if (!texte || !texte.trim()) {
    throw new Error('Veuillez coller le texte de votre menu avant l’analyse.')
  }

  try {
    // 1er essai
    const brut = await appeler(texte, false)
    try {
      return normaliser(extraireJSON(brut))
    } catch (_) {
      // JSON invalide → retry automatique 1 fois avec prompt plus strict
      const brut2 = await appeler(texte, true)
      return normaliser(extraireJSON(brut2))
    }
  } catch (err) {
    // Timeout
    if (err?.message === 'TIMEOUT') {
      throw new Error('L’analyse prend du temps, réessaie.')
    }
    // Quota / rate limit dépassé
    const status = err?.status || err?.response?.status
    if (status === 429) {
      throw new Error('Limite API atteinte, réessaie dans 1 minute.')
    }
    if (status === 401) {
      throw new Error('Clé OpenAI invalide. Vérifie la configuration.')
    }
    // JSON toujours invalide après retry, ou autre erreur
    if (err instanceof SyntaxError) {
      throw new Error('Réponse illisible de l’IA. Réessaie.')
    }
    throw new Error("Erreur lors de l’analyse. Réessaie dans un instant.")
  }
}
