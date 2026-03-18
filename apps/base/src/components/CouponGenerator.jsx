import { useState } from 'react'
import { Ticket, ChevronDown, Sparkles, Copy, RefreshCw } from 'lucide-react'

const INDUSTRY_PRESETS = {
  restaurant: {
    label: '飲食店',
    presets: [
      { title: '雨の日限定・おつまみ1品無料', desc: '天候連動型クーポンで来店数を平準化' },
      { title: 'ランチ限定タイムセール', desc: '14時以降のアイドルタイム活用' },
      { title: '店長の気まぐれサービス', desc: '仕入れ状況に合わせた日替わり企画' },
    ],
  },
  beauty: {
    label: '美容室',
    presets: [
      { title: '平日14時までの隙間時間クーポン', desc: 'アイドルタイムの稼働率アップ' },
      { title: '次回予約で10%OFF', desc: 'リピート率を高める仕組み' },
      { title: 'お友達紹介で両者にプレゼント', desc: '口コミからの新規獲得' },
    ],
  },
  retail: {
    label: '小売・物販',
    presets: [
      { title: '今週末限定・まとめ買い割引', desc: '客単価アップの鉄板施策' },
      { title: '誕生月スペシャルクーポン', desc: 'CRM連動で特別感を演出' },
      { title: 'SNSフォローで即使える割引', desc: 'フォロワー獲得とのダブル効果' },
    ],
  },
  fitness: {
    label: 'フィットネス・ジム',
    presets: [
      { title: '体験レッスン無料', desc: '初回来館のハードルを下げる' },
      { title: '友人同伴で月会費割引', desc: '既存会員からの紹介促進' },
      { title: '朝活割・早朝利用で割引', desc: 'オフピーク利用の促進' },
    ],
  },
}

const SAMPLE_COPIES = [
  '【今日だけ】店長が仕入れすぎた〇〇を還元！',
  '【残り3時間】雨の日だけの裏メニュー解禁中',
  '【LINE限定】この通知を見せるだけ。何も言わなくてOK',
  '【緊急】明日で終了。まだ使ってない方、もったいないです',
]

export default function CouponGenerator() {
  const [industry, setIndustry] = useState('restaurant')
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [generatedCopies, setGeneratedCopies] = useState([])
  const [couponTitle, setCouponTitle] = useState('')
  const [couponDetail, setCouponDetail] = useState('')
  const [validDays, setValidDays] = useState(7)

  const handleGenerate = () => {
    const shuffled = [...SAMPLE_COPIES].sort(() => 0.5 - Math.random())
    setGeneratedCopies(shuffled.slice(0, 3))
  }

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset)
    setCouponTitle(preset.title)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#f4fae8] flex items-center justify-center">
          <Ticket className="w-5 h-5 text-[#8CC63F]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">「反響確約」クーポン・ジェネレーター</h2>
          <p className="text-xs text-gray-500">心理学に基づいた「今すぐ行かなきゃ」クーポンを自動生成</p>
        </div>
      </div>

      {/* Industry Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">業種を選択</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(INDUSTRY_PRESETS).map(([key, val]) => (
            <button
              key={key}
              onClick={() => { setIndustry(key); setSelectedPreset(null) }}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                industry === key
                  ? 'bg-[#8CC63F] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#8CC63F]'
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>
      </div>

      {/* Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          「勝てる企画」プリセット
        </label>
        <div className="space-y-2">
          {INDUSTRY_PRESETS[industry].presets.map((preset, i) => (
            <button
              key={i}
              onClick={() => handlePresetSelect(preset)}
              className={`w-full text-left p-3 rounded-lg transition-all cursor-pointer ${
                selectedPreset === preset
                  ? 'bg-[#f4fae8] border-2 border-[#8CC63F]'
                  : 'bg-white border border-gray-200 hover:border-[#a8d96a]'
              }`}
            >
              <p className="text-sm font-medium text-gray-800">{preset.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Coupon Details */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">クーポンタイトル</label>
          <input
            type="text"
            value={couponTitle}
            onChange={(e) => setCouponTitle(e.target.value)}
            placeholder="例：雨の日限定・おつまみ1品無料"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#8CC63F] focus:ring-1 focus:ring-[#8CC63F]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">詳細・条件</label>
          <textarea
            value={couponDetail}
            onChange={(e) => setCouponDetail(e.target.value)}
            placeholder="例：お会計から500円引き。他クーポン併用不可"
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#8CC63F] focus:ring-1 focus:ring-[#8CC63F] resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">有効期限</label>
          <select
            value={validDays}
            onChange={(e) => setValidDays(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#8CC63F] bg-white"
          >
            <option value={1}>今日限り</option>
            <option value={3}>3日間</option>
            <option value={7}>1週間</option>
            <option value={14}>2週間</option>
            <option value={30}>1ヶ月</option>
          </select>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#8CC63F] to-[#6ba02e] hover:from-[#6ba02e] hover:to-[#4a7a1e] text-white py-3 rounded-lg text-sm font-medium transition-all cursor-pointer"
      >
        <Sparkles className="w-4 h-4" />
        キャッチコピーをAI生成
      </button>

      {/* Generated Copies */}
      {generatedCopies.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">生成されたキャッチコピー</label>
            <button onClick={handleGenerate} className="text-xs text-[#6ba02e] hover:underline flex items-center gap-1 cursor-pointer">
              <RefreshCw className="w-3 h-3" /> 再生成
            </button>
          </div>
          {generatedCopies.map((copy, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-[#f4fae8] rounded-lg border border-[#a8d96a]/30"
            >
              <p className="text-sm font-medium text-gray-800">{copy}</p>
              <button className="text-gray-400 hover:text-[#6ba02e] ml-2 cursor-pointer">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
