import { useState } from 'react'
import { Smartphone, Monitor, RotateCcw, Sparkles, AlertTriangle, CheckCircle, Image } from 'lucide-react'

const channelPreviews = [
  { id: 'google', label: 'Google検索', type: 'search' },
  { id: 'instagram', label: 'Instagramフィード', type: 'feed' },
  { id: 'tiktok', label: 'TikTok', type: 'video' },
  { id: 'line', label: 'LINEトーク', type: 'message' },
]

const mockCopy = {
  google: {
    title: '【公式】Pal美容室｜駅徒歩3分・カット¥3,980〜',
    desc: '初回限定20%OFF。スタイリスト指名無料。今すぐ予約',
    url: 'pal-salon.com/reserve',
  },
  instagram: {
    text: '春の新メニュー解禁\nトレンドのレイヤーカット、始めてみませんか？',
    hashtags: '#美容室 #レイヤーカット #春ヘア #駅近サロン',
    cta: '予約する',
  },
  tiktok: {
    overlay: 'Before → After 変身動画',
    sound: '♪ トレンドBGM自動付与',
    cta: '詳しく見る',
  },
  line: {
    message: 'Pal美容室です。今月限定クーポンをお届け！',
    coupon: 'カット+カラー ¥7,980（通常¥12,000）',
    cta: '友だち追加',
  },
}

export default function AdPreview() {
  const [activeChannel, setActiveChannel] = useState('google')
  const [checkResult, setCheckResult] = useState(null)

  const runCheck = () => {
    setCheckResult('checking')
    setTimeout(() => setCheckResult('pass'), 1200)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Channel tabs */}
      <div className="flex border-b border-gray-200 bg-white px-2">
        {channelPreviews.map((c) => (
          <button
            key={c.id}
            onClick={() => { setActiveChannel(c.id); setCheckResult(null) }}
            className={`px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
              activeChannel === c.id
                ? 'text-[#F39800] border-b-2 border-[#F39800]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-xs">
          {/* Phone frame */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Phone status bar */}
            <div className="bg-gray-900 text-white text-xs px-4 py-1.5 flex justify-between">
              <span>9:41</span>
              <div className="flex gap-1">
                <div className="w-3.5 h-2 border border-white rounded-sm">
                  <div className="w-2/3 h-full bg-white rounded-sm" />
                </div>
              </div>
            </div>

            {/* Content based on channel */}
            <div className="min-h-[350px]">
              {activeChannel === 'google' && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 bg-gray-100 rounded-full px-3 py-2 text-xs text-gray-500">
                      美容室 近く
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">スポンサー</div>
                  <div className="border border-gray-100 rounded-lg p-3">
                    <p className="text-xs text-green-700 mb-0.5">{mockCopy.google.url}</p>
                    <p className="text-sm font-bold text-blue-800 mb-1">{mockCopy.google.title}</p>
                    <p className="text-xs text-gray-600">{mockCopy.google.desc}</p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-3 opacity-40">
                    <p className="text-xs text-green-700 mb-0.5">other-salon.com</p>
                    <p className="text-sm font-medium text-blue-800 mb-1">他のサロン｜駅前の美容室</p>
                    <p className="text-xs text-gray-600">カット＆カラーが人気の…</p>
                  </div>
                </div>
              )}

              {activeChannel === 'instagram' && (
                <div>
                  <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F39800] to-[#E1306C]" />
                    <div>
                      <p className="text-xs font-bold">pal_salon</p>
                      <p className="text-xs text-gray-400">スポンサー</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-[#FFF3E0] to-[#FCE4EC] h-52 flex items-center justify-center">
                    <div className="text-center">
                      <Image className="w-10 h-10 text-[#F39800]/40 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Pal-Video連携動画</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs whitespace-pre-line">{mockCopy.instagram.text}</p>
                    <p className="text-xs text-blue-500 mt-1">{mockCopy.instagram.hashtags}</p>
                    <button className="mt-2 w-full bg-[#E1306C] text-white text-xs py-2 rounded-lg font-medium">
                      {mockCopy.instagram.cta}
                    </button>
                  </div>
                </div>
              )}

              {activeChannel === 'tiktok' && (
                <div className="bg-black h-[350px] relative flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                      <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1" />
                    </div>
                    <p className="text-white text-xs">{mockCopy.tiktok.overlay}</p>
                    <p className="text-white/50 text-xs mt-1">{mockCopy.tiktok.sound}</p>
                  </div>
                  {/* TikTok right sidebar */}
                  <div className="absolute right-3 bottom-16 flex flex-col items-center gap-4">
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-full bg-white/20" />
                      <p className="text-white text-xs mt-1">♡</p>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-full bg-white/20" />
                      <p className="text-white text-xs mt-1">💬</p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-3 right-14">
                    <p className="text-white text-xs font-bold">@pal_salon</p>
                    <button className="mt-2 bg-[#FE2C55] text-white text-xs py-1.5 px-4 rounded font-medium">
                      {mockCopy.tiktok.cta}
                    </button>
                  </div>
                </div>
              )}

              {activeChannel === 'line' && (
                <div className="bg-[#7494C0] min-h-[350px] p-4">
                  <div className="flex gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#F39800] flex-shrink-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <div>
                      <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 max-w-[200px]">
                        <p className="text-xs">{mockCopy.line.message}</p>
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 max-w-[200px] mt-1">
                        <p className="text-xs font-bold text-[#F39800]">{mockCopy.line.coupon}</p>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <p className="text-xs text-[#06C755] font-medium text-center">{mockCopy.line.cta}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Check bar */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {checkResult === 'pass' && (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600 font-medium">規約チェックOK・文字切れなし</span>
            </>
          )}
          {checkResult === 'checking' && (
            <>
              <RotateCcw className="w-4 h-4 text-[#F39800] animate-spin" />
              <span className="text-xs text-[#F39800]">チェック中...</span>
            </>
          )}
          {!checkResult && (
            <span className="text-xs text-gray-400">配信前に映えチェックを実行できます</span>
          )}
        </div>
        <button
          onClick={runCheck}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#FFF3E0] text-[#F39800] rounded-lg text-xs font-medium hover:bg-[#FFE0B2] transition-colors cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          映えチェック
        </button>
      </div>
    </div>
  )
}
