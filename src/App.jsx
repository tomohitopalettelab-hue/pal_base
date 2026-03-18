import { useState } from 'react'
import Header from './components/Header'
import CouponGenerator from './components/CouponGenerator'
import BannerCanvas from './components/BannerCanvas'
import RichMenuBuilder from './components/RichMenuBuilder'
import GbpProfileBuilder from './components/GbpProfileBuilder'
import PreviewPanel from './components/PreviewPanel'
import ActionBar from './components/ActionBar'

function App() {
  const [activeSection, setActiveSection] = useState('coupon')
  const [previewMode, setPreviewMode] = useState('gbp')

  const sections = [
    { id: 'coupon', label: 'クーポン・ジェネレーター', icon: 'ticket' },
    { id: 'banner', label: 'バナー画像キャンバス', icon: 'image' },
    { id: 'richmenu', label: 'リッチメニュー・ビルダー', icon: 'layout' },
    { id: 'gbp', label: 'GBPプロフィール構成', icon: 'map-pin' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ActionBar />
      <div className="flex-1 flex">
        {/* Left Panel */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          {/* Section Tabs */}
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

          {/* Section Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeSection === 'coupon' && <CouponGenerator />}
            {activeSection === 'banner' && <BannerCanvas />}
            {activeSection === 'richmenu' && <RichMenuBuilder />}
            {activeSection === 'gbp' && <GbpProfileBuilder />}
          </div>
        </div>

        {/* Right Panel - Preview */}
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
          <div className="flex-1 overflow-y-auto p-4">
            <PreviewPanel mode={previewMode} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
