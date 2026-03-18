import { useState, useRef, useEffect } from 'react'
import {
  ExternalLink, RefreshCw, AlertTriangle, Globe, Loader2,
  Star, MapPin, Clock, Phone, Navigation, MessageCircle,
  Image, Share2, Bookmark, ChevronRight,
  CalendarDays, BookOpen, Gift
} from 'lucide-react'

const LIVE_PAGES = {
  gbp: {
    label: 'Googleビジネスプロフィール',
    urls: [
      { label: 'GBP管理画面', url: 'https://business.google.com/' },
      { label: 'Googleマップ（店舗検索）', url: 'https://www.google.com/maps' },
      { label: 'Google検索プレビュー', url: 'https://www.google.com/search?q=%E8%BF%91%E3%81%8F%E3%81%AE%E3%82%AB%E3%83%95%E3%82%A7' },
    ],
  },
  line: {
    label: 'LINE公式アカウント',
    urls: [
      { label: 'LINE Official Account Manager', url: 'https://manager.line.biz/' },
      { label: 'LINE公式アカウント設定ガイド', url: 'https://www.lycbiz.com/jp/service/line-official-account/' },
    ],
  },
}

function IframeEmbed({ url, label }) {
  const iframeRef = useRef(null)
  const [status, setStatus] = useState('loading') // loading | loaded | blocked
  const [inputUrl, setInputUrl] = useState(url)

  useEffect(() => {
    setStatus('loading')
    setInputUrl(url)

    // iframeのloadイベントで読み込み完了を検知
    // ただしX-Frame-Optionsブロック時はonErrorが呼ばれない場合がある
    // タイムアウトでfallbackを表示
    const timer = setTimeout(() => {
      if (status === 'loading') {
        setStatus('blocked')
      }
    }, 8000)

    return () => clearTimeout(timer)
  }, [url])

  const handleLoad = () => {
    setStatus('loaded')
  }

  const handleNavigate = () => {
    if (inputUrl) {
      setStatus('loading')
      if (iframeRef.current) {
        iframeRef.current.src = inputUrl
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* URL Bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
        <Globe className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="url"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
          className="flex-1 text-xs text-gray-700 bg-gray-100 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#8CC63F]"
        />
        <button
          onClick={handleNavigate}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
          title="再読み込み"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
        </button>
        <a
          href={inputUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          title="新しいタブで開く"
        >
          <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
        </a>
      </div>

      {/* Iframe / Fallback */}
      <div className="flex-1 relative bg-white">
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-[#8CC63F] animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">読み込み中...</p>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={url}
          onLoad={handleLoad}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
          title={label}
        />

        {status === 'blocked' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
            <div className="text-center max-w-xs">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                このサイトは埋め込み表示を制限しています
              </p>
              <p className="text-xs text-gray-500 mb-4">
                セキュリティ設定により、iframe内での表示がブロックされました。新しいタブで開いてご利用ください。
              </p>
              <a
                href={inputUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#8CC63F] hover:bg-[#6ba02e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                新しいタブで開く
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


function GbpMockPreview() {
  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white rounded-t-xl border border-gray-200 overflow-hidden">
        <div className="h-40 bg-gradient-to-b from-[#e8f5e9] to-[#c8e6c9] flex items-center justify-center relative">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-xs text-gray-600 mt-1">Google Maps</p>
          </div>
        </div>
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

function LineMockPreview() {
  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-[#06C755] text-white px-4 py-3 rounded-t-xl flex items-center gap-3">
        <ChevronRight className="w-5 h-5 rotate-180" />
        <div className="flex-1">
          <p className="text-sm font-bold">サンプル店舗 公式</p>
          <p className="text-xs opacity-80">LINE公式アカウント</p>
        </div>
      </div>
      <div className="bg-[#7494C0] min-h-[300px] p-4 space-y-3">
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
  const [viewMode, setViewMode] = useState('live') // 'live' | 'mock'
  const [selectedUrl, setSelectedUrl] = useState(0)

  const pages = LIVE_PAGES[mode]
  const currentUrl = pages.urls[selectedUrl]?.url || pages.urls[0].url

  return (
    <div className="h-full flex flex-col">
      {/* View Mode Toggle + URL Selector */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200">
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('live')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'live'
                ? 'bg-[#8CC63F] text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            実際の画面
          </button>
          <button
            onClick={() => setViewMode('mock')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'mock'
                ? 'bg-[#8CC63F] text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            モックアップ
          </button>
        </div>

        {viewMode === 'live' && (
          <div className="flex gap-1 ml-2">
            {pages.urls.map((u, i) => (
              <button
                key={i}
                onClick={() => setSelectedUrl(i)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedUrl === i
                    ? 'bg-[#f4fae8] text-[#6ba02e] border border-[#8CC63F]'
                    : 'text-gray-500 hover:bg-gray-100 border border-transparent'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {viewMode === 'live' ? (
          <IframeEmbed url={currentUrl} label={pages.label} />
        ) : (
          <div className="overflow-y-auto h-full p-4">
            {mode === 'gbp' ? <GbpMockPreview /> : <LineMockPreview />}
          </div>
        )}
      </div>
    </div>
  )
}
