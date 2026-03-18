import { useState } from 'react'
import {
  LayoutGrid, CalendarDays, Gift, MapPin, Menu as MenuIcon,
  Clock, Phone, Star, BookOpen, ShoppingBag, MessageCircle, ExternalLink
} from 'lucide-react'

const ICON_OPTIONS = [
  { id: 'reservation', label: '予約', icon: CalendarDays },
  { id: 'menu', label: 'メニュー', icon: BookOpen },
  { id: 'access', label: 'アクセス', icon: MapPin },
  { id: 'coupon', label: 'クーポン', icon: Gift },
  { id: 'hours', label: '営業時間', icon: Clock },
  { id: 'phone', label: '電話', icon: Phone },
  { id: 'review', label: '口コミ', icon: Star },
  { id: 'shop', label: 'ショップ', icon: ShoppingBag },
  { id: 'chat', label: 'トーク', icon: MessageCircle },
  { id: 'link', label: '外部リンク', icon: ExternalLink },
]

const SEASON_THEMES = [
  { id: 'spring', label: '春', color: '#FFB7C5' },
  { id: 'summer', label: '夏', color: '#87CEEB' },
  { id: 'autumn', label: '秋', color: '#DBA463' },
  { id: 'winter', label: '冬', color: '#B0C4DE' },
  { id: 'newyear', label: '新年', color: '#FF4444' },
  { id: 'christmas', label: 'クリスマス', color: '#228B22' },
]

const LAYOUT_OPTIONS = [
  { id: '2x3', label: '2x3 (6区画)', rows: 2, cols: 3 },
  { id: '1x3', label: '1x3 (3区画)', rows: 1, cols: 3 },
  { id: '2x2', label: '2x2 (4区画)', rows: 2, cols: 2 },
]

export default function RichMenuBuilder() {
  const [layout, setLayout] = useState('2x3')
  const [season, setSeason] = useState('spring')
  const [menuItems, setMenuItems] = useState([
    'reservation', 'menu', 'access', 'coupon', 'hours', 'phone',
  ])

  const currentLayout = LAYOUT_OPTIONS.find((l) => l.id === layout)
  const totalSlots = currentLayout.rows * currentLayout.cols

  const handleSlotChange = (index, iconId) => {
    const updated = [...menuItems]
    updated[index] = iconId
    setMenuItems(updated)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#f4fae8] flex items-center justify-center">
          <LayoutGrid className="w-5 h-5 text-[#8CC63F]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">リッチメニュー「着せ替え」ビルダー</h2>
          <p className="text-xs text-gray-500">季節やキャンペーンに合わせて一瞬で作り変え</p>
        </div>
      </div>

      {/* Layout Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">レイアウト</label>
        <div className="grid grid-cols-3 gap-2">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setLayout(opt.id)}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                layout === opt.id
                  ? 'bg-[#8CC63F] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#8CC63F]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Season Theme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">シーズンテーマ</label>
        <div className="flex gap-2 flex-wrap">
          {SEASON_THEMES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSeason(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                season === s.id
                  ? 'ring-2 ring-[#8CC63F] bg-white'
                  : 'bg-white border border-gray-200 hover:border-[#8CC63F]'
              }`}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">メニュー構成</label>
        <div
          className="grid gap-2 bg-white border border-gray-200 rounded-xl p-3"
          style={{
            gridTemplateColumns: `repeat(${currentLayout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${currentLayout.rows}, 1fr)`,
          }}
        >
          {Array.from({ length: totalSlots }).map((_, index) => {
            const iconId = menuItems[index] || 'reservation'
            const iconData = ICON_OPTIONS.find((i) => i.id === iconId)
            const IconComponent = iconData?.icon || CalendarDays
            return (
              <div key={index} className="relative group">
                <div className="bg-[#f4fae8] rounded-lg p-3 flex flex-col items-center justify-center gap-1 min-h-[60px]">
                  <IconComponent className="w-5 h-5 text-[#6ba02e]" />
                  <span className="text-[10px] text-gray-600 font-medium">{iconData?.label}</span>
                </div>
                <select
                  value={iconId}
                  onChange={(e) => handleSlotChange(index, e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-1">各区画をクリックしてアイコンを変更できます</p>
      </div>

      {/* Generate */}
      <button className="w-full bg-gradient-to-r from-[#8CC63F] to-[#6ba02e] hover:from-[#6ba02e] hover:to-[#4a7a1e] text-white py-3 rounded-lg text-sm font-medium transition-all cursor-pointer">
        リッチメニューを生成する
      </button>
    </div>
  )
}
