# Guide de Sécurisation des Clés API

## 🔒 Contexte de Sécurité

Actuellement, les clés API suivantes sont **exposées côté client** (incluses dans le bundle JavaScript):
- `VITE_OPENAI_API_KEY` (OpenAI)
- `VITE_WEB3FORMS_KEY` (Web3Forms)

Cela signifie que **n'importe qui inspectant le code source peut accéder à ces clés** et:
1. Faire des appels OpenAI non-autorisés → **factures illimitées** 💸
2. Envoyer des formulaires en usurpant l'app → **spam de l'inbox** 📧
3. Exploiter les limites de rate-limit → **DoS** 🔥

## ✅ Solution: Backend Serverless

Migrer les appels API vers un backend serverless qui **garde les clés secrètes** et ajoute:
- Rate limiting par utilisateur
- Validation serveur-side des inputs
- Logging et monitoring
- Timeouts stricts

### Option 1: Firebase Cloud Functions (Recommandé)

#### Installation

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

#### Fichier: functions/src/index.js

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai').default;
const fetch = require('node-fetch');

admin.initializeApp();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─────────────────────────────────────────────────────────────
// Cloud Function 1: parseMenuWithAI
// ─────────────────────────────────────────────────────────────
exports.parseMenuWithAI = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Utilisateur non authentifié'
    );
  }

  const texte = data.texte || '';

  // Validation d'input
  if (!texte || texte.trim().length < 10) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Texte trop court (minimum 10 caractères)'
    );
  }

  if (texte.length > 5000) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Texte trop long (maximum 5000 caractères)'
    );
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en extraction de donnees de menus... [système prompt complet]`
        },
        { role: 'user', content: texte }
      ],
    });

    return {
      success: true,
      data: completion.choices[0].message.content
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Erreur lors de l\'analyse'
    );
  }
});

// ─────────────────────────────────────────────────────────────
// Cloud Function 2: submitContactForm
// ─────────────────────────────────────────────────────────────
exports.submitContactForm = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Utilisateur non authentifié'
    );
  }

  const { sujet, message } = data;

  // Validation
  if (!sujet || !message) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Sujet et message requis'
    );
  }

  // Rate limiting: max 1 formulaire par utilisateur par jour
  const db = admin.firestore();
  const uid = context.auth.uid;
  const today = new Date().toISOString().split('T')[0];
  const docRef = db.collection('contact_submissions').doc(`${uid}_${today}`);
  const doc = await docRef.get();

  if (doc.exists) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Maximum 1 demande par jour'
    );
  }

  // Envoyer via Web3Forms
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: process.env.WEB3FORMS_KEY,
        from_name: `Le Panda Admin (${context.auth.token.email})`,
        from_email: 'noreply@lepanda.local',
        to_email: process.env.CONTACT_EMAIL,
        subject: `[Le Panda] Demande: ${sujet}`,
        message: `De: ${context.auth.token.email}\n\n${message}`,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Enregistrer la soumission pour rate limiting
      await docRef.set({
        sujet,
        email: context.auth.token.email,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { success: true };
    } else {
      throw new Error('Web3Forms error');
    }
  } catch (error) {
    console.error('Contact form error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Erreur lors de l\'envoi'
    );
  }
});
```

#### Fichier: functions/.env.local

```
OPENAI_API_KEY=sk-...
WEB3FORMS_KEY=...
CONTACT_EMAIL=noevouillamoz3@gmail.com
```

#### Déploiement

```bash
firebase deploy --only functions
```

### Option 2: Vercel Serverless Functions

#### Fichier: api/parseMenu.js

```javascript
const OpenAI = require('openai').default;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optionnel: Vérifier le token Firebase en front
  const { idToken, texte } = req.body;

  // Valider l'input
  if (!texte || texte.length < 10 || texte.length > 5000) {
    return res.status(400).json({ error: 'Invalid input length' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2000,
      messages: [
        // ... system prompt
        { role: 'user', content: texte }
      ],
    });

    return res.status(200).json({
      success: true,
      data: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

## 📋 Checklist Migration

- [ ] Choisir Firebase Cloud Functions ou Vercel Functions
- [ ] Créer les fonctions côté backend
- [ ] Ajouter les clés API aux variables d'env du backend
- [ ] Mettre à jour le front pour appeler les Cloud Functions au lieu de l'API directe
- [ ] Tester les appels
- [ ] Déployer et valider
- [ ] Supprimer les clés API des variables d'env front (VITE_*)
- [ ] Documenter les limites de rate-limit

## 🔐 Bénéfices

✅ Clés API **100% secrètes**
✅ Rate limiting **enforced au serveur**
✅ Validation **serveur-side** (pas contournable)
✅ Logging **complet** pour débogage
✅ Quota **par utilisateur** contrôlable
✅ Coûts **prévisibles** (pas de facturation sauvage)
