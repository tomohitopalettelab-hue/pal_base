"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Sparkles, Wand2, Download, ArrowLeft, LogOut, Loader2, Copy, Check,
  UtensilsCrossed, Scissors, Hammer, Building2, ShoppingBag, Heart,
  Image as ImageIcon, LayoutGrid, MessageSquare, MapPin, ChevronRight,
  CalendarCheck, Phone, Ticket, MessageCircle, Instagram, Globe, Bell,
  Users, Store, Camera, Gift, HelpCircle, Mail, Plus, Palette, Share2,
  X, FileText, PenTool, Megaphone, Link2, Shuffle,
} from 'lucide-react';
import { BANNER_TEMPLATES, COLOR_PALETTES, type BannerTemplate, type ColorPalette } from './banner-templates';
import { RICHMENU_ICONS } from './richmenu-icons';
import { RICHMENU_LAYOUTS, type RichMenuLayout } from './richmenu-layouts';

// ── Types ─────────────────────────────────────────────────────────────────────

type AppState = 'login' | 'dashboard' | 'coupon' | 'banner' | 'richmenu' | 'gbp_profile' | 'gbp_post';

type CouponResult = {
  hookTitle: string;
  description: string;
  conditions: string;
  validityPeriod: string;
  psychologyNote: string;
};

type GbpProfileOnlyResult = {
  profile: { text: string; keywords: string[]; tips: string };
};

type GbpPostResult = {
  post: { title: string; body: string; cta: string; hashtags: string[]; photoTip: string };
};

type RichMenuCell = {
  iconId: string;
  label: string;
  url: string;
  abTest?: boolean;
};

const ACCENT = '#8CC63F';
const ACCENT_DARK = '#6B9E2E';
const ACCENT_LIGHT = '#EBF5E0';

const BUSINESS_TYPES = [
  { type: 'restaurant', label: '飲食店', icon: UtensilsCrossed },
  { type: 'beauty', label: '美容室・サロン', icon: Scissors },
  { type: 'construction', label: '建設・リフォーム', icon: Hammer },
  { type: 'realestate', label: '不動産', icon: Building2 },
  { type: 'retail', label: '小売・物販', icon: ShoppingBag },
  { type: 'medical', label: '医療・クリニック', icon: Heart },
];

const CAMPAIGN_GOALS = [
  { value: '新規集客', label: '新規のお客様を増やしたい' },
  { value: 'リピート促進', label: 'リピーターを増やしたい' },
  { value: '客単価UP', label: '客単価を上げたい' },
  { value: '認知拡大', label: 'まずは知ってもらいたい' },
  { value: '閑散期対策', label: '暇な時間帯・曜日を埋めたい' },
];

const LUCIDE_ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string; className?: string }>> = {
  CalendarCheck, UtensilsCrossed, MapPin, Ticket, Phone, MessageCircle,
  Instagram, Globe, Bell, Users, Store, Camera, Gift, Heart, HelpCircle, Mail,
};

const GBP_POST_TYPES = [
  { value: 'こだわり紹介', label: 'こだわり紹介', icon: Sparkles, desc: 'お店の強みやこだわりを発信' },
  { value: 'スタッフ紹介', label: 'スタッフ紹介', icon: Users, desc: 'スタッフの人柄が伝わる投稿' },
  { value: 'お客様の声', label: 'お客様の声', icon: MessageCircle, desc: 'お客様からの嬉しい声を紹介' },
  { value: '新メニュー・新商品', label: '新メニュー・新商品', icon: Plus, desc: '新しいメニューや商品を告知' },
  { value: 'イベント・キャンペーン', label: 'イベント・キャンペーン', icon: Megaphone, desc: 'キャンペーン情報を発信' },
  { value: '日常・裏側', label: '日常・裏側', icon: Camera, desc: 'お店の裏側や日常を見せる' },
];

// ── Utility ───────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors min-h-8">
      {copied ? <><Check size={12} className="text-green-600" /> コピー済み</> : <><Copy size={12} /> コピー</>}
    </button>
  );
}

async function shareOrDownload(ref: React.RefObject<HTMLDivElement | null>, filename: string) {
  if (!ref.current) return;
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true });
  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));

  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: filename }); return; } catch { /* cancelled */ }
    }
  }
  const link = document.createElement('a');
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

function addUtmParams(url: string, campaign: string): string {
  if (!url) return url;
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    u.searchParams.set('utm_source', 'line');
    u.searchParams.set('utm_medium', 'richmenu');
    u.searchParams.set('utm_campaign', campaign);
    return u.toString();
  } catch { return url; }
}

// ── Login Panel ───────────────────────────────────────────────────────────────

function LoginPanel({ onLogin }: { onLogin: (paletteId: string) => void }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/main/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) { setError(data?.error || 'ログインに失敗しました。'); return; }
      onLogin(data.paletteId);
    } catch { setError('通信エラーが発生しました。'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
            <span className="text-white text-sm font-black">PB</span>
          </div>
          <div>
            <p className="text-lg font-black text-slate-800 leading-none">pal base</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">制作・構築エンジン</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-4">ログインしてプロ級の販促物を作成しましょう</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="ログインID" value={id} onChange={(e) => setId(e.target.value)}
            className="w-full px-3 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 min-h-12" />
          <input type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 min-h-12" />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" disabled={isLoading}
            className="w-full py-3 text-white text-sm font-bold rounded-xl transition-colors min-h-12 disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}>
            {isLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard({ onNavigate, onLogout }: { onNavigate: (state: AppState) => void; onLogout: () => void }) {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const features = [
    { state: 'coupon' as AppState, icon: Sparkles, title: 'クーポン・ジェネレーター', desc: '心理学ベースの「指が動く」クーポンをAI生成', color: '#8CC63F' },
    { state: 'banner' as AppState, icon: ImageIcon, title: 'バナー自動キャンバス', desc: '写真1枚からGBP・LINE用バナーを即作成', color: '#F39800' },
    { state: 'richmenu' as AppState, icon: LayoutGrid, title: 'リッチメニュー・ビルダー', desc: 'LINEのリッチメニューをかんたんデザイン', color: '#2196F3' },
    { state: 'gbp_profile' as AppState, icon: MapPin, title: 'GBPプロフィール構成', desc: 'Googleマップで選ばれる最強プロフィール', color: '#E53935' },
    { state: 'gbp_post' as AppState, icon: FileText, title: 'GBP投稿テンプレート', desc: 'MEOに強い投稿文をAIが作成', color: '#9C27B0' },
  ];

  const createMenuItems = [
    { state: 'coupon' as AppState, icon: Sparkles, label: 'クーポン' },
    { state: 'banner' as AppState, icon: ImageIcon, label: 'バナー画像' },
    { state: 'richmenu' as AppState, icon: LayoutGrid, label: 'リッチメニュー' },
    { state: 'gbp_profile' as AppState, icon: MapPin, label: 'GBPプロフィール' },
    { state: 'gbp_post' as AppState, icon: FileText, label: 'GBP投稿' },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
            <span className="text-white text-xs font-black">PB</span>
          </div>
          <span className="text-sm font-black text-slate-800">Pal Base</span>
        </div>
        <button onClick={onLogout} className="text-slate-400 hover:text-slate-600 p-2"><LogOut size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-5">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 mb-1">今日は何を作りますか？</h1>
            <p className="text-xs md:text-sm text-slate-500">センス不要。5分でプロの販促物ができます</p>
          </div>

          {/* 3 Action Buttons */}
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6">
            <button onClick={() => setShowCreateMenu(true)}
              className="bg-white rounded-2xl p-3 md:p-4 border border-slate-200 hover:shadow-md transition-all text-center">
              <div className="w-10 h-10 mx-auto mb-1.5 rounded-full flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
                <PenTool size={18} color="white" />
              </div>
              <p className="text-xs font-black text-slate-800">作る</p>
              <p className="text-[9px] text-slate-400 mt-0.5">販促物を選んで作成</p>
            </button>

            <button onClick={() => onNavigate('banner')}
              className="bg-white rounded-2xl p-3 md:p-4 border border-slate-200 hover:shadow-md transition-all text-center">
              <div className="w-10 h-10 mx-auto mb-1.5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F39800' }}>
                <Wand2 size={18} color="white" />
              </div>
              <p className="text-xs font-black text-slate-800">AIに任せる</p>
              <p className="text-[9px] text-slate-400 mt-0.5">写真+一言で自動生成</p>
            </button>

            <button onClick={() => setShowGuide(true)}
              className="bg-white rounded-2xl p-3 md:p-4 border border-slate-200 hover:shadow-md transition-all text-center">
              <div className="w-10 h-10 mx-auto mb-1.5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2196F3' }}>
                <Share2 size={18} color="white" />
              </div>
              <p className="text-xs font-black text-slate-800">反映する</p>
              <p className="text-[9px] text-slate-400 mt-0.5">作った素材を活用</p>
            </button>
          </div>

          {/* Create Menu Modal */}
          {showCreateMenu && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowCreateMenu(false)}>
              <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 pb-8" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-slate-800">今日は何を告知しますか？</p>
                  <button onClick={() => setShowCreateMenu(false)} className="p-1 hover:bg-slate-100 rounded"><X size={16} /></button>
                </div>
                <div className="space-y-2">
                  {createMenuItems.map((item) => (
                    <button key={item.state} onClick={() => { setShowCreateMenu(false); onNavigate(item.state); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors min-h-12 text-left">
                      <item.icon size={18} style={{ color: ACCENT }} />
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                      <ChevronRight size={14} className="text-slate-300 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Guide Modal */}
          {showGuide && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowGuide(false)}>
              <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 pb-8" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-slate-800">作った素材の使い方</p>
                  <button onClick={() => setShowGuide(false)} className="p-1 hover:bg-slate-100 rounded"><X size={16} /></button>
                </div>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex gap-3 items-start">
                    <span className="text-lg">📱</span>
                    <div><p className="font-bold text-slate-800">スマホの場合</p><p className="text-xs mt-0.5">保存ボタンを押すと共有メニューが開きます。「画像を保存」でカメラロールに保存できます。</p></div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-lg">💻</span>
                    <div><p className="font-bold text-slate-800">PCの場合</p><p className="text-xs mt-0.5">保存ボタンでPNG画像がダウンロードされます。</p></div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-lg">📋</span>
                    <div><p className="font-bold text-slate-800">テキストの場合</p><p className="text-xs mt-0.5">各テキストの横にある「コピー」ボタンでクリップボードにコピーし、LINEやGBPに貼り付けてください。</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feature Cards */}
          <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">機能一覧</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {features.map((f) => (
              <button key={f.state} onClick={() => onNavigate(f.state)}
                className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all text-left group min-h-[100px]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: f.color + '18' }}>
                    <f.icon size={20} style={{ color: f.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-bold text-slate-800 truncate">{f.title}</p>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{f.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feature 1: Coupon Generator ───────────────────────────────────────────────

function CouponGenerator({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [freeText, setFreeText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<CouponResult[]>([]);
  const [error, setError] = useState('');
  const generateTriggered = useRef(false);

  const generate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/generate/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType, businessName, campaignGoal, targetAudience, freeText }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || '生成に失敗しました'); return; }
      setResults(data.coupons || []);
      setStep(4);
    } catch { setError('通信エラーが発生しました'); }
    finally { setIsGenerating(false); }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg"><ArrowLeft size={18} /></button>
        <div>
          <p className="text-sm font-bold text-slate-800">クーポン・ジェネレーター</p>
          <p className="text-[10px] text-slate-400">心理学ベースのクーポンをAI生成</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          {step === 1 && (
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">あなたの業種は？</h2>
              <p className="text-xs text-slate-500 mb-4">業種に合った鉄板企画をAIが提案します</p>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {BUSINESS_TYPES.map((bt) => (
                  <button key={bt.type} onClick={() => { setBusinessType(bt.type); setStep(2); }}
                    className={`p-4 rounded-xl border-2 transition-all text-left min-h-[80px] ${businessType === bt.type ? 'border-[#8CC63F] bg-[#EBF5E0]' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <bt.icon size={22} className="mb-1.5" style={{ color: businessType === bt.type ? ACCENT : '#64748b' }} />
                    <p className="text-sm font-bold text-slate-700">{bt.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">もう少し教えてください</h2>
              <p className="text-xs text-slate-500 mb-4">詳しいほどAIの提案精度がアップします</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">店舗名（任意）</label>
                  <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="例: カフェ ひまわり"
                    className="w-full px-3 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 min-h-12" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">目的</label>
                  <div className="space-y-2">
                    {CAMPAIGN_GOALS.map((g) => (
                      <button key={g.value} onClick={() => setCampaignGoal(g.value)}
                        className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all min-h-12 ${campaignGoal === g.value ? 'border-[#8CC63F] bg-[#EBF5E0] font-bold' : 'border-slate-200 hover:border-slate-300'}`}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ターゲット（任意）</label>
                  <input type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="例: 20-30代の女性"
                    className="w-full px-3 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 min-h-12" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">追加情報（任意）</label>
                  <textarea value={freeText} onChange={(e) => setFreeText(e.target.value)} placeholder="例: いちごフェアをやりたい" rows={2}
                    className="w-full px-3 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="px-4 py-3 text-sm text-slate-600 border border-slate-300 rounded-xl min-h-12 hover:bg-slate-50">戻る</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-3 text-white text-sm font-bold rounded-xl min-h-12" style={{ backgroundColor: ACCENT }}>
                    AIに提案してもらう <Sparkles className="inline ml-1" size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
          {step === 3 && (() => {
            if (!generateTriggered.current && !isGenerating && !error) { generateTriggered.current = true; generate(); }
            return (
              <div className="text-center py-12">
                {isGenerating ? (
                  <><Loader2 className="animate-spin mx-auto mb-4" size={36} style={{ color: ACCENT }} />
                  <p className="text-sm font-bold text-slate-700">AIが最高のクーポンを考案中...</p></>
                ) : error ? (
                  <><p className="text-sm text-red-500 mb-4">{error}</p>
                  <button onClick={() => { setError(''); generateTriggered.current = false; generate(); }} className="px-6 py-3 text-white text-sm font-bold rounded-xl min-h-12" style={{ backgroundColor: ACCENT }}>再試行する</button>
                  <button onClick={() => { setStep(2); generateTriggered.current = false; }} className="block mx-auto mt-3 text-xs text-slate-500">入力内容を修正する</button></>
                ) : <Loader2 className="animate-spin mx-auto" size={36} style={{ color: ACCENT }} />}
              </div>
            );
          })()}
          {step === 4 && (
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">3つのクーポン案ができました！</h2>
              <p className="text-xs text-slate-500 mb-4">気に入ったものをコピーして使えます</p>
              <div className="space-y-4">
                {results.map((r, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: ACCENT }}>パターン {i + 1}</span>
                      <CopyButton text={`${r.hookTitle}\n${r.description}\n条件: ${r.conditions}\n有効期間: ${r.validityPeriod}`} />
                    </div>
                    <p className="text-base md:text-lg font-black text-slate-800 mb-2 leading-tight">{r.hookTitle}</p>
                    <p className="text-sm text-slate-600 mb-3">{r.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-600">📋 {r.conditions}</span>
                      <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-600">📅 {r.validityPeriod}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">💡 {r.psychologyNote}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => { setStep(1); setResults([]); generateTriggered.current = false; }}
                className="w-full mt-4 py-3 text-sm font-bold border border-slate-300 rounded-xl min-h-12 hover:bg-slate-50">もう一度作る</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Feature 2: Banner Canvas ──────────────────────────────────────────────────

function BannerCanvas({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<BannerTemplate>(BANNER_TEMPLATES[0]);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(COLOR_PALETTES[0]);
  const [sizeMode, setSizeMode] = useState<'square' | 'wide'>('square');
  const [mainCopy, setMainCopy] = useState('期間限定');
  const [subCopy, setSubCopy] = useState('今だけのスペシャルメニュー');
  const [ctaText, setCtaText] = useState('詳しくはこちら');
  const [keyword, setKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setPhoto(ev.target?.result as string); setStep(2); };
    reader.readAsDataURL(file);
  };

  const generateTexts = async () => {
    if (!keyword.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate/banner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keyword }) });
      const data = await res.json();
      if (data.success && data.banners?.length) {
        const b = data.banners[0];
        setMainCopy(b.mainCopy); setSubCopy(b.subCopy); setCtaText(b.ctaText);
      }
    } catch { /* ignore */ }
    finally { setIsGenerating(false); }
  };

  const previewW = sizeMode === 'square' ? 320 : 400;
  const previewH = sizeMode === 'square' ? 320 : 209;

  const renderOverlay = () => {
    const p = selectedPalette;
    const o = selectedTemplate.overlayStyle.opacity;
    const pos = selectedTemplate.overlayPosition;
    const base = { position: 'absolute' as const, backgroundColor: p.primary, opacity: o };
    const title = { color: p.text, fontSize: 20, fontWeight: 900 as const, lineHeight: 1.2 };
    const sub = { color: p.text, fontSize: 12, marginTop: 4, opacity: 0.9 };
    const cta = ctaText ? <span style={{ display: 'inline-block', marginTop: 8, padding: '4px 12px', backgroundColor: p.text, color: p.primary, fontSize: 10, fontWeight: 700, borderRadius: 20 }}>{ctaText}</span> : null;

    if (pos === 'bottom-band') return <div style={{ ...base, bottom: 0, left: 0, right: 0, padding: '16px 20px' }}><p style={title}>{mainCopy}</p><p style={sub}>{subCopy}</p>{cta}</div>;
    if (pos === 'top-band') return <div style={{ ...base, top: 0, left: 0, right: 0, padding: '16px 20px' }}><p style={title}>{mainCopy}</p><p style={sub}>{subCopy}</p></div>;
    if (pos === 'center-overlay') return <div style={{ ...base, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', padding: '20px 28px', borderRadius: 12, textAlign: 'center' as const }}><p style={{ ...title, fontSize: 22 }}>{mainCopy}</p><p style={{ ...sub, marginTop: 6 }}>{subCopy}</p>{cta}</div>;
    if (pos === 'side-panel') return <div style={{ ...base, top: 0, right: 0, width: '45%', height: '100%', padding: '20px 16px', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center' }}><p style={{ ...title, fontSize: 18, lineHeight: 1.3 }}>{mainCopy}</p><p style={{ ...sub, marginTop: 6 }}>{subCopy}</p>{cta}</div>;
    return null;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg"><ArrowLeft size={18} /></button>
        <div><p className="text-sm font-bold text-slate-800">バナー自動キャンバス</p><p className="text-[10px] text-slate-400">写真1枚からプロ級バナーを作成</p></div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          {step === 1 && (
            <div className="text-center py-8">
              <ImageIcon className="mx-auto mb-4 text-slate-300" size={48} />
              <h2 className="text-base font-bold text-slate-800 mb-1">写真をアップロード</h2>
              <p className="text-xs text-slate-500 mb-6">お店の写真1枚から映えるバナーを作成します</p>
              <label className="inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-xl cursor-pointer min-h-12" style={{ backgroundColor: ACCENT }}>
                <Plus size={16} /> 写真を選択
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          )}
          {step >= 2 && (
            <div className="space-y-5">
              <div className="flex gap-2">
                {(['square', 'wide'] as const).map((s) => (
                  <button key={s} onClick={() => setSizeMode(s)} className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 transition-all min-h-10 ${sizeMode === s ? 'border-[#8CC63F] bg-[#EBF5E0]' : 'border-slate-200'}`}>
                    {s === 'square' ? '正方形 (GBP)' : '横長 (LINE)'}
                  </button>
                ))}
              </div>
              <div className="flex justify-center">
                <div ref={bannerRef} style={{ width: previewW, height: previewH, position: 'relative', overflow: 'hidden', borderRadius: 12, background: '#eee' }}>
                  {photo && <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />}
                  {renderOverlay()}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">テンプレート</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {BANNER_TEMPLATES.map((t) => (
                    <button key={t.id} onClick={() => setSelectedTemplate(t)} className={`flex-shrink-0 px-3 py-2 text-xs rounded-xl border-2 transition-all min-h-10 ${selectedTemplate.id === t.id ? 'border-[#8CC63F] bg-[#EBF5E0] font-bold' : 'border-slate-200 hover:border-slate-300'}`}>{t.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">カラーパレット</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_PALETTES.map((p) => (
                    <button key={p.id} onClick={() => setSelectedPalette(p)} className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border-2 transition-all min-h-10 ${selectedPalette.id === p.id ? 'border-[#8CC63F] bg-[#EBF5E0] font-bold' : 'border-slate-200 hover:border-slate-300'}`}>
                      <span className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: p.primary }} />{p.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">AIにテキストを考えてもらう</label>
                <div className="flex gap-2">
                  <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="例: いちごフェア" className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-xl min-h-12" />
                  <button onClick={generateTexts} disabled={isGenerating || !keyword.trim()} className="px-4 py-2 text-white text-xs font-bold rounded-xl min-h-12 disabled:opacity-50" style={{ backgroundColor: ACCENT }}>
                    {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div><label className="text-xs font-bold text-slate-600 block mb-1">メインコピー</label><input type="text" value={mainCopy} onChange={(e) => setMainCopy(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl min-h-12" /></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">サブコピー</label><input type="text" value={subCopy} onChange={(e) => setSubCopy(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl min-h-12" /></div>
                <div><label className="text-xs font-bold text-slate-600 block mb-1">CTAボタン</label><input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl min-h-12" /></div>
              </div>
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-1 py-3 text-sm text-slate-600 border border-slate-300 rounded-xl cursor-pointer min-h-12 hover:bg-slate-50">
                  <ImageIcon size={14} /> 写真を変更<input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                <button onClick={() => shareOrDownload(bannerRef, `banner-${sizeMode}-${Date.now()}.png`)}
                  className="flex-1 flex items-center justify-center gap-1 py-3 text-white text-sm font-bold rounded-xl min-h-12" style={{ backgroundColor: ACCENT }}>
                  <Download size={14} /> 保存する
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── LINE Set Button ───────────────────────────────────────────────────────────

function LineSetButton({ menuRef, cells, selectedLayout }: { menuRef: React.RefObject<HTMLDivElement | null>; cells: RichMenuCell[]; selectedLayout: RichMenuLayout }) {
  const [status, setStatus] = useState<'idle' | 'setting' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const setToLine = async () => {
    if (!menuRef.current) return;
    setStatus('setting');
    try {
      const outputW = 2500;
      const outputH = selectedLayout.rows === 1 ? 843 : 1686;
      const previewW = 340;
      const scale = outputW / previewW;
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(menuRef.current, { scale, useCORS: true });
      const offscreen = document.createElement('canvas');
      offscreen.width = outputW;
      offscreen.height = outputH;
      const ctx = offscreen.getContext('2d');
      if (ctx) ctx.drawImage(canvas, 0, 0, outputW, outputH);
      const imageBase64 = offscreen.toDataURL('image/png');

      // Build LINE rich menu areas
      const cellW = outputW / selectedLayout.cols;
      const cellH = outputH / selectedLayout.rows;
      const areas = selectedLayout.areas.map((area, idx) => {
        const cell = cells[idx];
        const url = cell?.url || '';
        return {
          bounds: { x: area.x * cellW, y: area.y * cellH, width: area.w * cellW, height: area.h * cellH },
          action: url.startsWith('http') ? { type: 'uri' as const, uri: url } : { type: 'message' as const, text: cell?.label || 'メニュー' },
        };
      });

      const res = await fetch('/api/line/set-richmenu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, areas, rows: selectedLayout.rows }),
      });
      const data = await res.json();
      if (data.success) { setStatus('done'); setMsg('LINEリッチメニューに反映しました！'); }
      else { setStatus('error'); setMsg(data.error || '反映に失敗しました'); }
    } catch { setStatus('error'); setMsg('通信エラーが発生しました'); }
  };

  return (
    <div>
      <button onClick={setToLine} disabled={status === 'setting'}
        className="w-full py-3 text-white text-sm font-bold rounded-xl min-h-12 disabled:opacity-50 flex items-center justify-center gap-1"
        style={{ backgroundColor: status === 'done' ? '#22c55e' : '#06C755' }}>
        {status === 'setting' ? <Loader2 className="animate-spin" size={16} /> : status === 'done' ? <><Check size={16} /> 反映完了！</> : <><MessageCircle size={14} /> LINEにセットする</>}
      </button>
      {msg && status === 'error' && <p className="text-xs text-red-500 text-center mt-1">{msg}</p>}
      {msg && status === 'done' && <p className="text-xs text-green-600 text-center mt-1">{msg}</p>}
    </div>
  );
}

// ── Feature 3: Rich Menu Builder ──────────────────────────────────────────────

function RichMenuBuilder({ onBack, lineConnected }: { onBack: () => void; lineConnected: boolean }) {
  const [step, setStep] = useState(1);
  const [selectedLayout, setSelectedLayout] = useState<RichMenuLayout>(RICHMENU_LAYOUTS[0]);
  const [cells, setCells] = useState<RichMenuCell[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [bgColor, setBgColor] = useState('#8CC63F');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [dragSource, setDragSource] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const initCells = useCallback((layout: RichMenuLayout) => {
    setCells(layout.areas.map(() => ({ iconId: '', label: '', url: '', abTest: false })));
  }, []);

  useEffect(() => { initCells(selectedLayout); }, [selectedLayout, initCells]);

  const updateCell = (idx: number, updates: Partial<RichMenuCell>) => {
    setCells((prev) => prev.map((c, i) => i === idx ? { ...c, ...updates } : c));
  };

  const swapCells = (a: number, b: number) => {
    if (a === b) return;
    setCells((prev) => {
      const next = [...prev];
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
  };

  const getIconComponent = (iconId: string) => {
    const def = RICHMENU_ICONS.find((ic) => ic.id === iconId);
    if (!def) return null;
    return LUCIDE_ICON_MAP[def.lucideIcon] || null;
  };

  const handleCellClick = (idx: number) => {
    if (dragSource !== null && dragSource !== idx) {
      swapCells(dragSource, idx);
      setDragSource(null);
    } else {
      setEditingIdx(idx);
    }
  };

  // LINE公式サイズで出力
  const outputW = 2500;
  const outputH = selectedLayout.rows === 1 ? 843 : 1686;
  const previewW = 340;
  const previewH = selectedLayout.rows === 1 ? 113 : 226;

  const downloadMenu = async () => {
    if (!menuRef.current) return;
    const scale = outputW / previewW;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(menuRef.current, { scale, useCORS: true });

    // Resize to exact LINE dimensions
    const offscreen = document.createElement('canvas');
    offscreen.width = outputW;
    offscreen.height = outputH;
    const ctx = offscreen.getContext('2d');
    if (ctx) ctx.drawImage(canvas, 0, 0, outputW, outputH);

    const blob = await new Promise<Blob>((resolve) => offscreen.toBlob((b) => resolve(b!), 'image/png'));

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      const file = new File([blob], `richmenu-${Date.now()}.png`, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file] }); return; } catch { /* cancelled */ }
      }
    }
    const link = document.createElement('a');
    link.download = `richmenu-${outputW}x${outputH}-${Date.now()}.png`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg"><ArrowLeft size={18} /></button>
        <div><p className="text-sm font-bold text-slate-800">リッチメニュー・ビルダー</p><p className="text-[10px] text-slate-400">LINEリッチメニューをかんたん作成</p></div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        <div className="max-w-lg mx-auto space-y-5">
          {step === 1 && (
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">レイアウトを選択</h2>
              <p className="text-xs text-slate-500 mb-4">ボタンの配置パターンを選んでください</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {RICHMENU_LAYOUTS.map((layout) => (
                  <button key={layout.id} onClick={() => { setSelectedLayout(layout); setStep(2); }}
                    className={`p-3 rounded-xl border-2 transition-all text-center min-h-[90px] ${selectedLayout.id === layout.id ? 'border-[#8CC63F] bg-[#EBF5E0]' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="mx-auto mb-2 w-16 h-10 border border-slate-300 rounded overflow-hidden" style={{ display: 'grid', gridTemplateColumns: `repeat(${layout.cols}, 1fr)`, gridTemplateRows: `repeat(${layout.rows}, 1fr)`, gap: 1 }}>
                      {layout.areas.map((a, i) => (<div key={i} style={{ gridColumn: `${a.x + 1} / span ${a.w}`, gridRow: `${a.y + 1} / span ${a.h}`, backgroundColor: ACCENT + '40', borderRadius: 2 }} />))}
                    </div>
                    <p className="text-xs font-bold text-slate-700">{layout.name}</p>
                    <p className="text-[10px] text-slate-400">{layout.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step >= 2 && (
            <>
              {/* ドラッグ&ドロップヒント */}
              {dragSource !== null && (
                <div className="text-center text-xs text-blue-600 bg-blue-50 rounded-xl py-2 px-3">
                  <Shuffle size={12} className="inline mr-1" />入れ替え先のセルをタップしてください
                  <button onClick={() => setDragSource(null)} className="ml-2 text-blue-400 underline">キャンセル</button>
                </div>
              )}
              {/* プレビュー */}
              <div className="flex justify-center">
                <div ref={menuRef} style={{ width: previewW, height: previewH, display: 'grid', gridTemplateColumns: `repeat(${selectedLayout.cols}, 1fr)`, gridTemplateRows: `repeat(${selectedLayout.rows}, 1fr)`, gap: 2, backgroundColor: bgColor, borderRadius: 12, padding: 2, overflow: 'hidden' }}>
                  {selectedLayout.areas.map((area, idx) => {
                    const cell = cells[idx];
                    const IconComp = cell?.iconId ? getIconComponent(cell.iconId) : null;
                    const isSwapSource = dragSource === idx;
                    return (
                      <div key={idx}
                        draggable
                        onDragStart={() => setDragSource(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => { if (dragSource !== null) { swapCells(dragSource, idx); setDragSource(null); } }}
                        onClick={() => handleCellClick(idx)}
                        style={{ gridColumn: `${area.x + 1} / span ${area.w}`, gridRow: `${area.y + 1} / span ${area.h}`, backgroundColor: bgColor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: 8, border: isSwapSource ? '2px dashed white' : editingIdx === idx ? '2px solid white' : '1px solid rgba(255,255,255,0.2)', opacity: isSwapSource ? 0.6 : 1 }}>
                        {IconComp ? <IconComp size={24} color={textColor} /> : <Plus size={20} color={textColor} className="opacity-40" />}
                        <span style={{ color: textColor, fontSize: 10, marginTop: 4, fontWeight: 700 }}>{cell?.label || 'タップで編集'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center">💡 セルを長押し（ドラッグ）で入れ替え可能 ｜ 出力サイズ: {outputW}x{outputH}px</p>

              {/* 入れ替えボタン (モバイル向け) */}
              <div className="flex justify-center">
                <button onClick={() => setDragSource(dragSource !== null ? null : editingIdx ?? 0)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${dragSource !== null ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                  <Shuffle size={12} /> {dragSource !== null ? '入れ替えモード ON' : 'セルを入れ替える'}
                </button>
              </div>

              {/* セル編集パネル */}
              {editingIdx !== null && cells[editingIdx] && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-700">ボタン {editingIdx + 1} を編集</p>
                    <button onClick={() => setEditingIdx(null)} className="p-1 hover:bg-slate-100 rounded"><X size={14} /></button>
                  </div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">アイコン</label>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {RICHMENU_ICONS.map((ic) => {
                      const Comp = LUCIDE_ICON_MAP[ic.lucideIcon];
                      return (
                        <button key={ic.id} onClick={() => { updateCell(editingIdx, { iconId: ic.id, label: cells[editingIdx].label || ic.label }); }}
                          className={`flex flex-col items-center p-1.5 rounded-lg border text-center min-w-[52px] ${cells[editingIdx].iconId === ic.id ? 'border-[#8CC63F] bg-[#EBF5E0]' : 'border-slate-200'}`}>
                          {Comp && <Comp size={16} color={cells[editingIdx].iconId === ic.id ? ACCENT : '#64748b'} />}
                          <span className="text-[9px] text-slate-500 mt-0.5">{ic.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-2">
                    <div><label className="text-[10px] font-bold text-slate-500 block mb-0.5">ラベル</label><input type="text" value={cells[editingIdx].label} onChange={(e) => updateCell(editingIdx, { label: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl min-h-10" placeholder="表示名" /></div>
                    <div><label className="text-[10px] font-bold text-slate-500 block mb-0.5">リンクURL</label><input type="text" value={cells[editingIdx].url} onChange={(e) => updateCell(editingIdx, { url: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl min-h-10" placeholder="https://..." /></div>
                    {/* ABテスト */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <Link2 size={12} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500">ABテストURL生成</span>
                      </div>
                      <button onClick={() => updateCell(editingIdx, { abTest: !cells[editingIdx].abTest })}
                        className={`w-9 h-5 rounded-full transition-colors relative ${cells[editingIdx].abTest ? 'bg-[#8CC63F]' : 'bg-slate-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${cells[editingIdx].abTest ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    {cells[editingIdx].abTest && cells[editingIdx].url && (
                      <div className="bg-slate-50 rounded-lg p-2 space-y-1">
                        <div className="flex items-center gap-1"><span className="text-[9px] font-bold text-green-600">A</span><p className="text-[9px] text-slate-500 truncate">{addUtmParams(cells[editingIdx].url, 'pattern_a')}</p></div>
                        <div className="flex items-center gap-1"><span className="text-[9px] font-bold text-blue-600">B</span><p className="text-[9px] text-slate-500 truncate">{addUtmParams(cells[editingIdx].url, 'pattern_b')}</p></div>
                        <CopyButton text={`パターンA:\n${addUtmParams(cells[editingIdx].url, 'pattern_a')}\n\nパターンB:\n${addUtmParams(cells[editingIdx].url, 'pattern_b')}`} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* カラー設定 */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-600 block mb-1">背景色</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded border-0 cursor-pointer" />
                    <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded-lg min-h-10" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-600 block mb-1">文字色</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 rounded border-0 cursor-pointer" />
                    <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded-lg min-h-10" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 text-sm text-slate-600 border border-slate-300 rounded-xl min-h-12 hover:bg-slate-50">レイアウト変更</button>
                <button onClick={downloadMenu} className="flex-1 flex items-center justify-center gap-1 py-3 text-white text-sm font-bold rounded-xl min-h-12" style={{ backgroundColor: ACCENT }}>
                  <Download size={14} /> 保存する
                </button>
              </div>

              {/* LINEにセットするボタン */}
              {lineConnected ? (
                <LineSetButton menuRef={menuRef} cells={cells} selectedLayout={selectedLayout} />
              ) : (
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500">LINE連携が未設定です</p>
                  <p className="text-[10px] text-slate-400">管理者にLINE連携の設定を依頼してください</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Feature 4: GBP Profile Builder (プロフィールのみ) ─────────────────────────

function GbpProfileBuilder({ onBack, gbpConnected }: { onBack: () => void; gbpConnected: boolean }) {
  const [interviewStep, setInterviewStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GbpProfileOnlyResult | null>(null);
  const [error, setError] = useState('');
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'done' | 'error'>('idle');
  const [publishMessage, setPublishMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const QUESTIONS = [
    { key: 'businessType', question: 'お店のジャンルを教えてください', placeholder: '例: イタリアンレストラン' },
    { key: 'businessName', question: 'お店の名前を教えてください', placeholder: '例: トラットリア ○○' },
    { key: 'strength', question: '一番のこだわりは何ですか？', placeholder: '例: 自家製生パスタと地元野菜' },
    { key: 'targetCustomer', question: 'どんなお客様に来てほしいですか？', placeholder: '例: 記念日デートのカップル' },
    { key: 'areaFeature', question: 'お店のある地域の特徴は？', placeholder: '例: ○○駅から徒歩3分、商店街の中' },
    { key: 'message', question: '最後に、何か伝えたいメッセージはありますか？', placeholder: '自由にどうぞ（スキップもOK）' },
  ];

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [interviewStep, result]);

  const handleSubmitAnswer = () => {
    const q = QUESTIONS[interviewStep];
    const val = currentInput.trim();
    if (!val && interviewStep < 2) return;
    setAnswers((prev) => ({ ...prev, [q.key]: val }));
    setCurrentInput('');
    if (interviewStep < QUESTIONS.length - 1) { setInterviewStep(interviewStep + 1); }
    else { generateProfile({ ...answers, [q.key]: val }); }
  };

  const generateProfile = async (allAnswers: Record<string, string>) => {
    setIsGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/generate/gbp-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(allAnswers) });
      const data = await res.json();
      if (!data.success) { setError(data.error || '生成に失敗しました'); return; }
      setResult({ profile: data.profile });
    } catch { setError('通信エラーが発生しました'); }
    finally { setIsGenerating(false); }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg"><ArrowLeft size={18} /></button>
        <div><p className="text-sm font-bold text-slate-800">GBP プロフィール構成</p><p className="text-[10px] text-slate-400">Googleマップで選ばれるプロフィール</p></div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          {!result && (
            <div className="space-y-3">
              {QUESTIONS.slice(0, interviewStep + 1).map((q) => (
                <div key={q.key}>
                  <div className="flex gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ACCENT }}><MessageSquare size={14} color="white" /></div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 border border-slate-200 max-w-[85%]"><p className="text-sm text-slate-700">{q.question}</p></div>
                  </div>
                  {answers[q.key] !== undefined && (
                    <div className="flex justify-end mb-2"><div className="rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%]" style={{ backgroundColor: ACCENT_LIGHT }}><p className="text-sm text-slate-700">{answers[q.key] || '（スキップ）'}</p></div></div>
                  )}
                </div>
              ))}
              {!isGenerating && interviewStep < QUESTIONS.length && !answers[QUESTIONS[interviewStep].key] && (
                <div className="flex gap-2 mt-4">
                  <input type="text" value={currentInput} onChange={(e) => setCurrentInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()} placeholder={QUESTIONS[interviewStep].placeholder} className="flex-1 px-3 py-3 text-sm border border-slate-300 rounded-xl min-h-12" />
                  <button onClick={handleSubmitAnswer} className="px-4 py-3 text-white text-sm font-bold rounded-xl min-h-12" style={{ backgroundColor: ACCENT }}>{interviewStep === QUESTIONS.length - 1 ? '生成' : '次へ'}</button>
                </div>
              )}
              {isGenerating && (<div className="text-center py-6"><Loader2 className="animate-spin mx-auto mb-3" size={30} style={{ color: ACCENT }} /><p className="text-sm font-bold text-slate-700">最強のプロフィールを構成中...</p></div>)}
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <div ref={chatEndRef} />
            </div>
          )}
          {result && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800">📍 GBPプロフィール文</h3>
                  <CopyButton text={result.profile.text} />
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{result.profile.text}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {result.profile.keywords.map((kw, i) => (<span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF5E0] text-[#6B9E2E] font-bold">#{kw}</span>))}
                </div>
                {result.profile.tips && <p className="text-xs text-slate-400 mt-3 italic">💡 {result.profile.tips}</p>}
              </div>
              {/* GBP反映ボタン */}
              {gbpConnected ? (
                <button
                  onClick={async () => {
                    setPublishStatus('publishing');
                    try {
                      const res = await fetch('/api/gbp/update-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profileText: result.profile.text }) });
                      const data = await res.json();
                      if (data.success) { setPublishStatus('done'); setPublishMessage('GBPプロフィールに反映しました！'); }
                      else { setPublishStatus('error'); setPublishMessage(data.error || '反映に失敗しました'); }
                    } catch { setPublishStatus('error'); setPublishMessage('通信エラーが発生しました'); }
                  }}
                  disabled={publishStatus === 'publishing'}
                  className="w-full py-3 text-white text-sm font-bold rounded-xl min-h-12 disabled:opacity-50 flex items-center justify-center gap-1"
                  style={{ backgroundColor: publishStatus === 'done' ? '#22c55e' : '#E53935' }}>
                  {publishStatus === 'publishing' ? <Loader2 className="animate-spin" size={16} /> : publishStatus === 'done' ? <><Check size={16} /> 反映完了！</> : <><MapPin size={14} /> GBPに反映する</>}
                </button>
              ) : (
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500">GBP連携が未設定です</p>
                  <p className="text-[10px] text-slate-400">管理者にGBP連携の設定を依頼してください</p>
                </div>
              )}
              {publishMessage && publishStatus === 'error' && <p className="text-xs text-red-500 text-center">{publishMessage}</p>}

              <button onClick={() => { setResult(null); setAnswers({}); setInterviewStep(0); setPublishStatus('idle'); setPublishMessage(''); }} className="w-full py-3 text-sm font-bold border border-slate-300 rounded-xl min-h-12 hover:bg-slate-50">もう一度作り直す</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Feature 5: GBP Post Generator (投稿テンプレート) ──────────────────────────

function GbpPostGenerator({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [postType, setPostType] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GbpPostResult | null>(null);
  const [error, setError] = useState('');

  const generate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/generate/gbp-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postType, businessName, businessType, topic }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || '生成に失敗しました'); return; }
      setResult({ post: data.post });
      setStep(3);
    } catch { setError('通信エラーが発生しました'); }
    finally { setIsGenerating(false); }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg"><ArrowLeft size={18} /></button>
        <div><p className="text-sm font-bold text-slate-800">GBP投稿テンプレート</p><p className="text-[10px] text-slate-400">MEOに強い投稿文をAIが作成</p></div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          {/* Step 1: 投稿タイプ選択 */}
          {step === 1 && (
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">どんな投稿を作りますか？</h2>
              <p className="text-xs text-slate-500 mb-4">投稿タイプを選んでください</p>
              <div className="grid grid-cols-2 gap-2">
                {GBP_POST_TYPES.map((pt) => (
                  <button key={pt.value} onClick={() => { setPostType(pt.value); setStep(2); }}
                    className="p-3 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 transition-all text-left min-h-[80px]">
                    <pt.icon size={20} className="mb-1.5" style={{ color: '#9C27B0' }} />
                    <p className="text-sm font-bold text-slate-700">{pt.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{pt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: 詳細入力 */}
          {step === 2 && (
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">{postType}の投稿を作成</h2>
              <p className="text-xs text-slate-500 mb-4">店舗情報を入力してください</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">店舗名</label>
                  <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="例: カフェ ひまわり" className="w-full px-3 py-3 text-sm border border-slate-300 rounded-xl min-h-12" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">業種</label>
                  <input type="text" value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="例: カフェ・喫茶店" className="w-full px-3 py-3 text-sm border border-slate-300 rounded-xl min-h-12" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">トピック（任意）</label>
                  <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="例: 新作いちごパフェ" className="w-full px-3 py-3 text-sm border border-slate-300 rounded-xl min-h-12" />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="px-4 py-3 text-sm text-slate-600 border border-slate-300 rounded-xl min-h-12 hover:bg-slate-50">戻る</button>
                  <button onClick={generate} disabled={isGenerating || !businessName.trim()} className="flex-1 py-3 text-white text-sm font-bold rounded-xl min-h-12 disabled:opacity-50" style={{ backgroundColor: ACCENT }}>
                    {isGenerating ? <Loader2 className="animate-spin mx-auto" size={18} /> : <>AIに作ってもらう <Sparkles className="inline ml-1" size={14} /></>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 結果 */}
          {step === 3 && result && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800">📝 {postType}</h3>
                  <CopyButton text={`${result.post.title}\n\n${result.post.body}\n\n${result.post.hashtags.join(' ')}`} />
                </div>
                <p className="text-base font-black text-slate-800 mb-2">{result.post.title}</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed mb-3">{result.post.body}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {result.post.hashtags.map((tag, i) => (<span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF5E0] text-[#6B9E2E] font-bold">{tag}</span>))}
                </div>
                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-bold text-slate-600">💡 CTA: {result.post.cta}</p>
                  <p className="text-xs text-slate-500">📸 {result.post.photoTip}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setStep(1); setResult(null); }} className="flex-1 py-3 text-sm font-bold border border-slate-300 rounded-xl min-h-12 hover:bg-slate-50">別の投稿を作る</button>
                <button onClick={() => { setResult(null); generate(); }} className="flex-1 py-3 text-sm font-bold text-white rounded-xl min-h-12" style={{ backgroundColor: ACCENT }}>再生成する</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function MainPage() {
  const [appState, setAppState] = useState<AppState>('login');
  const [paletteId, setPaletteId] = useState('');
  const [gbpConnected, setGbpConnected] = useState(false);
  const [lineConnected, setLineConnected] = useState(false);

  useEffect(() => {
    fetch('/api/main/session').then((r) => r.json()).then((data) => {
      if (data.authenticated && data.paletteId) {
        setPaletteId(data.paletteId);
        setAppState('dashboard');
        // 連携状態を取得
        fetch('/api/main/settings').then((r2) => r2.json()).then((s) => {
          setGbpConnected(!!s.gbpConnected);
          setLineConnected(!!s.lineConnected);
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const handleLogin = (id: string) => {
    setPaletteId(id);
    setAppState('dashboard');
    fetch('/api/main/settings').then((r) => r.json()).then((s) => {
      setGbpConnected(!!s.gbpConnected);
      setLineConnected(!!s.lineConnected);
    }).catch(() => {});
  };
  const handleLogout = async () => { await fetch('/api/logout', { method: 'POST' }); setPaletteId(''); setAppState('login'); };
  const goBack = () => setAppState('dashboard');

  if (appState === 'login') return <LoginPanel onLogin={handleLogin} />;
  if (appState === 'dashboard') return <Dashboard onNavigate={setAppState} onLogout={handleLogout} />;
  if (appState === 'coupon') return <CouponGenerator onBack={goBack} />;
  if (appState === 'banner') return <BannerCanvas onBack={goBack} />;
  if (appState === 'richmenu') return <RichMenuBuilder onBack={goBack} lineConnected={lineConnected} />;
  if (appState === 'gbp_profile') return <GbpProfileBuilder onBack={goBack} gbpConnected={gbpConnected} />;
  if (appState === 'gbp_post') return <GbpPostGenerator onBack={goBack} />;

  return null;
}
