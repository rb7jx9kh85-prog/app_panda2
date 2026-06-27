// ─────────────────────────────────────────────────────────────
// Page /admin — layout sidebar + zone principale (protégée)
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import MenuInput from '../components/MenuInput'
import FichesGrid from '../components/FichesGrid'
import PublishBar from '../components/PublishBar'
import HistoriqueList from '../components/HistoriqueList'
import { useMenu } from '../hooks/useMenu'

export default function Admin() {
  const [onglet, setOnglet] = useState('semaine') // 'semaine' | 'historique'
  const [texte, setTexte] = useState('')

  const {
    menu,
    setMenu,
    analyse,
    publication,
    confirmation,
    erreur,
    analyser,
    publier,
    reset,
  } = useMenu()

  // Lance l'analyse IA
  async function handleAnalyser() {
    await analyser(texte)
  }

  // Réinitialise le formulaire pour un nouveau menu
  function handleNouveau() {
    reset()
    setTexte('')
  }

  return (
    <div className="min-h-screen">
      <Sidebar ongletActif={onglet} setOngletActif={setOnglet} />

      {/* Zone principale — décalée de la sidebar sur md+ */}
      <main className="md:ml-[240px]">
        <div className="mx-auto max-w-5xl px-4 py-8 pb-28 md:px-8 md:pb-12">
          {onglet === 'semaine' ? (
            <div className="flex flex-col gap-8">
              {/* BLOC 1 — Input */}
              <MenuInput
                texte={texte}
                setTexte={setTexte}
                onAnalyser={handleAnalyser}
                analyse={analyse}
              />

              {/* Message d'erreur global (analyse / publication) */}
              {erreur && (
                <div className="flex justify-center">
                  <span className="badge-erreur">
                    <AlertCircle size={14} />
                    {erreur}
                  </span>
                </div>
              )}

              {/* BLOC 2 — Preview des fiches (après analyse) */}
              {menu && !confirmation && (
                <>
                  <FichesGrid menu={menu} setMenu={setMenu} />
                  <PublishBar
                    onPublier={() => publier()}
                    publication={publication}
                    confirmation={null}
                  />
                </>
              )}

              {/* BLOC 3 — Confirmation (après publication) */}
              {confirmation && (
                <PublishBar
                  confirmation={confirmation}
                  onNouveau={handleNouveau}
                />
              )}
            </div>
          ) : (
            <HistoriqueList />
          )}
        </div>
      </main>
    </div>
  )
}
