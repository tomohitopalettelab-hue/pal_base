import { useState } from 'react'
import { TrendingUp, Eye, MousePointerClick, UserPlus, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, Pause, Play, Settings, Bell } from 'lucide-react'

const mockChannelData = [
  { id: 'google', label: 'Google', color: '#4285F4', impressions: 12400, clicks: 620, conversions: 31, spend: 18500, cpa: 597, trend: 'up' },
  { id: 'instagram', label: 'Instagram', color: '#E1306C', impressions: 8200, clicks: 410, conversions: 22, spend: 14200, cpa: 645, trend: 'up' },
  { id: 'tiktok', label: 'TikTok', color: '#000000', impressions: 45000, clicks: 1800, conversions: 15, spend: 9800, cpa: 653, trend: 'down' },
  { id: 'line', label: 'LINE', color: '#06C755', impressions: 5600, clicks: 280, conversions: 18, spend: 7500, cpa: 417, trend: 'up' },
]

const notifications = [
  { text: '昨日のTikTok広告から15人がLINE登録しました！', time: '2時間前', type: 'success' },
  { text: 'Googleマップ経由で5件の電話がありました！', time: '5時間前', type: 'success' },
  { text: 'Instagram広告のCTRが業界平均の2.1倍です', time: '昨日', type: 'info' },
  { text: 'AIが予算をInstagramに15%シフトしました', time: '昨日', type: 'auto' },
]

export default function AdDashboard({ campaign }) {
  const [isPaused, setIsPaused] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const totalSpend = mockChannelData.reduce((s, c) => s + c.spend, 0)
  const totalImpressions = mockChannelData.reduce((s, c) => s + c.impressions, 0)
  const totalClicks = mockChannelData.reduce((s, c) => s + c.clicks, 0)
  const totalConversions = mockChannelData.reduce((s, c) => s + c.conversions, 0)

  const summaryCards = [
    { label: '表示回数', value: totalImpressions.toLocaleString(), icon: Eye, change: '+12.4%', up: true },
    { label: 'クリック数', value: totalClicks.toLocaleString(), icon: MousePointerClick, change: '+8.7%', up: true },
    { label: 'コンバージョン', value: totalConversions.toString(), icon: UserPlus, change: '+23.1%', up: true },
    { label: '消化予算', value: `¥${totalSpend.toLocaleString()}`, icon: DollarSign, change: `残¥${(campaign.budget - totalSpend).toLocaleString()}`, up: null },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Campaign header */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`} />
          <div>
            <p className="text-sm font-bold text-gray-800">
              {campaign.goal === 'visit' ? '来店促進' : campaign.goal === 'friends' ? '友だち獲得' : '採用'}キャンペーン
            </p>
            <p className="text-xs text-gray-400">{campaign.channels.length}媒体 ・ {campaign.period}日間 ・ {(campaign.budget / 10000)}万円</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-[#FFF3E0] transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4 text-[#F39800]" />
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center">4</div>
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <p className="px-4 py-1 text-xs text-gray-400 font-medium">成果通知</p>
                {notifications.map((n, i) => (
                  <div key={i} className="px-4 py-2.5 hover:bg-[#FFF8F0] transition-colors">
                    <p className="text-xs text-gray-700">{n.text}</p>
                    <p className="text-xs text-gray-300 mt-0.5">{n.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isPaused
                ? 'bg-[#F39800] text-white'
                : 'border border-gray-200 text-gray-500 hover:border-[#F39800] hover:text-[#F39800]'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {isPaused ? '再開' : '一時停止'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3">
          {summaryCards.map((c) => {
            const Icon = c.icon
            return (
              <div key={c.label} className="bg-white rounded-xl p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-4 h-4 text-[#F39800]" />
                  {c.up !== null && (
                    <span className={`text-xs font-medium flex items-center gap-0.5 ${c.up ? 'text-green-600' : 'text-red-500'}`}>
                      {c.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {c.change}
                    </span>
                  )}
                  {c.up === null && (
                    <span className="text-xs text-gray-400">{c.change}</span>
                  )}
                </div>
                <p className="text-lg font-bold text-gray-800">{c.value}</p>
                <p className="text-xs text-gray-400">{c.label}</p>
              </div>
            )
          })}
        </div>

        {/* Budget allocation bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-gray-800">スマート予算配分</h4>
            <div className="flex items-center gap-1 text-xs text-[#F39800]">
              <RefreshCw className="w-3 h-3" />
              AIが自動最適化中
            </div>
          </div>
          <div className="flex rounded-lg overflow-hidden h-6">
            {mockChannelData.map((c) => {
              const pct = (c.spend / totalSpend) * 100
              return (
                <div
                  key={c.id}
                  style={{ width: `${pct}%`, backgroundColor: c.color }}
                  className="flex items-center justify-center text-white text-xs font-medium"
                  title={`${c.label}: ${Math.round(pct)}%`}
                >
                  {pct > 15 && `${Math.round(pct)}%`}
                </div>
              )
            })}
          </div>
          <div className="flex gap-3 mt-2">
            {mockChannelData.map((c) => (
              <div key={c.id} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                {c.label}
              </div>
            ))}
          </div>
        </div>

        {/* Channel performance table */}
        <div>
          <h4 className="text-sm font-bold text-gray-800 mb-3">媒体別パフォーマンス</h4>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400">
                  <th className="text-left py-2.5 px-4 font-medium">媒体</th>
                  <th className="text-right py-2.5 px-4 font-medium">表示</th>
                  <th className="text-right py-2.5 px-4 font-medium">クリック</th>
                  <th className="text-right py-2.5 px-4 font-medium">CV</th>
                  <th className="text-right py-2.5 px-4 font-medium">CPA</th>
                  <th className="text-right py-2.5 px-4 font-medium">消化額</th>
                </tr>
              </thead>
              <tbody>
                {mockChannelData.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-[#FFF8F0] transition-colors">
                    <td className="py-2.5 px-4 font-medium text-gray-800 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.label}
                    </td>
                    <td className="text-right py-2.5 px-4 text-gray-600">{c.impressions.toLocaleString()}</td>
                    <td className="text-right py-2.5 px-4 text-gray-600">{c.clicks.toLocaleString()}</td>
                    <td className="text-right py-2.5 px-4 font-bold text-gray-800">{c.conversions}</td>
                    <td className="text-right py-2.5 px-4">
                      <span className={`font-medium ${c.cpa < 600 ? 'text-green-600' : 'text-gray-600'}`}>
                        ¥{c.cpa.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-right py-2.5 px-4 text-gray-600">¥{c.spend.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI suggestion */}
        <div className="bg-gradient-to-r from-[#FFF8F0] to-[#FFF3E0] rounded-xl p-4 border border-[#F39800]/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F39800] flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#D47F00]">AIからの提案</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                LINEのCPAが¥417と最も効率が良いです。TikTokの予算を15%削減し、LINEに振り替えることで、
                推定コンバージョンが+8件増加する見込みです。
              </p>
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1.5 bg-[#F39800] text-white text-xs font-medium rounded-lg hover:bg-[#D47F00] transition-colors cursor-pointer">
                  適用する
                </button>
                <button className="px-3 py-1.5 border border-[#F39800]/30 text-[#F39800] text-xs font-medium rounded-lg hover:bg-[#FFF3E0] transition-colors cursor-pointer">
                  詳しく見る
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
