import { PenTool, Sparkles, Share2 } from 'lucide-react'
import { useState } from 'react'

export default function ActionBar() {
  const [showCreateMenu, setShowCreateMenu] = useState(false)

  const createOptions = [
    'クーポン',
    '新メニュー告知',
    '休業案内',
    'イベント告知',
    'キャンペーン',
    'お知らせ',
  ]

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-3">
      {/* 作るボタン */}
      <div className="relative">
        <button
          onClick={() => setShowCreateMenu(!showCreateMenu)}
          className="flex items-center gap-2 bg-[#8CC63F] hover:bg-[#6ba02e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <PenTool className="w-4 h-4" />
          作る
        </button>
        {showCreateMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 z-50">
            <p className="px-4 py-1 text-xs text-gray-400">今日は何を告知しますか？</p>
            {createOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setShowCreateMenu(false)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f4fae8] hover:text-[#6ba02e] transition-colors cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AIに任せるボタン */}
      <button className="flex items-center gap-2 bg-gradient-to-r from-[#8CC63F] to-[#6ba02e] hover:from-[#6ba02e] hover:to-[#4a7a1e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer">
        <Sparkles className="w-4 h-4" />
        AIに任せる
      </button>

      {/* 反映するボタン */}
      <button className="flex items-center gap-2 border-2 border-[#8CC63F] text-[#6ba02e] hover:bg-[#f4fae8] px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer">
        <Share2 className="w-4 h-4" />
        反映する
      </button>

      <span className="text-xs text-gray-400 ml-auto">
        写真1枚 + 一言で、バナー&テキストが3パターン生成
      </span>
    </div>
  )
}
