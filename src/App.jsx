import { useState } from 'react'
import Header from './components/Header'
import CouponGenerator from './components/CouponGenerator'
import BannerCanvas from './components/BannerCanvas'
import RichMenuBuilder from './components/RichMenuBuilder'
import GbpProfileBuilder from './components/GbpProfileBuilder'
import PreviewPanel from './components/PreviewPanel'
import ActionBar from './components/ActionBar'
import AdWizard from './components/ad/AdWizard'
import AdDashboard from './components/ad/AdDashboard'
import AdTargeting from './components/ad/AdTargeting'
import AdPreview from './components/ad/AdPreview'
import { Leaf, Megaphone } from 'lucide-react'

function App() {
  const [activeService, setActiveService] = useState('base')
  const [activeSection, setActiveSection] = useState('coupon')
  const [previewMode, setPreviewMode] = useState('gbp')

  // Pal-Ad state
  const [adView, setAdView] = useState('wizard') // wizard | dashboard
  const [adLeftTab, setAdLeftTab] = useState('campaign') // campaign | targeting
  const [campaign, setCampaign] = useState(null)

  const sections = [
    { id: 'coupon', label: 'クーポン・ジェネレーター', icon: 'ticket' },
    { id: 'banner', label: 'バナー画像キャンバス', icon: 'image' },
    { id: 'richmenu', label: 'リッチメニュー・ビルダー', icon: 'layout' },
    { id: 'gbp', label: 'GBPプロフィール構成', icon: 'map-pin' },
  ]

  const handleAdComplete = (data) => {
    setCampaign(data)
    setAdView('dashboard')
  }

  const services = [
    { id: 'base', label: 'Pal-Base', desc: '制作・構築', color: '#8CC63F', darkColor: '#6ba02e', bgColor: '#f4fae8', icon: Leaf },
    { id: 'ad', label: 'Pal-Ad', desc: '集客加速', color: '#F39800', darkColor: '#D47F00', bgColor: '#FFF3E0', icon: Megaphone },
  ]

  const active = services.find((s) => s.id === activeService)

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Service header with switcher */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: active.color }}>
            <active.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{active.label}</h1>
            <p className="text-xs text-gray-500">{active.desc}{activeService === 'base' ? '特化型エンジン' : 'エンジン — 広告代理店をポケットに'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Service switcher */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {services.map((s) => {
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveService(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    activeService === s.id
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" style={activeService === s.id ? { color: s.color } : {}} />
                  {s.label}
                </button>
              )
            })}
          </div>
          <span className="text-xs text-gray-400 px-3 py-1 rounded-full" style={{ backgroundColor: active.bgColor }}>
            {activeService === 'base' ? 'センス不要。5分でプロの販促物。' : '専門知識不要。全媒体をAIがハック。'}
          </span>
        </div>
      </header>

      {/* Pal-Base view */}
      {activeService === 'base' && (
        <>
          <ActionBar />
          <div className="flex-1 flex">
            <div className="w-1/2 border-r border-gray-200 flex flex-col">
              <div className="flex border-b border-gray-200 bg-white">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`flex-1 py-3 px-2 text-xs font-medium transition-colors cursor-pointer ${
                      activeSection === s.id
                        ? 'text-[#6ba02e] border-b-2 border-[#8CC63F] bg-[#f4fae8]'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {activeSection === 'coupon' && <CouponGenerator />}
                {activeSection === 'banner' && <BannerCanvas />}
                {activeSection === 'richmenu' && <RichMenuBuilder />}
                {activeSection === 'gbp' && <GbpProfileBuilder />}
              </div>
            </div>
            <div className="w-1/2 flex flex-col bg-gray-50">
              <div className="flex border-b border-gray-200 bg-white">
                <button
                  onClick={() => setPreviewMode('gbp')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors cursor-pointer ${
                    previewMode === 'gbp'
                      ? 'text-[#6ba02e] border-b-2 border-[#8CC63F] bg-[#f4fae8]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  GBP プレビュー
                </button>
                <button
                  onClick={() => setPreviewMode('line')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors cursor-pointer ${
                    previewMode === 'line'
                      ? 'text-[#6ba02e] border-b-2 border-[#8CC63F] bg-[#f4fae8]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  LINE プレビュー
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <PreviewPanel mode={previewMode} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pal-Ad view */}
      {activeService === 'ad' && (
        <>
          {/* Ad action bar */}
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
        </>
      )}
    </div>
  )
}

export default App
