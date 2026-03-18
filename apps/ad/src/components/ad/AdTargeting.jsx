import { useState } from 'react'
import { MapPin, Users, Sliders, Check } from 'lucide-react'

const personaPresets = [
  { id: 'housewife', label: '主婦層', age: '30-50代', gender: '女性中心', interests: '子育て・料理・お得情報', icon: '🏠' },
  { id: 'salary', label: 'サラリーマン', age: '25-50代', gender: '男性中心', interests: 'ランチ・飲み会・転職', icon: '👔' },
  { id: 'genz', label: 'Z世代', age: '18-25歳', gender: '男女', interests: 'トレンド・SNS・カフェ', icon: '📱' },
  { id: 'senior', label: 'シニア層', age: '60代以上', gender: '男女', interests: '健康・旅行・趣味', icon: '🌿' },
  { id: 'jobseeker', label: '求職者', age: '18-40代', gender: '男女', interests: '求人・スキルアップ', icon: '💼' },
  { id: 'family', label: 'ファミリー層', age: '30-40代', gender: '男女', interests: '子連れ・週末・イベント', icon: '👨‍👩‍👧‍👦' },
]

export default function AdTargeting() {
  const [radius, setRadius] = useState(5)
  const [selectedPersonas, setSelectedPersonas] = useState(['housewife', 'salary'])

  const togglePersona = (id) => {
    setSelectedPersonas((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const radiusScale = [1, 3, 5, 10, 15, 20, 30]

  return (
    <div className="space-y-6">
      {/* Circle targeting */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-[#F39800]" />
          <h4 className="text-sm font-bold text-gray-800">エリアターゲティング</h4>
        </div>

        {/* Map mockup */}
        <div className="relative bg-gray-100 rounded-xl h-48 overflow-hidden mb-3">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e8f0e0] to-[#d4e4c8]">
            {/* Grid lines to simulate map */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(8)].map((_, i) => (
                <div key={`h${i}`} className="absolute w-full h-px bg-gray-400" style={{ top: `${(i + 1) * 12.5}%` }} />
              ))}
              {[...Array(12)].map((_, i) => (
                <div key={`v${i}`} className="absolute h-full w-px bg-gray-400" style={{ left: `${(i + 1) * 8.33}%` }} />
              ))}
            </div>

            {/* Radius circle */}
            <div
              className="absolute rounded-full border-2 border-[#F39800] bg-[#F39800]/10 transition-all duration-300"
              style={{
                width: `${Math.min(radius * 8 + 30, 90)}%`,
                height: `${Math.min(radius * 8 + 30, 90)}%`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />

            {/* Store pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#F39800] flex items-center justify-center shadow-lg">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="mt-1 bg-white px-2 py-0.5 rounded text-xs font-bold text-gray-700 shadow-sm">
                あなたの店舗
              </div>
            </div>
          </div>
        </div>

        {/* Radius slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">配信半径</span>
            <span className="text-sm font-bold text-[#F39800]">{radius}km</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full accent-[#F39800]"
          />
          <div className="flex justify-between text-xs text-gray-300 mt-0.5">
            {radiusScale.map((r) => (
              <span key={r} className={r === radius ? 'text-[#F39800] font-bold' : ''}>{r}km</span>
            ))}
          </div>
        </div>
      </div>

      {/* Persona presets */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-[#F39800]" />
          <h4 className="text-sm font-bold text-gray-800">ターゲット・ペルソナ</h4>
          <span className="text-xs text-gray-400 ml-1">タグを選ぶだけ</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {personaPresets.map((p) => {
            const selected = selectedPersonas.includes(p.id)
            return (
              <button
                key={p.id}
                onClick={() => togglePersona(p.id)}
                className={`relative p-3 rounded-xl border-2 transition-all text-left cursor-pointer ${
                  selected
                    ? 'border-[#F39800] bg-[#FFF8F0]'
                    : 'border-gray-200 hover:border-[#F39800]/30'
                }`}
              >
                {selected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#F39800] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-sm font-bold text-gray-800">{p.label}</span>
                </div>
                <div className="space-y-0.5 text-xs text-gray-400">
                  <p>{p.age}・{p.gender}</p>
                  <p className="text-[#F39800]">{p.interests}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Auto-set note */}
      <div className="bg-[#FFF8F0] rounded-lg p-3 border border-[#F39800]/10">
        <div className="flex items-start gap-2">
          <Sliders className="w-4 h-4 text-[#F39800] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500 leading-relaxed">
            選択したペルソナに基づき、年齢・性別・興味関心を各媒体に最適化して自動セットします。
            細かい調整はAIが配信データを元に継続的に行います。
          </p>
        </div>
      </div>
    </div>
  )
}
