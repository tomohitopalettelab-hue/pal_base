import {
  Star, MapPin, Clock, Phone, Navigation, MessageCircle,
  Image, ThumbsUp, Share2, Bookmark, ChevronRight,
  CalendarDays, BookOpen, Gift
} from 'lucide-react'

function GbpPreview() {
  return (
    <div className="max-w-sm mx-auto">
      {/* Google Maps Header */}
      <div className="bg-white rounded-t-xl border border-gray-200 overflow-hidden">
        {/* Map Placeholder */}
        <div className="h-40 bg-gradient-to-b from-[#e8f5e9] to-[#c8e6c9] flex items-center justify-center relative">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-xs text-gray-600 mt-1">Google Maps</p>
          </div>
        </div>

        {/* Business Info */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900">サンプル店舗名</h3>
          <div className="flex items-center gap-1 mt-1">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-600">4.2 (128件)</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">カフェ・コーヒーショップ</p>

          <div className="flex gap-3 mt-3">
            <button className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-500 text-white rounded-full text-xs font-medium">
              <Navigation className="w-3 h-3" /> 経路
            </button>
            <button className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-300 rounded-full text-xs font-medium text-gray-700">
              <Phone className="w-3 h-3" /> 通話
            </button>
            <button className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-300 rounded-full text-xs font-medium text-gray-700">
              <Bookmark className="w-3 h-3" /> 保存
            </button>
            <button className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-300 rounded-full text-xs font-medium text-gray-700">
              <Share2 className="w-3 h-3" /> 共有
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="border-t border-gray-100 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-green-600 font-medium">営業中</p>
              <p className="text-xs text-gray-500">10:00〜20:00</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">東京都渋谷区〇〇 1-2-3</p>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-600">03-1234-5678</p>
          </div>
        </div>

        {/* Posts Preview */}
        <div className="border-t border-gray-100 p-4">
          <h4 className="text-sm font-bold text-gray-900 mb-3">最新の投稿</h4>
          <div className="bg-[#f4fae8] rounded-lg p-3 border border-[#a8d96a]/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-[#8CC63F] rounded-full" />
              <span className="text-xs text-gray-500">1時間前</span>
            </div>
            <p className="text-sm text-gray-700">ここに作成したバナーやクーポン情報が反映されます</p>
            <div className="h-20 bg-gradient-to-r from-[#8CC63F]/20 to-[#6ba02e]/20 rounded-lg mt-2 flex items-center justify-center">
              <Image className="w-6 h-6 text-[#8CC63F]/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LinePreview() {
  return (
    <div className="max-w-sm mx-auto">
      {/* LINE Header */}
      <div className="bg-[#06C755] text-white px-4 py-3 rounded-t-xl flex items-center gap-3">
        <ChevronRight className="w-5 h-5 rotate-180" />
        <div className="flex-1">
          <p className="text-sm font-bold">サンプル店舗 公式</p>
          <p className="text-xs opacity-80">LINE公式アカウント</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="bg-[#7494C0] min-h-[300px] p-4 space-y-3">
        {/* Message from store */}
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4 text-[#06C755]" />
          </div>
          <div>
            <div className="bg-white rounded-lg rounded-tl-none p-3 max-w-[240px]">
              <p className="text-xs text-gray-800 font-bold mb-1">【今日だけ】店長が仕入れすぎた〇〇を還元！</p>
              <p className="text-xs text-gray-600">ここに作成したクーポン配信テキストが反映されます</p>
            </div>
            <span className="text-[10px] text-white/80 mt-1 block">14:30</span>
          </div>
        </div>

        {/* Rich Message Preview */}
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4 text-[#06C755]" />
          </div>
          <div>
            <div className="bg-white rounded-lg rounded-tl-none overflow-hidden max-w-[240px]">
              <div className="h-32 bg-gradient-to-br from-[#8CC63F] to-[#6ba02e] flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-sm font-bold">バナー画像</p>
                  <p className="text-xs opacity-80">プレビュー</p>
                </div>
              </div>
              <div className="p-2 text-center">
                <p className="text-xs text-blue-600 font-medium">クーポンを確認する</p>
              </div>
            </div>
            <span className="text-[10px] text-white/80 mt-1 block">14:31</span>
          </div>
        </div>
      </div>

      {/* Rich Menu Preview */}
      <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden">
        <div className="grid grid-cols-3 grid-rows-2">
          {[
            { icon: CalendarDays, label: '予約' },
            { icon: BookOpen, label: 'メニュー' },
            { icon: MapPin, label: 'アクセス' },
            { icon: Gift, label: 'クーポン' },
            { icon: Clock, label: '営業時間' },
            { icon: Phone, label: '電話' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center py-3 border border-gray-100 bg-[#f4fae8] hover:bg-[#e8f5d6] transition-colors"
            >
              <item.icon className="w-5 h-5 text-[#6ba02e] mb-1" />
              <span className="text-[10px] text-gray-600 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PreviewPanel({ mode }) {
  return (
    <div>
      <div className="text-center mb-4">
        <span className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">
          {mode === 'gbp' ? 'Googleビジネスプロフィール' : 'LINE公式アカウント'} プレビュー
        </span>
      </div>
      {mode === 'gbp' ? <GbpPreview /> : <LinePreview />}
    </div>
  )
}
