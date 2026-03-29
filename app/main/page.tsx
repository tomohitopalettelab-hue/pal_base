"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Sparkles, Wand2, Download, ArrowLeft, LogOut, Loader2, Copy, Check,
  UtensilsCrossed, Scissors, Hammer, Building2, ShoppingBag, Heart,
  Image as ImageIcon, LayoutGrid, MapPin, ChevronRight,
  CalendarCheck, Phone, Ticket, MessageCircle, Instagram, Globe, Bell,
  Users, Store, Camera, Gift, HelpCircle, Mail, Plus, Palette, Share2,
  X, FileText, PenTool, Link2, Shuffle, Send,
} from 'lucide-react';
import { BANNER_TEMPLATES, COLOR_PALETTES, type BannerTemplate, type ColorPalette } from './banner-templates';
import { FLYER_SIZES, FLYER_TASTES, getFlyerTaste, getFlyerSize } from './flyer-templates';
import type { FlyerTaste } from './flyer-templates';
import { RICHMENU_ICONS } from './richmenu-icons';
import { RICHMENU_LAYOUTS, type RichMenuLayout } from './richmenu-layouts';

// ── Types ─────────────────────────────────────────────────────────────────────

type AppState = 'login' | 'dashboard' | 'coupon' | 'banner' | 'richmenu' | 'flyer';

type CouponResult = {
  hookTitle: string;
  description: string;
  conditions: string;
  validityPeriod: string;
  psychologyNote: string;
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
    { state: 'flyer' as AppState, icon: FileText, title: 'チラシ制作', desc: '写真1枚からプロのチラシを即作成', color: '#9C27B0' },
  ];

  const createMenuItems = [
    { state: 'coupon' as AppState, icon: Sparkles, label: 'クーポン' },
    { state: 'banner' as AppState, icon: ImageIcon, label: 'バナー画像' },
    { state: 'richmenu' as AppState, icon: LayoutGrid, label: 'リッチメニュー' },
    { state: 'flyer' as AppState, icon: FileText, label: 'チラシ' },
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

function CouponGenerator({ onBack, lineConnected, hasPalOpt, paletteId }: { onBack: () => void; lineConnected: boolean; hasPalOpt: boolean; paletteId: string }) {
  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [freeText, setFreeText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<CouponResult[]>([]);
  const [error, setError] = useState('');
  const [lineSendCoupon, setLineSendCoupon] = useState<CouponResult | null>(null);
  const [publishingIdx, setPublishingIdx] = useState<number | null>(null);
  const [publishResults, setPublishResults] = useState<Record<number, { success: boolean; message: string }>>({});
  const generateTriggered = useRef(false);

  const handlePublishCouponToOpt = async (coupon: CouponResult, idx: number) => {
    setPublishingIdx(idx);
    try {
      const copyText = `${coupon.hookTitle}\n${coupon.description}\n条件: ${coupon.conditions}\n有効期間: ${coupon.validityPeriod}`;
      const res = await fetch('/api/publish-to-opt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'coupon', copyText, paletteId }),
      });
      const data = await res.json();
      if (data.success) {
        setPublishResults((prev) => ({ ...prev, [idx]: { success: true, message: 'pal_opt に投稿が作成されました。' } }));
      } else {
        setPublishResults((prev) => ({ ...prev, [idx]: { success: false, message: data.error || '投稿に失敗しました' } }));
      }
    } catch {
      setPublishResults((prev) => ({ ...prev, [idx]: { success: false, message: '通信エラーが発生しました' } }));
    } finally {
      setPublishingIdx(null);
    }
  };

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
                      <div className="flex items-center gap-1">
                        <CopyButton text={`${r.hookTitle}\n${r.description}\n条件: ${r.conditions}\n有効期間: ${r.validityPeriod}`} />
                        <button onClick={() => setLineSendCoupon(r)}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-white transition-colors min-h-8 font-bold"
                          style={{ backgroundColor: '#06C755' }}>
                          <MessageCircle size={12} /> LINE送信
                        </button>
                        {hasPalOpt && (
                          <button onClick={() => handlePublishCouponToOpt(r, i)}
                            disabled={publishingIdx === i}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-white transition-colors min-h-8 font-bold disabled:opacity-50"
                            style={{ backgroundColor: '#F39800' }}>
                            {publishingIdx === i ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                            {publishingIdx === i ? '投稿中...' : '一括投稿'}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-base md:text-lg font-black text-slate-800 mb-2 leading-tight">{r.hookTitle}</p>
                    <p className="text-sm text-slate-600 mb-3">{r.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-600">📋 {r.conditions}</span>
                      <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-600">📅 {r.validityPeriod}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">💡 {r.psychologyNote}</p>
                    {publishResults[i] && (
                      <p className={`text-[10px] mt-2 ${publishResults[i].success ? 'text-green-600' : 'text-red-500'}`}>
                        {publishResults[i].message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => { setStep(1); setResults([]); generateTriggered.current = false; }}
                className="w-full mt-4 py-3 text-sm font-bold border border-slate-300 rounded-xl min-h-12 hover:bg-slate-50">もう一度作る</button>
            </div>
          )}
        </div>
      </div>

      {/* LINE Send Modal */}
      {lineSendCoupon && (
        <LineSendModal coupon={lineSendCoupon} onClose={() => setLineSendCoupon(null)} lineConnected={lineConnected} />
      )}
    </div>
  );
}

// ── Feature 2: Banner Canvas ──────────────────────────────────────────────────

function BannerCanvas({ onBack, hasPalOpt, paletteId }: { onBack: () => void; hasPalOpt: boolean; paletteId: string }) {
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
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string } | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const handlePublishToOpt = async () => {
    if (!bannerRef.current) return;
    setIsPublishing(true);
    setPublishResult(null);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(bannerRef.current, { scale: 2, useCORS: true });
      const imageBase64 = canvas.toDataURL('image/png');
      const res = await fetch('/api/publish-to-opt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, contentType: 'banner', copyText: `${mainCopy}\n${subCopy}`, paletteId }),
      });
      const data = await res.json();
      if (data.success) {
        setPublishResult({ success: true, message: 'pal_opt に投稿が作成されました。pal_opt で確認・投稿してください。' });
      } else {
        setPublishResult({ success: false, message: data.error || '投稿の作成に失敗しました' });
      }
    } catch {
      setPublishResult({ success: false, message: '通信エラーが発生しました' });
    } finally {
      setIsPublishing(false);
    }
  };

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
              {hasPalOpt && (
                <div>
                  <button onClick={handlePublishToOpt} disabled={isPublishing}
                    className="w-full flex items-center justify-center gap-2 py-3 text-white text-sm font-bold rounded-xl min-h-12 disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: '#F39800' }}>
                    {isPublishing ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                    {isPublishing ? '投稿作成中...' : '全メディアに一括投稿'}
                  </button>
                  {publishResult && (
                    <p className={`text-xs text-center mt-2 ${publishResult.success ? 'text-green-600' : 'text-red-500'}`}>
                      {publishResult.message}
                    </p>
                  )}
                </div>
              )}
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

// ── Feature 4: Flyer Builder ──────────────────────────────────────────────────

type FlyerTexts = {
  catchCopy: string;
  subCopy: string;
  bodyText: string;
  couponText: string;
  cta: string;
  period: string;
};

type FlyerFont = { id: string; name: string; family: string; preview: string };
const FLYER_FONTS: FlyerFont[] = [
  { id: 'gothic', name: 'ゴシック', family: '"Noto Sans JP", sans-serif', preview: 'Aa あ' },
  { id: 'mincho', name: '明朝', family: '"Noto Serif JP", serif', preview: 'Aa あ' },
  { id: 'maru', name: '丸ゴシック', family: '"Zen Maru Gothic", sans-serif', preview: 'Aa あ' },
  { id: 'rounded', name: 'ラウンド', family: '"M PLUS Rounded 1c", sans-serif', preview: 'Aa あ' },
  { id: 'shippori', name: '上品明朝', family: '"Shippori Mincho", serif', preview: 'Aa あ' },
  { id: 'zen', name: 'モダン', family: '"Zen Kaku Gothic New", sans-serif', preview: 'Aa あ' },
];

function FlyerBuilder({ onBack, savedQrCodes, dbIndustry, hasPalOpt, paletteId }: { onBack: () => void; savedQrCodes: { label: string; url: string }[]; dbIndustry: string; hasPalOpt: boolean; paletteId: string }) {
  const [step, setStep] = useState(1);
  const [selectedSize, setSelectedSize] = useState<(typeof FLYER_SIZES)[number]>(FLYER_SIZES[0]);
  const [selectedTaste, setSelectedTaste] = useState<FlyerTaste>(FLYER_TASTES[0]);
  const [selectedFont, setSelectedFont] = useState(FLYER_FONTS[0]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [businessType, setBusinessType] = useState(dbIndustry);
  const [keyword, setKeyword] = useState('');
  const [flyerPurpose, setFlyerPurpose] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isFlyerPublishing, setIsFlyerPublishing] = useState(false);
  const [flyerPublishResult, setFlyerPublishResult] = useState<{ success: boolean; message: string } | null>(null);
  const [texts, setTexts] = useState<FlyerTexts>({
    catchCopy: '', subCopy: '', bodyText: '', couponText: '', cta: '', period: '',
  });
  const [showQr, setShowQr] = useState(true);
  const [circlePhoto, setCirclePhoto] = useState<string | null>(null);
  const [showCirclePhoto, setShowCirclePhoto] = useState(false);
  const [shopInfo, setShopInfo] = useState({ name: '', phone: '', address: '', email: '' });
  const flyerRef = useRef<HTMLDivElement>(null);
  const generateTriggered = useRef(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCirclePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCirclePhoto(ev.target?.result as string); setShowCirclePhoto(true); };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/generate/flyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, businessType, purpose: flyerPurpose, taste: selectedTaste.id, size: selectedSize.id }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || '生成に失敗しました'); return; }
      setTexts({
        catchCopy: data.flyer?.catchCopy || 'キャッチコピー',
        subCopy: data.flyer?.subCopy || 'サブコピー',
        bodyText: data.flyer?.bodyText || '本文テキスト',
        couponText: data.flyer?.couponText || 'お得な特典',
        cta: data.flyer?.cta || '詳しくはこちら',
        period: data.flyer?.period || '期間限定',
      });
      setStep(4);
    } catch { setError('通信エラーが発生しました'); }
    finally { setIsGenerating(false); }
  };

  const handlePublishFlyerToOpt = async () => {
    if (!flyerRef.current) return;
    setIsFlyerPublishing(true);
    setFlyerPublishResult(null);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(flyerRef.current, { scale: 2, useCORS: true });
      const imageBase64 = canvas.toDataURL('image/png');
      const copyText = `${texts.catchCopy}\n${texts.subCopy}\n${texts.bodyText}`;
      const res = await fetch('/api/publish-to-opt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, contentType: 'flyer', copyText, paletteId }),
      });
      const data = await res.json();
      if (data.success) {
        setFlyerPublishResult({ success: true, message: 'pal_opt に投稿が作成されました。pal_opt で確認・投稿してください。' });
      } else {
        setFlyerPublishResult({ success: false, message: data.error || '投稿の作成に失敗しました' });
      }
    } catch {
      setFlyerPublishResult({ success: false, message: '通信エラーが発生しました' });
    } finally {
      setIsFlyerPublishing(false);
    }
  };

  // Calculate aspect ratio for canvas preview
  const aspectRatio = selectedSize.height / selectedSize.width;
  const canvasWidth = Math.min(500, typeof window !== 'undefined' ? window.innerWidth - 48 : 400);
  const canvasHeight = canvasWidth * aspectRatio;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg"><ArrowLeft size={18} /></button>
        <div><p className="text-sm font-bold text-slate-800">チラシ制作</p><p className="text-[10px] text-slate-400">写真1枚からプロのチラシを即作成</p></div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        <div className="max-w-lg mx-auto">

          {/* Step 1: Size & Taste Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">サイズとテイストを選択</h2>
              <p className="text-xs text-slate-500 mb-4">チラシの仕上がりイメージを決めましょう</p>

              <label className="text-xs font-bold text-slate-600 block mb-2">サイズ</label>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {FLYER_SIZES.map((s) => (
                  <button key={s.id} onClick={() => setSelectedSize(s)}
                    className={`p-3 rounded-xl border-2 transition-all text-left min-h-[72px] ${selectedSize.id === s.id ? 'border-[#8CC63F] bg-[#EBF5E0]' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <p className="text-sm font-bold text-slate-700">{s.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{s.desc}</p>
                  </button>
                ))}
              </div>

              <label className="text-xs font-bold text-slate-600 block mb-2">テイスト（雰囲気）</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
                {FLYER_TASTES.map((t) => (
                  <button key={t.id} onClick={() => setSelectedTaste(t)}
                    className={`p-3 rounded-xl border-2 transition-all text-left min-h-[72px] ${selectedTaste.id === t.id ? 'border-[#8CC63F] bg-[#EBF5E0]' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div className="flex gap-1 mb-1.5">
                      <span className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: t.colors.primary }} />
                      <span className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: t.colors.secondary }} />
                      <span className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: t.colors.accent }} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">{t.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>
                  </button>
                ))}
              </div>

              <button onClick={() => setStep(2)}
                className="w-full py-3 text-white text-sm font-bold rounded-xl min-h-12" style={{ backgroundColor: ACCENT }}>
                次へ <ChevronRight className="inline ml-1" size={14} />
              </button>
            </div>
          )}

          {/* Step 2: Photo Upload + Keyword */}
          {step === 2 && (
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">写真とキーワードを入力</h2>
              <p className="text-xs text-slate-500 mb-4">AIがチラシのコピーを自動生成します</p>

              <div className="space-y-4">
                {/* Photo upload */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">写真をアップロード</label>
                  {photo ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200" style={{ height: 180 }}>
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <label className="absolute bottom-2 right-2 flex items-center gap-1 px-3 py-1.5 bg-white/90 rounded-lg text-xs font-bold text-slate-700 cursor-pointer shadow-sm hover:bg-white">
                        <Camera size={12} /> 変更
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-colors">
                      <ImageIcon className="mb-2 text-slate-300" size={36} />
                      <p className="text-sm font-bold text-slate-500">写真を選択</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">タップして写真をアップロード</p>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Industry from DB */}
                {dbIndustry && (
                  <div className="flex items-center gap-2 p-3 bg-[#EBF5E0] rounded-xl">
                    <span className="text-xs font-bold text-[#6B9E2E]">業種:</span>
                    <span className="text-xs text-slate-700">{dbIndustry}</span>
                  </div>
                )}

                {/* Circle Photo */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">丸型写真（スタッフ・ロゴなど）</label>
                  <div className="flex items-center gap-3">
                    {circlePhoto ? (
                      <img src={circlePhoto} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-[#8CC63F]" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                        <Camera size={18} className="text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-[#8CC63F] border border-[#8CC63F] rounded-lg cursor-pointer hover:bg-[#EBF5E0] transition-colors">
                        <Camera size={12} /> {circlePhoto ? '写真を変更' : '写真を選択'}
                        <input type="file" accept="image/*" onChange={handleCirclePhotoUpload} className="hidden" />
                      </label>
                      {circlePhoto && (
                        <button onClick={() => { setCirclePhoto(null); setShowCirclePhoto(false); }}
                          className="ml-2 text-[10px] text-red-400 hover:underline">削除</button>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">チラシ中央に丸型で表示されます</p>
                    </div>
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">目的</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'open', label: 'オープン告知' },
                      { id: 'campaign', label: 'キャンペーン' },
                      { id: 'seasonal', label: '季節イベント' },
                      { id: 'new_menu', label: '新メニュー' },
                      { id: 'recruit', label: '求人・採用' },
                      { id: 'info', label: 'お知らせ' },
                    ].map((p) => (
                      <button key={p.id} onClick={() => setFlyerPurpose(flyerPurpose === p.id ? '' : p.id)}
                        className={`px-3 py-2 text-xs font-bold rounded-full border-2 transition-all min-h-9 ${flyerPurpose === p.id ? 'border-[#8CC63F] bg-[#EBF5E0] text-[#6B9E2E]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyword */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">キーワード</label>
                  <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="例: いちごフェア、春の新メニュー"
                    className="w-full px-3 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 min-h-12" />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="px-4 py-3 text-sm text-slate-600 border border-slate-300 rounded-xl min-h-12 hover:bg-slate-50">戻る</button>
                  <button onClick={() => { generateTriggered.current = false; setStep(3); }}
                    disabled={!keyword.trim()}
                    className="flex-1 py-3 text-white text-sm font-bold rounded-xl min-h-12 disabled:opacity-50" style={{ backgroundColor: ACCENT }}>
                    AIに作ってもらう <Sparkles className="inline ml-1" size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Generating */}
          {step === 3 && (() => {
            if (!generateTriggered.current && !isGenerating && !error) { generateTriggered.current = true; generate(); }
            return (
              <div className="text-center py-12">
                {isGenerating ? (
                  <><Loader2 className="animate-spin mx-auto mb-4" size={36} style={{ color: ACCENT }} />
                  <p className="text-sm font-bold text-slate-700">チラシのコピーを生成中...</p>
                  <p className="text-xs text-slate-400 mt-1">最適なキャッチコピーを考えています</p></>
                ) : error ? (
                  <><p className="text-sm text-red-500 mb-4">{error}</p>
                  <button onClick={() => { setError(''); generateTriggered.current = false; generate(); }} className="px-6 py-3 text-white text-sm font-bold rounded-xl min-h-12" style={{ backgroundColor: ACCENT }}>再試行する</button>
                  <button onClick={() => { setStep(2); generateTriggered.current = false; }} className="block mx-auto mt-3 text-xs text-slate-500">入力内容を修正する</button></>
                ) : <Loader2 className="animate-spin mx-auto" size={36} style={{ color: ACCENT }} />}
              </div>
            );
          })()}

          {/* Step 4: Flyer Canvas Editor */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-800 mb-1">チラシを編集</h2>
              <p className="text-xs text-slate-500 mb-2">テキストをタップして自由に編集できます</p>

              {/* Flyer Canvas — Professional Print Layout */}
              <div className="flex justify-center">
                <div ref={flyerRef}
                  style={{
                    width: canvasWidth, height: canvasHeight, position: 'relative', overflow: 'hidden',
                    backgroundColor: selectedTaste.colors.bg,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    fontFamily: selectedFont.family,
                  }}>
                  {/* ====== Left accent sidebar ====== */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: canvasWidth * 0.025, height: '100%',
                    background: `linear-gradient(180deg, ${selectedTaste.colors.accent} 0%, ${selectedTaste.colors.primary} 100%)`, zIndex: 10 }} />

                  {/* ====== HERO SECTION (top ~40%) — Photo + Diagonal cut ====== */}
                  <div style={{ position: 'relative', height: '40%', overflow: 'hidden' }}>
                    {photo && <img src={photo} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '120%', objectFit: 'cover' }} />}
                    {/* Dark gradient overlay */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      background: `linear-gradient(135deg, ${selectedTaste.colors.primary}CC 0%, transparent 50%, ${selectedTaste.colors.primary}99 100%)` }} />
                    {/* Bottom diagonal clip */}
                    <div style={{ position: 'absolute', bottom: -2, left: 0, width: '100%', height: canvasWidth * 0.08,
                      backgroundColor: selectedTaste.colors.bg,
                      clipPath: 'polygon(0 60%, 100% 0, 100% 100%, 0 100%)' }} />
                    {/* Top-right accent circle */}
                    <div style={{ position: 'absolute', top: -canvasWidth * 0.06, right: -canvasWidth * 0.06,
                      width: canvasWidth * 0.28, height: canvasWidth * 0.28, borderRadius: '50%',
                      backgroundColor: selectedTaste.colors.accent, opacity: 0.15 }} />
                    {/* Catch copy */}
                    <div style={{ position: 'absolute', bottom: canvasWidth * 0.08, left: canvasWidth * 0.07, right: canvasWidth * 0.05, zIndex: 2 }}>
                      {/* Accent line above catch */}
                      <div style={{ width: canvasWidth * 0.08, height: 3, backgroundColor: selectedTaste.colors.accent, marginBottom: canvasWidth * 0.02, borderRadius: 2 }} />
                      <input type="text" value={texts.catchCopy} onChange={(e) => setTexts({ ...texts, catchCopy: e.target.value })}
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFFFFF',
                          fontSize: `${canvasWidth * 0.065}px`, fontWeight: 900, width: '100%', letterSpacing: '0.03em',
                          lineHeight: 1.15, textShadow: '0 3px 12px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)',
                          overflow: 'hidden' }} />
                      <input type="text" value={texts.subCopy} onChange={(e) => setTexts({ ...texts, subCopy: e.target.value })}
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFFFFF',
                          fontSize: `${canvasWidth * 0.028}px`, fontWeight: 500, width: '100%', marginTop: canvasWidth * 0.012,
                          opacity: 0.9, letterSpacing: '0.03em', textShadow: '0 1px 6px rgba(0,0,0,0.3)' }} />
                    </div>
                  </div>

                  {/* ====== MIDDLE SECTION — 2-column: About + Shop Info ====== */}
                  <div style={{ position: 'relative', padding: `${canvasWidth * 0.03}px ${canvasWidth * 0.07}px ${canvasWidth * 0.015}px`,
                    backgroundColor: selectedTaste.colors.bg }}>
                    {/* Decorative dots pattern (top-right) */}
                    <div style={{ position: 'absolute', top: canvasWidth * 0.02, right: canvasWidth * 0.04, display: 'grid',
                      gridTemplateColumns: `repeat(4, ${canvasWidth * 0.012}px)`, gap: canvasWidth * 0.008 }}>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} style={{ width: canvasWidth * 0.005, height: canvasWidth * 0.005, borderRadius: '50%',
                          backgroundColor: selectedTaste.colors.accent, opacity: 0.2 }} />
                      ))}
                    </div>

                    {/* 2-column grid: Left=About, Right=CirclePhoto+Access */}
                    <div style={{ display: 'flex', gap: canvasWidth * 0.04 }}>
                      {/* Left: About (wider) */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: canvasWidth * 0.015, marginBottom: canvasWidth * 0.015 }}>
                          <div style={{ width: canvasWidth * 0.04, height: 2, backgroundColor: selectedTaste.colors.primary }} />
                          <span style={{ fontSize: `${canvasWidth * 0.017}px`, fontWeight: 700, color: selectedTaste.colors.primary,
                            letterSpacing: '0.2em' }}>ABOUT</span>
                          <div style={{ flex: 1, height: 1, backgroundColor: `${selectedTaste.colors.primary}22` }} />
                        </div>
                        <div contentEditable suppressContentEditableWarning
                          onBlur={(e) => setTexts({ ...texts, bodyText: e.currentTarget.innerText })}
                          style={{ background: 'transparent', border: 'none', outline: 'none',
                            color: selectedTaste.colors.text, fontSize: `${canvasWidth * 0.022}px`,
                            lineHeight: 2.0, width: '100%', letterSpacing: '0.02em',
                            paddingLeft: canvasWidth * 0.015, minHeight: canvasWidth * 0.12,
                            borderLeft: `3px solid ${selectedTaste.colors.accent}33`,
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word' as const }}>
                          {texts.bodyText}
                        </div>
                      </div>

                      {/* Right: Circle Photo + Access (stacked vertically) */}
                      {(showCirclePhoto && circlePhoto || shopInfo.name || shopInfo.phone || shopInfo.address || shopInfo.email) && (
                        <div style={{ width: '35%', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: canvasWidth * 0.02 }}>
                          {/* Circle Photo */}
                          {showCirclePhoto && circlePhoto && (
                            <div style={{ position: 'relative' }}>
                              <div style={{
                                width: canvasWidth * 0.2, height: canvasWidth * 0.2, borderRadius: '50%',
                                overflow: 'hidden', border: `3px solid ${selectedTaste.colors.accent}`,
                                boxShadow: `0 4px 16px ${selectedTaste.colors.primary}22`
                              }}>
                                <img src={circlePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div style={{
                                position: 'absolute', bottom: 0, right: 0,
                                width: canvasWidth * 0.05, height: canvasWidth * 0.05, borderRadius: '50%',
                                backgroundColor: selectedTaste.colors.accent, border: `2px solid ${selectedTaste.colors.bg}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                <span style={{ color: '#FFF', fontSize: `${canvasWidth * 0.018}px`, fontWeight: 900 }}>✦</span>
                              </div>
                            </div>
                          )}

                          {/* Access Info */}
                          {(shopInfo.name || shopInfo.phone || shopInfo.address || shopInfo.email) && (
                            <div style={{ width: '100%' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: canvasWidth * 0.01, marginBottom: canvasWidth * 0.01 }}>
                                <div style={{ width: canvasWidth * 0.03, height: 2, backgroundColor: selectedTaste.colors.accent }} />
                                <span style={{ fontSize: `${canvasWidth * 0.015}px`, fontWeight: 700, color: selectedTaste.colors.accent,
                                  letterSpacing: '0.15em' }}>ACCESS</span>
                              </div>
                              <div style={{ backgroundColor: `${selectedTaste.colors.primary}08`, borderRadius: 8,
                                padding: `${canvasWidth * 0.015}px`, border: `1px solid ${selectedTaste.colors.primary}15` }}>
                                {shopInfo.name && (
                                  <div style={{ fontSize: `${canvasWidth * 0.02}px`, fontWeight: 700, color: selectedTaste.colors.text,
                                    marginBottom: canvasWidth * 0.008, paddingBottom: canvasWidth * 0.006,
                                    borderBottom: `1px solid ${selectedTaste.colors.primary}15` }}>
                                    {shopInfo.name}
                                  </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: canvasWidth * 0.005 }}>
                                  {shopInfo.phone && (
                                    <div style={{ fontSize: `${canvasWidth * 0.016}px`, color: selectedTaste.colors.text }}>
                                      <span style={{ color: selectedTaste.colors.accent, fontWeight: 700, marginRight: canvasWidth * 0.006,
                                        fontSize: `${canvasWidth * 0.013}px` }}>TEL</span>
                                      {shopInfo.phone}
                                    </div>
                                  )}
                                  {shopInfo.email && (
                                    <div style={{ fontSize: `${canvasWidth * 0.013}px`, color: selectedTaste.colors.subText, wordBreak: 'break-all' as const }}>
                                      {shopInfo.email}
                                    </div>
                                  )}
                                  {shopInfo.address && (
                                    <div style={{ fontSize: `${canvasWidth * 0.013}px`, color: selectedTaste.colors.subText, marginTop: canvasWidth * 0.002 }}>
                                      {shopInfo.address}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ====== COUPON SECTION — Full-width banner style ====== */}
                  <div style={{ position: 'relative', margin: `${canvasWidth * 0.02}px ${canvasWidth * 0.05}px`,
                    overflow: 'hidden', borderRadius: selectedTaste.id === 'japanese' ? 2 : 16 }}>
                    {/* Coupon background */}
                    <div style={{
                      background: selectedTaste.id === 'pop'
                        ? `linear-gradient(135deg, ${selectedTaste.colors.primary} 0%, ${selectedTaste.colors.accent} 100%)`
                        : selectedTaste.id === 'elegant'
                        ? `linear-gradient(135deg, ${selectedTaste.colors.primary} 0%, #2A3F6A 100%)`
                        : selectedTaste.id === 'japanese'
                        ? selectedTaste.colors.primary
                        : `linear-gradient(135deg, ${selectedTaste.colors.primary} 0%, ${selectedTaste.colors.secondary} 100%)`,
                      padding: `${canvasWidth * 0.05}px ${canvasWidth * 0.06}px`,
                      textAlign: 'center', position: 'relative',
                    }}>
                      {/* Corner decorations */}
                      <div style={{ position: 'absolute', top: 0, right: 0, width: canvasWidth * 0.15, height: canvasWidth * 0.15,
                        borderRadius: '0 0 0 100%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, width: canvasWidth * 0.1, height: canvasWidth * 0.1,
                        borderRadius: '0 100% 0 0', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                      {/* Label */}
                      <div style={{ display: 'inline-block', border: '1px solid rgba(255,255,255,0.5)',
                        padding: `${canvasWidth * 0.006}px ${canvasWidth * 0.035}px`, borderRadius: 100,
                        marginBottom: canvasWidth * 0.015 }}>
                        <span style={{ fontSize: `${canvasWidth * 0.018}px`, fontWeight: 700, color: '#FFFFFF',
                          letterSpacing: '0.15em' }}>SPECIAL OFFER</span>
                      </div>
                      {/* Coupon text */}
                      <input type="text" value={texts.couponText} onChange={(e) => setTexts({ ...texts, couponText: e.target.value })}
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFFFFF',
                          fontSize: `${canvasWidth * 0.042}px`, fontWeight: 900, width: '100%', textAlign: 'center',
                          letterSpacing: '0.02em', display: 'block', overflow: 'hidden' }} />
                      {/* Divider */}
                      <div style={{ width: canvasWidth * 0.08, height: 2, backgroundColor: 'rgba(255,255,255,0.4)',
                        margin: `${canvasWidth * 0.012}px auto` }} />
                      {/* Period */}
                      <input type="text" value={texts.period} onChange={(e) => setTexts({ ...texts, period: e.target.value })}
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255,255,255,0.85)',
                          fontSize: `${canvasWidth * 0.022}px`, fontWeight: 500, width: '100%', textAlign: 'center',
                          display: 'block' }} />
                    </div>
                  </div>

                  {/* ====== FOOTER — QR Codes (from admin settings) ====== */}
                  {showQr && savedQrCodes.filter(q => q.url).length > 0 && (
                    <div style={{ marginTop: 'auto', position: 'relative' }}>
                      <div style={{ height: 3, background: `linear-gradient(90deg, ${selectedTaste.colors.accent}, ${selectedTaste.colors.primary}, ${selectedTaste.colors.accent})` }} />
                      <div style={{ backgroundColor: selectedTaste.colors.primary, padding: `${canvasWidth * 0.025}px ${canvasWidth * 0.05}px` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: canvasWidth * 0.04 }}>
                          {savedQrCodes.filter(q => q.url).map((qr, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: canvasWidth * 0.006 }}>
                              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qr.url)}&bgcolor=FFFFFF&color=${selectedTaste.colors.primary.replace('#','')}`}
                                alt={qr.label} style={{ width: canvasWidth * 0.13, height: canvasWidth * 0.13, borderRadius: 4, backgroundColor: '#FFF', padding: 3 }} />
                              <span style={{ color: '#FFFFFF', fontSize: `${canvasWidth * 0.018}px`, fontWeight: 600, letterSpacing: '0.04em' }}>{qr.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Taste palette switcher */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">テイストを変更</label>
                <div className="flex gap-2 flex-wrap">
                  {FLYER_TASTES.map((t) => (
                    <button key={t.id} onClick={() => setSelectedTaste(t)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border-2 transition-all min-h-10 ${selectedTaste.id === t.id ? 'border-[#8CC63F] bg-[#EBF5E0] font-bold' : 'border-slate-200 hover:border-slate-300'}`}>
                      <span className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: t.colors.primary }} />
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font selector */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">フォントを変更</label>
                <div className="grid grid-cols-3 gap-2">
                  {FLYER_FONTS.map((f) => (
                    <button key={f.id} onClick={() => setSelectedFont(f)}
                      className={`p-2.5 rounded-xl border-2 transition-all text-center min-h-[60px] ${selectedFont.id === f.id ? 'border-[#8CC63F] bg-[#EBF5E0]' : 'border-slate-200 hover:border-slate-300'}`}>
                      <span style={{ fontFamily: f.family, fontSize: 18, fontWeight: 700, color: '#333', display: 'block', lineHeight: 1.2 }}>{f.preview}</span>
                      <span className="text-[10px] text-slate-500 mt-1 block">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shop info */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">店舗情報</label>
                <div className="space-y-2">
                  <input type="text" value={shopInfo.name} onChange={(e) => setShopInfo({ ...shopInfo, name: e.target.value })}
                    placeholder="屋号名（例: カフェ ひまわり）" className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg min-h-9" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="tel" value={shopInfo.phone} onChange={(e) => setShopInfo({ ...shopInfo, phone: e.target.value })}
                      placeholder="電話番号" className="px-2 py-2 text-xs border border-slate-300 rounded-lg min-h-9" />
                    <input type="email" value={shopInfo.email} onChange={(e) => setShopInfo({ ...shopInfo, email: e.target.value })}
                      placeholder="メールアドレス" className="px-2 py-2 text-xs border border-slate-300 rounded-lg min-h-9" />
                  </div>
                  <input type="text" value={shopInfo.address} onChange={(e) => setShopInfo({ ...shopInfo, address: e.target.value })}
                    placeholder="住所（例: 兵庫県尼崎市小中島1-2-3）" className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg min-h-9" />
                </div>
              </div>

              {/* QR Code toggle */}
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-700">QRコード表示</p>
                  {savedQrCodes.filter(q => q.url).length > 0 ? (
                    <p className="text-[10px] text-slate-400">{savedQrCodes.filter(q => q.url).map(q => q.label).join('、')}</p>
                  ) : (
                    <p className="text-[10px] text-orange-400">管理者がQRコードを設定していません</p>
                  )}
                </div>
                {savedQrCodes.filter(q => q.url).length > 0 && (
                  <button onClick={() => setShowQr(!showQr)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${showQr ? 'bg-[#8CC63F]' : 'bg-slate-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${showQr ? 'left-[22px]' : 'left-[2px]'}`} />
                  </button>
                )}
              </div>

              {/* Circle Photo option */}
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  {circlePhoto ? (
                    <img src={circlePhoto} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-[#8CC63F]" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <Camera size={14} className="text-slate-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-700">丸型写真</p>
                    <p className="text-[10px] text-slate-400">スタッフ紹介・ロゴなど</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-[#8CC63F] font-bold cursor-pointer hover:underline">
                    {circlePhoto ? '変更' : '追加'}
                    <input type="file" accept="image/*" onChange={handleCirclePhotoUpload} className="hidden" />
                  </label>
                  {circlePhoto && (
                    <button onClick={() => setShowCirclePhoto(!showCirclePhoto)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${showCirclePhoto ? 'bg-[#8CC63F]' : 'bg-slate-300'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${showCirclePhoto ? 'left-[22px]' : 'left-[2px]'}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <label className="flex items-center justify-center gap-1 px-3 py-3 text-sm text-slate-600 border border-slate-300 rounded-xl cursor-pointer min-h-12 hover:bg-slate-50">
                  <Camera size={14} /> 背景写真を変更
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                <button onClick={() => { generateTriggered.current = false; setStep(3); }}
                  className="flex items-center justify-center gap-1 px-3 py-3 text-sm text-slate-600 border border-slate-300 rounded-xl min-h-12 hover:bg-slate-50">
                  <Wand2 size={14} /> テキスト再生成
                </button>
              </div>
              <button onClick={() => shareOrDownload(flyerRef, `flyer-${selectedSize.id}-${selectedTaste.id}-${Date.now()}.png`)}
                className="w-full flex items-center justify-center gap-1 py-3 text-white text-sm font-bold rounded-xl min-h-12" style={{ backgroundColor: ACCENT }}>
                <Download size={14} /> 保存する
              </button>
              {hasPalOpt && (
                <div>
                  <button onClick={handlePublishFlyerToOpt} disabled={isFlyerPublishing}
                    className="w-full flex items-center justify-center gap-2 py-3 text-white text-sm font-bold rounded-xl min-h-12 disabled:opacity-50 transition-colors mt-2"
                    style={{ backgroundColor: '#F39800' }}>
                    {isFlyerPublishing ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                    {isFlyerPublishing ? '投稿作成中...' : '全メディアに一括投稿'}
                  </button>
                  {flyerPublishResult && (
                    <p className={`text-xs text-center mt-2 ${flyerPublishResult.success ? 'text-green-600' : 'text-red-500'}`}>
                      {flyerPublishResult.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── LINE Send Modal ───────────────────────────────────────────────────────────

function LineSendModal({ coupon, onClose, lineConnected }: { coupon: CouponResult; onClose: () => void; lineConnected: boolean }) {
  const [selectedTaste, setSelectedTaste] = useState(FLYER_TASTES[0]);
  const [sendMode, setSendMode] = useState<'broadcast' | 'push'>('broadcast');
  const [userIds, setUserIds] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSend = async () => {
    setIsSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/line/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: sendMode,
          userIds: sendMode === 'push' ? userIds.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
          coupon: {
            hookTitle: coupon.hookTitle,
            description: coupon.description,
            conditions: coupon.conditions,
            validityPeriod: coupon.validityPeriod,
          },
          taste: selectedTaste.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ success: true, message: '送信が完了しました！' });
      } else {
        setResult({ success: false, message: data.error || '送信に失敗しました' });
      }
    } catch {
      setResult({ success: false, message: '通信エラーが発生しました' });
    } finally { setIsSending(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 pb-8 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-slate-800">LINEでクーポンを送信</p>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X size={16} /></button>
        </div>

        {!lineConnected ? (
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <MessageCircle size={24} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">LINE連携が未設定です</p>
            <p className="text-xs text-slate-400 mt-1">管理者に設定を依頼してください</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Taste selection */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-2">デザインテイスト</label>
              <div className="flex gap-2 flex-wrap">
                {FLYER_TASTES.map((t) => (
                  <button key={t.id} onClick={() => setSelectedTaste(t)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] rounded-lg border-2 transition-all ${selectedTaste.id === t.id ? 'border-[#8CC63F] bg-[#EBF5E0] font-bold' : 'border-slate-200 hover:border-slate-300'}`}>
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.colors.primary }} />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mini preview */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-2">プレビュー</label>
              <div className="rounded-xl overflow-hidden border border-slate-200" style={{ backgroundColor: selectedTaste.colors.bg }}>
                <div style={{ ...selectedTaste.headerStyle, padding: '12px 16px' }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: selectedTaste.headerStyle.color as string }}>{coupon.hookTitle}</p>
                </div>
                <div style={{ padding: '10px 16px', backgroundColor: selectedTaste.colors.bg }}>
                  <p style={{ fontSize: 11, color: selectedTaste.colors.text, lineHeight: 1.6 }}>{coupon.description}</p>
                </div>
                <div style={{ ...selectedTaste.couponStyle, padding: '10px 16px', margin: '0 12px 8px', fontSize: 11 }}>
                  <p>📋 {coupon.conditions}</p>
                  <p className="mt-0.5">📅 {coupon.validityPeriod}</p>
                </div>
                <div style={{ ...selectedTaste.footerStyle, padding: '8px 16px', fontSize: 10 }}>
                  <p>詳しくはタップ ▶</p>
                </div>
              </div>
            </div>

            {/* Send target */}
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-2">送信先</label>
              <div className="space-y-2">
                <button onClick={() => setSendMode('broadcast')}
                  className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all min-h-12 ${sendMode === 'broadcast' ? 'border-[#8CC63F] bg-[#EBF5E0] font-bold' : 'border-slate-200 hover:border-slate-300'}`}>
                  <span className="flex items-center gap-2"><Users size={14} /> 全員に送信（ブロードキャスト）</span>
                </button>
                <button onClick={() => setSendMode('push')}
                  className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all min-h-12 ${sendMode === 'push' ? 'border-[#8CC63F] bg-[#EBF5E0] font-bold' : 'border-slate-200 hover:border-slate-300'}`}>
                  <span className="flex items-center gap-2"><MessageCircle size={14} /> 個別に送信</span>
                </button>
              </div>
              {sendMode === 'push' && (
                <div className="mt-2">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">ユーザーID（カンマ区切り）</label>
                  <input type="text" value={userIds} onChange={(e) => setUserIds(e.target.value)}
                    placeholder="U1234..., U5678..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl min-h-10" />
                </div>
              )}
            </div>

            {/* Result message */}
            {result && (
              <div className={`rounded-xl p-3 text-center text-sm ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {result.message}
              </div>
            )}

            {/* Send button */}
            <button onClick={handleSend}
              disabled={isSending || (sendMode === 'push' && !userIds.trim())}
              className="w-full py-3 text-white text-sm font-bold rounded-xl min-h-12 disabled:opacity-50 flex items-center justify-center gap-1"
              style={{ backgroundColor: '#06C755' }}>
              {isSending ? <Loader2 className="animate-spin" size={16} /> : <><MessageCircle size={14} /> 送信する</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function MainPage() {
  const [appState, setAppState] = useState<AppState>('login');
  const [paletteId, setPaletteId] = useState('');
  const [lineConnected, setLineConnected] = useState(false);
  const [savedQrCodes, setSavedQrCodes] = useState<{ label: string; url: string }[]>([]);
  const [industry, setIndustry] = useState('');
  const [hasPalOpt, setHasPalOpt] = useState(false);

  const loadSettings = () => {
    fetch('/api/main/settings').then((r) => r.json()).then((s) => {
      setLineConnected(!!s.lineConnected);
      setSavedQrCodes(s.qrCodes || []);
      setIndustry(s.industry || '');
    }).catch(() => {});
  };

  const checkPalOpt = (id: string) => {
    fetch(`/api/check-pal-opt?paletteId=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data) => { setHasPalOpt(Boolean(data?.hasPalOpt)); })
      .catch(() => { setHasPalOpt(false); });
  };

  useEffect(() => {
    fetch('/api/main/session').then((r) => r.json()).then((data) => {
      if (data.authenticated && data.paletteId) {
        setPaletteId(data.paletteId);
        setAppState('dashboard');
        loadSettings();
        checkPalOpt(data.paletteId);
      }
    }).catch(() => {});
  }, []);

  const handleLogin = (id: string) => {
    setPaletteId(id);
    setAppState('dashboard');
    loadSettings();
    checkPalOpt(id);
  };
  const handleLogout = async () => { await fetch('/api/logout', { method: 'POST' }); setPaletteId(''); setAppState('login'); };
  const goBack = () => setAppState('dashboard');

  if (appState === 'login') return <LoginPanel onLogin={handleLogin} />;
  if (appState === 'dashboard') return <Dashboard onNavigate={setAppState} onLogout={handleLogout} />;
  if (appState === 'coupon') return <CouponGenerator onBack={goBack} lineConnected={lineConnected} hasPalOpt={hasPalOpt} paletteId={paletteId} />;
  if (appState === 'banner') return <BannerCanvas onBack={goBack} hasPalOpt={hasPalOpt} paletteId={paletteId} />;
  if (appState === 'richmenu') return <RichMenuBuilder onBack={goBack} lineConnected={lineConnected} />;
  if (appState === 'flyer') return <FlyerBuilder onBack={goBack} savedQrCodes={savedQrCodes} dbIndustry={industry} hasPalOpt={hasPalOpt} paletteId={paletteId} />;

  return null;
}
