import { useState } from 'react'
import { ImageIcon, Upload, Palette, Square, RectangleHorizontal } from 'lucide-react'

const COLOR_PALETTES = [
  { name: 'ナチュラル', colors: ['#8CC63F', '#F5E6CA', '#4A7A1E', '#FFF8ED'] },
  { name: 'ポップ', colors: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FFFFFF'] },
  { name: 'エレガント', colors: ['#2C3E50', '#C0A062', '#ECF0F1', '#1A1A2E'] },
  { name: 'クール', colors: ['#667EEA', '#764BA2', '#F093FB', '#FFFFFF'] },
  { name: 'ウォーム', colors: ['#FF6B35', '#F7C59F', '#EFEFD0', '#004E89'] },
]

const TEMPLATES = [
  { id: 'sale', label: 'セール告知', emoji: 'tag' },
  { id: 'newmenu', label: '新メニュー', emoji: 'sparkles' },
  { id: 'event', label: 'イベント', emoji: 'calendar' },
  { id: 'seasonal', label: '季節限定', emoji: 'leaf' },
  { id: 'info', label: 'お知らせ', emoji: 'bell' },
]

export default function BannerCanvas() {
  const [format, setFormat] = useState('square')
  const [selectedPalette, setSelectedPalette] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState('sale')
  const [headline, setHeadline] = useState('')
  const [subtext, setSubtext] = useState('')
  const [uploaded, setUploaded] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#f4fae8] flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-[#8CC63F]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">バナー画像自動キャンバス</h2>
          <p className="text-xs text-gray-500">店舗写真1枚から「映える」バナーを自動生成</p>
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">店舗写真をアップロード</label>
        <div
          onClick={() => setUploaded(true)}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            uploaded
              ? 'border-[#8CC63F] bg-[#f4fae8]'
              : 'border-gray-300 hover:border-[#a8d96a] bg-white'
          }`}
        >
          <Upload className={`w-8 h-8 mx-auto mb-2 ${uploaded ? 'text-[#8CC63F]' : 'text-gray-400'}`} />
          <p className={`text-sm ${uploaded ? 'text-[#6ba02e] font-medium' : 'text-gray-500'}`}>
            {uploaded ? '写真がアップロードされました' : 'クリックまたはドラッグ&ドロップ'}
          </p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG 推奨</p>
        </div>
      </div>

      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">サイズ・フォーマット</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFormat('square')}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              format === 'square'
                ? 'bg-[#8CC63F] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#8CC63F]'
            }`}
          >
            <Square className="w-4 h-4" />
            正方形（GBP投稿用）
          </button>
          <button
            onClick={() => setFormat('wide')}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              format === 'wide'
                ? 'bg-[#8CC63F] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#8CC63F]'
            }`}
          >
            <RectangleHorizontal className="w-4 h-4" />
            横長（LINEリッチメッセージ）
          </button>
        </div>
      </div>

      {/* Template Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">テンプレート</label>
        <div className="flex gap-2 flex-wrap">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedTemplate === t.id
                  ? 'bg-[#8CC63F] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#8CC63F]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Palette className="w-4 h-4 inline mr-1" />
          カラーパレット
        </label>
        <div className="space-y-2">
          {COLOR_PALETTES.map((palette, i) => (
            <button
              key={i}
              onClick={() => setSelectedPalette(i)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer ${
                selectedPalette === i
                  ? 'bg-[#f4fae8] border-2 border-[#8CC63F]'
                  : 'bg-white border border-gray-200 hover:border-[#a8d96a]'
              }`}
            >
              <span className="text-xs font-medium text-gray-700 w-20 text-left">{palette.name}</span>
              <div className="flex gap-1 flex-1">
                {palette.colors.map((color, j) => (
                  <div
                    key={j}
                    className="w-8 h-8 rounded-md border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Text Inputs */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">見出し</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="例：いちごフェア開催中！"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#8CC63F] focus:ring-1 focus:ring-[#8CC63F]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">サブテキスト</label>
          <input
            type="text"
            value={subtext}
            onChange={(e) => setSubtext(e.target.value)}
            placeholder="例：期間限定 3/1〜3/31"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#8CC63F] focus:ring-1 focus:ring-[#8CC63F]"
          />
        </div>
      </div>

      {/* Generate */}
      <button className="w-full bg-gradient-to-r from-[#8CC63F] to-[#6ba02e] hover:from-[#6ba02e] hover:to-[#4a7a1e] text-white py-3 rounded-lg text-sm font-medium transition-all cursor-pointer">
        バナーを生成する
      </button>
    </div>
  )
}
