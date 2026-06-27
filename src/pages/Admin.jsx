// ─────────────────────────────────────────────────────────────
// Page /admin — layout sidebar + zone principale
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import MenuInput from '../components/MenuInput'
import FichesGrid from '../components/FichesGrid'
import PublishBar from '../components/PublishBar'
import HistoriqueList from '../components/HistoriqueList'
import ContactForm from '../components/ContactForm'
import { useMenu } from '../hooks/useMenu'

export default function Admin() {
  // 'semaine' | 'historique' | 'contact'
  const [onglet, setOnglet] = useState('semaine')
  const [texte, setTexte]   = useState('')

  const { menu, analyse, publication, confirmation, erreur, analyser, publier, majMenu, reset } =
    useMenu()

  function handleNouveau() {
    reset()
    setTexte('')
  }

  return (
    <div className="min-h-screen">
      <Sidebar ongletActif={onglet} setOngletActif={setOnglet} />

      <main className="md:ml-[240px]">
        <div className="mx-auto max-w-5xl px-4 py-8 pb-28 md:px-8 md:pb-12">

          {onglet === 'semaine' ? (
            <div className="flex flex-col gap-8">

              {/* BLOC 1 — Saisie + analyse */}
              {!confirmation && (
                <MenuInput
                  texte={texte}
                  setTexte={setTexte}
                  onAnalyser={() => analyser(texte)}
                  analyse={analyse}
                />
              )}

              {/* Erreur globale */}
              {erreur && (
                <div className="flex justify-center">
                  <span className="badge-erreur">
                    <AlertCircle size={14} />
                    {erreur}
                  </span>
                </div>
              )}

              {/* BLOC 2 — Fiches + publication */}
              {menu && !confirmation && (
                <>
                  <FichesGrid menu={menu} setMenu={majMenu} />
                  <PublishBar onPublier={() => publier()} publication={publication} />
                </>
              )}

              {/* BLOC 3 — Confirmation */}
              {confirmation && (
                <PublishBar confirmation={confirmation} onNouveau={handleNouveau} />
              )}

            </div>
          ) : onglet === 'historique' ? (
            <HistoriqueList onRepublier={publier} />
          ) : (
            <ContactForm />
          )}

        </div>
      </main>
    </div>
  )
}
