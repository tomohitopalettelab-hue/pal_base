import { useState } from 'react'
import { Target, Share2, DollarSign, ChevronRight, ChevronLeft, Zap, Users, UserPlus, MapPin, Check } from 'lucide-react'

const goals = [
  { id: 'visit', label: '来店を増やす', desc: '近隣のお客様を店舗に誘導', icon: MapPin },
  { id: 'friends', label: '友だちを増やす', desc: 'LINE友だち・フォロワー獲得', icon: Users },
  { id: 'recruit', label: 'スタッフを募集する', desc: '求人・採用広告を配信', icon: UserPlus },
]

const channels = [
  { id: 'google', label: 'Google検索/マップ', desc: '「今、近くで探している」層', color: '#4285F4', formats: 'リスティング・ピン強調' },
  { id: 'instagram', label: 'Instagram / FB', desc: '「ビジュアルで欲しくなる」層', color: '#E1306C', formats: 'フィード・リール動画' },
  { id: 'tiktok', label: 'TikTok', desc: '流行に敏感な若年層・爆発力', color: '#000000', formats: '縦型フルスクリーン動画' },
  { id: 'x', label: 'X (Twitter)', desc: 'リアルタイム性・二次拡散', color: '#1DA1F2', formats: 'プロモポスト' },
  { id: 'youtube', label: 'YouTube', desc: 'テレビ代わりの視聴・高認知', color: '#FF0000', formats: 'インストリーム動画' },
  { id: 'indeed', label: 'Indeed / 求人BOX', desc: '「仕事を探している」層', color: '#2164F3', formats: '採用テキスト・バナー' },
  { id: 'line', label: 'LINE広告', desc: '全世代の生活動線', color: '#06C755', formats: 'トークリスト・ニュース' },
]

const budgetPresets = [
  { amount: 30000, label: '3万円', desc: 'お試しプラン' },
  { amount: 50000, label: '5万円', desc: 'スタンダード' },
  { amount: 100000, label: '10万円', desc: 'しっかり集客' },
  { amount: 300000, label: '30万円', desc: '本気モード' },
]

const periods = [
  { days: 7, label: '1週間' },
  { days: 14, label: '2週間' },
  { days: 30, label: '1ヶ月' },
  { days: 60, label: '2ヶ月' },
]

export default function AdWizard({ onComplete }) {
  const [step, setStep] = useState(1)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [selectedChannels, setSelectedChannels] = useState([])
  const [budget, setBudget] = useState(50000)
  const [period, setPeriod] = useState(30)

  const toggleChannel = (id) => {
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const canNext = () => {
    if (step === 1) return selectedGoal !== null
    if (step === 2) return selectedChannels.length > 0
    return true
  }

  const handleComplete = () => {
    onComplete({
      goal: selectedGoal,
      channels: selectedChannels,
      budget,
      period,
    })
  }

  const stepLabels = [
    { num: 1, label: '何のために？', sub: 'Goal' },
    { num: 2, label: 'どこに？', sub: 'Channel' },
    { num: 3, label: 'いくらで？', sub: 'Budget' },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 py-4 px-6 border-b border-gray-100">
        {stepLabels.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                step === s.num
                  ? 'bg-[#F39800] text-white'
                  : step > s.num
                    ? 'bg-[#FFF3E0] text-[#F39800]'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step > s.num ? <Check className="w-3 h-3" /> : <span>{s.num}</span>}
              <span>{s.label}</span>
            </div>
            {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-1">広告の目的を選んでください</h3>
              <p className="text-xs text-gray-400">ゴールに合わせてAIが最適な配信設定を提案します</p>
            </div>
            <div className="grid gap-3">
              {goals.map((g) => {
                const Icon = g.icon
                const selected = selectedGoal === g.id
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGoal(g.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                      selected
                        ? 'border-[#F39800] bg-[#FFF8F0] shadow-sm'
                        : 'border-gray-200 hover:border-[#F39800]/40 hover:bg-[#FFFAF5]'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selected ? 'bg-[#F39800]' : 'bg-gray-100'}`}>
                      <Icon className={`w-6 h-6 ${selected ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className={`font-bold ${selected ? 'text-[#D47F00]' : 'text-gray-700'}`}>{g.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{g.desc}</p>
                    </div>
                    {selected && (
                      <div className="ml-auto">
                        <Check className="w-5 h-5 text-[#F39800]" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Channels */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-1">配信先を選んでください</h3>
              <p className="text-xs text-gray-400">複数選択OK。AIが予算を最適配分します</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {channels
                .filter((c) => {
                  if (selectedGoal === 'recruit') return ['google', 'instagram', 'indeed', 'line'].includes(c.id)
                  return c.id !== 'indeed'
                })
                .map((c) => {
                  const selected = selectedChannels.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleChannel(c.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                        selected
                          ? 'border-[#F39800] bg-[#FFF8F0] shadow-sm'
                          : 'border-gray-200 hover:border-[#F39800]/40'
                      }`}
                    >
                      {selected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#F39800] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: c.color }} />
                      <p className="font-bold text-sm text-gray-800">{c.label}</p>
                      <p className="text-xs text-gray-400 mt-1">{c.desc}</p>
                      <p className="text-xs text-[#F39800] mt-1.5 font-medium">{c.formats}</p>
                    </button>
                  )
                })}
            </div>
          </div>
        )}

        {/* Step 3: Budget */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-1">予算と期間を設定</h3>
              <p className="text-xs text-gray-400">Paletteウォレットから自動引き落とし。各媒体へ最適配分。</p>
            </div>

            {/* Budget presets */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">月間広告予算</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {budgetPresets.map((p) => (
                  <button
                    key={p.amount}
                    onClick={() => setBudget(p.amount)}
                    className={`py-2.5 px-3 rounded-lg text-center transition-all cursor-pointer ${
                      budget === p.amount
                        ? 'bg-[#F39800] text-white font-bold'
                        : 'bg-gray-100 text-gray-600 hover:bg-[#FFF3E0] hover:text-[#F39800]'
                    }`}
                  >
                    <p className="text-sm font-bold">{p.label}</p>
                    <p className={`text-xs mt-0.5 ${budget === p.amount ? 'text-white/80' : 'text-gray-400'}`}>{p.desc}</p>
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={10000}
                max={500000}
                step={5000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-[#F39800]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1万円</span>
                <span className="text-[#F39800] font-bold text-sm">{(budget / 10000).toFixed(budget % 10000 === 0 ? 0 : 1)}万円 / 月</span>
                <span>50万円</span>
              </div>
            </div>

            {/* Period */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">配信期間</label>
              <div className="grid grid-cols-4 gap-2">
                {periods.map((p) => (
                  <button
                    key={p.days}
                    onClick={() => setPeriod(p.days)}
                    className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      period === p.days
                        ? 'bg-[#F39800] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-[#FFF3E0]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-gradient-to-br from-[#FFF8F0] to-[#FFF3E0] rounded-xl p-4 border border-[#F39800]/20">
              <p className="text-xs text-[#D47F00] font-medium mb-2">配信サマリー</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">配信チャネル</p>
                  <p className="font-bold text-gray-800">{selectedChannels.length}媒体</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">1媒体あたり</p>
                  <p className="font-bold text-gray-800">
                    約{Math.round(budget / selectedChannels.length / 10000 * 10) / 10}万円
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">1日あたり</p>
                  <p className="font-bold text-gray-800">
                    約{Math.round(budget / period).toLocaleString()}円
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">総予算</p>
                  <p className="font-bold text-[#F39800] text-lg">
                    {budget.toLocaleString()}円
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="border-t border-gray-100 p-4 flex items-center justify-between bg-white">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            戻る
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={() => canNext() && setStep(step + 1)}
            disabled={!canNext()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              canNext()
                ? 'bg-[#F39800] hover:bg-[#D47F00] text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            次へ
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 bg-gradient-to-r from-[#F39800] to-[#D47F00] hover:from-[#D47F00] hover:to-[#B36700] text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer shadow-lg shadow-[#F39800]/20"
          >
            <Zap className="w-4 h-4" />
            配信スタート
          </button>
        )}
      </div>
    </div>
  )
}
