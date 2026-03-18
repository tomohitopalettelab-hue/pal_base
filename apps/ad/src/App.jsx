import { useState } from 'react'
import { Megaphone } from 'lucide-react'
import AdWizard from './components/ad/AdWizard'
import AdDashboard from './components/ad/AdDashboard'
import AdTargeting from './components/ad/AdTargeting'
import AdPreview from './components/ad/AdPreview'

function App() {
  const [adView, setAdView] = useState('wizard')
  const [adLeftTab, setAdLeftTab] = useState('campaign')
  const [campaign, setCampaign] = useState(null)

  const handleAdComplete = (data) => {
    setCampaign(data)
    setAdView('dashboard')
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F39800] flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Pal-Ad</h1>
            <p className="text-xs text-gray-500">集客加速エンジン — 広告代理店をポケットに</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 bg-[#FFF3E0] px-3 py-1 rounded-full">
            専門知識不要。全媒体をAIがハック。
          </span>
        </div>
      </header>

      {/* Action bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-3">
        {adView === 'dashboard' && (
          <>
            <button
              onClick={() => { setAdView('wizard'); setCampaign(null) }}
              className="flex items-center gap-2 bg-[#F39800] hover:bg-[#D47F00] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              新規キャンペーン
            </button>
            <span className="text-xs text-gray-400 ml-auto">
              3ステップで全媒体に配信。AIが予算を自動最適化。
            </span>
          </>
        )}
        {adView === 'wizard' && (
          <span className="text-xs text-gray-400">
            3つの質問に答えるだけ。広告配信をスタートしましょう。
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Left panel */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          {adView === 'wizard' ? (
            <AdWizard onComplete={handleAdComplete} />
          ) : (
            <>
              <div className="flex border-b border-gray-200 bg-white">
                <button
                  onClick={() => setAdLeftTab('campaign')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors cursor-pointer ${
                    adLeftTab === 'campaign'
                      ? 'text-[#D47F00] border-b-2 border-[#F39800] bg-[#FFF3E0]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  キャンペーン管理
                </button>
                <button
                  onClick={() => setAdLeftTab('targeting')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors cursor-pointer ${
                    adLeftTab === 'targeting'
                      ? 'text-[#D47F00] border-b-2 border-[#F39800] bg-[#FFF3E0]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ターゲット設定
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {adLeftTab === 'campaign' && <AdDashboard campaign={campaign} />}
                {adLeftTab === 'targeting' && (
                  <div className="p-4">
                    <AdTargeting />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right panel - Ad Preview */}
        <div className="w-1/2 flex flex-col bg-gray-50">
          <AdPreview />
        </div>
      </div>
    </div>
  )
}

export default App
