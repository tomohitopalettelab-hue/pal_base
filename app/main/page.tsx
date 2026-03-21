"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Sparkles, Wand2, Download, ArrowLeft, LogOut, Loader2, Copy, Check,
  UtensilsCrossed, Scissors, Hammer, Building2, ShoppingBag, Heart,
  Image as ImageIcon, LayoutGrid, MessageSquare, MapPin, ChevronRight,
  CalendarCheck, Phone, Ticket, MessageCircle, Instagram, Globe, Bell,
  Users, Store, Camera, Gift, HelpCircle, Mail, Plus, Trash2, Palette,
  X, Type, ZoomIn, ZoomOut,
} from 'lucide-react';
import { BANNER_TEMPLATES, COLOR_PALETTES, type BannerTemplate, type ColorPalette } from './banner-templates';
import { RICHMENU_ICONS, type RichMenuIconDef } from './richmenu-icons';
import { RICHMENU_LAYOUTS, type RichMenuLayout } from './richmenu-layouts';

// ── Types ─────────────────────────────────────────────────────────────────────

type AppState = 'login' | 'dashboard' | 'coupon' | 'banner' | 'richmenu' | 'gbp_profile';

type CouponResult = {
  hookTitle: string;
  description: string;
  conditions: string;
  validityPeriod: string;
  psychologyNote: string;
};

type BannerTextResult = {
  mainCopy: string;
  subCopy: string;
  ctaText: string;
  colorSuggestion: string;
};

type GbpProfileResult = {
  profile: { text: string; keywords: string[]; tips: string };
  postTemplates: { type: string; title: string; body: string; photoTip: string }[];
};

type RichMenuCell = {
  iconId: string;
  label: string;
  url: string;
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
      if (!res.ok || !data?.success) {
        setError(data?.error || 'ログインに失敗しました。');
        return;
      }
      onLogin(data.paletteId);
    } catch {
      setError('通信エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
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
            className="w-full px-3 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 min-h-12" style={{ focusRingColor: ACCENT } as React.CSSProperties} />
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
  const features = [
    { state: 'coupon' as AppState, icon: Sparkles, title: 'クーポン・ジェネレーター', desc: '心理学ベースの「指が動く」クーポンをAI生成', color: '#8CC63F' },
    { state: 'banner' as AppState, icon: ImageIcon, title: 'バナー自動キャンバス', desc: '写真1枚からGBP・LINE用バナーを即作成', color: '#F39800' },
    { state: 'richmenu' as AppState, icon: LayoutGrid, title: 'リッチメニュー・ビルダー', desc: 'LINEのリッチメニューをかんたんデザイン', color: '#2196F3' },
    { state: 'gbp_profile' as AppState, icon: MessageSquare, title: 'GBPプロフィール構成', desc: 'Googleマップで選ばれる最強プロフィール', color: '#E53935' },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
            <span className="text-white text-xs font-black">PB</span>
          </div>
          <span className="text-sm font-black text-slate-800">Pal Base</span>
        </div>
        <button onClick={onLogout} className="text-slate-400 hover:text-slate-600 p-2">
          <LogOut size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 mb-1">今日は何を作りますか？</h1>
            <p className="text-xs md:text-sm text-slate-500">センス不要。5分でプロの販促物ができます</p>
          </div>

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
          {/* Step 1: 業種選択 */}
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

          {/* Step 2: 目的・詳細 */}
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
                  <button onClick={() => setStep(3)} className="flex-1 py-3 text-white text-sm font-bold rounded-xl min-h-12"
                    style={{ backgroundColor: ACCENT }}>
                    AIに提案してもらう <Sparkles className="inline ml-1" size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 生成中（自動開始） */}
          {step === 3 && (() => {
            if (!generateTriggered.current && !isGenerating && !error) {
              generateTriggered.current = true;
              generate();
            }
            return (
              <div className="text-center py-12">
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin mx-auto mb-4" size={36} style={{ color: ACCENT }} />
                    <p className="text-sm font-bold text-slate-700">AIが最高のクーポンを考案中...</p>
                    <p className="text-xs text-slate-400 mt-1">心理学に基づいた3パターンを生成しています</p>
                  </>
                ) : error ? (
                  <>
                    <p className="text-sm text-red-500 mb-4">{error}</p>
                    <button onClick={() => { setError(''); generateTriggered.current = false; generate(); }}
                      className="px-6 py-3 text-white text-sm font-bold rounded-xl min-h-12"
                      style={{ backgroundColor: ACCENT }}>
                      再試行する
                    </button>
                    <button onClick={() => { setStep(2); generateTriggered.current = false; }}
                      className="block mx-auto mt-3 text-xs text-slate-500 hover:text-slate-700">
                      入力内容を修正する
                    </button>
                  </>
                ) : (
                  <Loader2 className="animate-spin mx-auto" size={36} style={{ color: ACCENT }} />
                )}
              </div>
            );
          })()}

          {/* Step 4: 結果表示 */}
          {step === 4 && (
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">3つのクーポン案ができました！</h2>
              <p className="text-xs text-slate-500 mb-4">気に入ったものをコピーして使えます</p>
              <div className="space-y-4">
                {results.map((r, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: ACCENT }}>
                        パターン {i + 1}
                      </span>
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
              <div className="mt-4 flex gap-2">
                <button onClick={() => { setStep(1); setResults([]); }}
                  className="flex-1 py-3 text-sm font-bold border border-slate-300 rounded-xl min-h-12 hover:bg-slate-50">
                  もう一度作る
                </button>
              </div>
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
      const res = await fetch('/api/generate/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });
      const data = await res.json();
      if (data.success && data.banners?.length) {
        const b = data.banners[0] as BannerTextResult;
        setMainCopy(b.mainCopy);
        setSubCopy(b.subCopy);
        setCtaText(b.ctaText);
      }
    } catch { /* ignore */ }
    finally { setIsGenerating(false); }
  };

  const downloadBanner = async () => {
    if (!bannerRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(bannerRef.current, { scale: 2, useCORS: true });
    const link = document.createElement('a');
    link.download = `banner-${sizeMode}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const previewW = sizeMode === 'square' ? 320 : 400;
  const previewH = sizeMode === 'square' ? 320 : 209;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg"><ArrowLeft size={18} /></button>
        <div>
          <p className="text-sm font-bold text-slate-800">バナー自動キャンバス</p>
          <p className="text-[10px] text-slate-400">写真1枚からプロ級バナーを作成</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: 写真アップロード */}
          {step === 1 && (
            <div className="text-center py-8">
              <ImageIcon className="mx-auto mb-4 text-slate-300" size={48} />
              <h2 className="text-base font-bold text-slate-800 mb-1">写真をアップロード</h2>
              <p className="text-xs text-slate-500 mb-6">お店の写真1枚から映えるバナーを作成します</p>
              <label className="inline-flex items-center gap-2 px-6 py-3 text-white text-sm font-bold rounded-xl cursor-pointer min-h-12"
                style={{ backgroundColor: ACCENT }}>
                <Plus size={16} /> 写真を選択
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* Step 2: テンプレート＋編集 */}
          {step >= 2 && (
            <div className="space-y-5">
              {/* サイズ切替 */}
              <div className="flex gap-2">
                {(['square', 'wide'] as const).map((s) => (
                  <button key={s} onClick={() => setSizeMode(s)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 transition-all min-h-10 ${sizeMode === s ? 'border-[#8CC63F] bg-[#EBF5E0]' : 'border-slate-200'}`}>
                    {s === 'square' ? '正方形 (GBP)' : '横長 (LINE)'}
                  </button>
                ))}
              </div>

              {/* バナープレビュー */}
              <div className="flex justify-center">
                <div ref={bannerRef}
                  style={{ width: previewW, height: previewH, position: 'relative', overflow: 'hidden', borderRadius: 12, background: '#eee' }}>
                  {photo && <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />}
                  {/* Overlay */}
                  {selectedTemplate.overlayPosition === 'bottom-band' && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px',
                      backgroundColor: selectedPalette.primary, opacity: selectedTemplate.overlayStyle.opacity }}>
                      <p style={{ color: selectedPalette.text, fontSize: 20, fontWeight: 900, lineHeight: 1.2 }}>{mainCopy}</p>
                      <p style={{ color: selectedPalette.text, fontSize: 12, marginTop: 4, opacity: 0.9 }}>{subCopy}</p>
                      {ctaText && <span style={{ display: 'inline-block', marginTop: 8, padding: '4px 12px', backgroundColor: selectedPalette.text,
                        color: selectedPalette.primary, fontSize: 10, fontWeight: 700, borderRadius: 20 }}>{ctaText}</span>}
                    </div>
                  )}
                  {selectedTemplate.overlayPosition === 'top-band' && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 20px',
                      backgroundColor: selectedPalette.primary, opacity: selectedTemplate.overlayStyle.opacity }}>
                      <p style={{ color: selectedPalette.text, fontSize: 20, fontWeight: 900, lineHeight: 1.2 }}>{mainCopy}</p>
                      <p style={{ color: selectedPalette.text, fontSize: 12, marginTop: 4, opacity: 0.9 }}>{subCopy}</p>
                    </div>
                  )}
                  {selectedTemplate.overlayPosition === 'center-overlay' && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', padding: '20px 28px',
                      backgroundColor: selectedPalette.primary, opacity: selectedTemplate.overlayStyle.opacity, borderRadius: 12, textAlign: 'center' }}>
                      <p style={{ color: selectedPalette.text, fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>{mainCopy}</p>
                      <p style={{ color: selectedPalette.text, fontSize: 12, marginTop: 6, opacity: 0.9 }}>{subCopy}</p>
                      {ctaText && <span style={{ display: 'inline-block', marginTop: 10, padding: '5px 14px', backgroundColor: selectedPalette.text,
                        color: selectedPalette.primary, fontSize: 10, fontWeight: 700, borderRadius: 20 }}>{ctaText}</span>}
                    </div>
                  )}
                  {selectedTemplate.overlayPosition === 'side-panel' && (
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '45%', height: '100%', padding: '20px 16px',
                      backgroundColor: selectedPalette.primary, opacity: selectedTemplate.overlayStyle.opacity,
                      display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <p style={{ color: selectedPalette.text, fontSize: 18, fontWeight: 900, lineHeight: 1.3 }}>{mainCopy}</p>
                      <p style={{ color: selectedPalette.text, fontSize: 11, marginTop: 6, opacity: 0.9 }}>{subCopy}</p>
                      {ctaText && <span style={{ display: 'inline-block', marginTop: 10, padding: '5px 12px', backgroundColor: selectedPalette.text,
                        color: selectedPalette.primary, fontSize: 10, fontWeight: 700, borderRadius: 20, alignSelf: 'flex-start' }}>{ctaText}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* テンプレート選択 */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">テンプレート</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {BANNER_TEMPLATES.map((t) => (
                    <button key={t.id} onClick={() => setSelectedTemplate(t)}
                      className={`flex-shrink-0 px-3 py-2 text-xs rounded-xl border-2 transition-all min-h-10 ${selectedTemplate.id === t.id ? 'border-[#8CC63F] bg-[#EBF5E0] font-bold' : 'border-slate-200 hover:border-slate-300'}`}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* カラーパレット */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">カラーパレット</label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_PALETTES.map((p) => (
                    <button key={p.id} onClick={() => setSelectedPalette(p)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-xl border-2 transition-all min-h-10 ${selectedPalette.id === p.id ? 'border-[#8CC63F] bg-[#EBF5E0] font-bold' : 'border-slate-200 hover:border-slate-300'}`}>
                      <span className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: p.primary }} />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI テキスト生成 */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">AIにテキストを考えてもらう</label>
                <div className="flex gap-2">
                  <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="例: いちごフェア"
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 min-h-12" />
                  <button onClick={generateTexts} disabled={isGenerating || !keyword.trim()}
                    className="px-4 py-2 text-white text-xs font-bold rounded-xl min-h-12 disabled:opacity-50"
                    style={{ backgroundColor: ACCENT }}>
                    {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                  </button>
                </div>
              </div>

              {/* テキスト編集 */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">メインコピー</label>
                  <input type="text" value={mainCopy} onChange={(e) => setMainCopy(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 min-h-12" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">サブコピー</label>
                  <input type="text" value={subCopy} onChange={(e) => setSubCopy(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 min-h-12" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">CTAボタン</label>
                  <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 min-h-12" />
                </div>
              </div>

              {/* 写真変更 & ダウンロード */}
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-1 py-3 text-sm text-slate-600 border border-slate-300 rounded-xl cursor-pointer min-h-12 hover:bg-slate-50">
                  <ImageIcon size={14} /> 写真を変更
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                <button onClick={downloadBanner}
                  className="flex-1 flex items-center justify-center gap-1 py-3 text-white text-sm font-bold rounded-xl min-h-12"
                  style={{ backgroundColor: ACCENT }}>
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

// ── Feature 3: Rich Menu Builder ──────────────────────────────────────────────

function RichMenuBuilder({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedLayout, setSelectedLayout] = useState<RichMenuLayout>(RICHMENU_LAYOUTS[0]);
  const [cells, setCells] = useState<RichMenuCell[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [bgColor, setBgColor] = useState('#8CC63F');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const menuRef = useRef<HTMLDivElement>(null);

  const initCells = useCallback((layout: RichMenuLayout) => {
    setCells(layout.areas.map(() => ({ iconId: '', label: '', url: '' })));
  }, []);

  useEffect(() => { initCells(selectedLayout); }, [selectedLayout, initCells]);

  const updateCell = (idx: number, updates: Partial<RichMenuCell>) => {
    setCells((prev) => prev.map((c, i) => i === idx ? { ...c, ...updates } : c));
  };

  const getIconComponent = (iconId: string) => {
    const def = RICHMENU_ICONS.find((ic) => ic.id === iconId);
    if (!def) return null;
    const Comp = LUCIDE_ICON_MAP[def.lucideIcon];
    return Comp || null;
  };

  const downloadMenu = async () => {
    if (!menuRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(menuRef.current, { scale: 2 });
    const link = document.createElement('a');
    link.download = `richmenu-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg"><ArrowLeft size={18} /></button>
        <div>
          <p className="text-sm font-bold text-slate-800">リッチメニュー・ビルダー</p>
          <p className="text-[10px] text-slate-400">LINEリッチメニューをかんたん作成</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        <div className="max-w-lg mx-auto space-y-5">
          {/* Step 1: レイアウト選択 */}
          {step === 1 && (
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">レイアウトを選択</h2>
              <p className="text-xs text-slate-500 mb-4">ボタンの配置パターンを選んでください</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {RICHMENU_LAYOUTS.map((layout) => (
                  <button key={layout.id} onClick={() => { setSelectedLayout(layout); setStep(2); }}
                    className={`p-3 rounded-xl border-2 transition-all text-center min-h-[90px] ${selectedLayout.id === layout.id ? 'border-[#8CC63F] bg-[#EBF5E0]' : 'border-slate-200 hover:border-slate-300'}`}>
                    {/* Mini preview grid */}
                    <div className="mx-auto mb-2 w-16 h-10 border border-slate-300 rounded overflow-hidden" style={{
                      display: 'grid', gridTemplateColumns: `repeat(${layout.cols}, 1fr)`, gridTemplateRows: `repeat(${layout.rows}, 1fr)`, gap: 1,
                    }}>
                      {layout.areas.map((a, i) => (
                        <div key={i} style={{ gridColumn: `${a.x + 1} / span ${a.w}`, gridRow: `${a.y + 1} / span ${a.h}`,
                          backgroundColor: ACCENT + '40', borderRadius: 2 }} />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-slate-700">{layout.name}</p>
                    <p className="text-[10px] text-slate-400">{layout.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: セル編集 */}
          {step >= 2 && (
            <>
              {/* プレビュー */}
              <div className="flex justify-center">
                <div ref={menuRef}
                  style={{ width: 340, height: selectedLayout.rows === 1 ? 113 : 226, display: 'grid',
                    gridTemplateColumns: `repeat(${selectedLayout.cols}, 1fr)`, gridTemplateRows: `repeat(${selectedLayout.rows}, 1fr)`,
                    gap: 2, backgroundColor: bgColor, borderRadius: 12, padding: 2, overflow: 'hidden' }}>
                  {selectedLayout.areas.map((area, idx) => {
                    const cell = cells[idx];
                    const IconComp = cell?.iconId ? getIconComponent(cell.iconId) : null;
                    return (
                      <div key={idx} onClick={() => setEditingIdx(idx)}
                        style={{ gridColumn: `${area.x + 1} / span ${area.w}`, gridRow: `${area.y + 1} / span ${area.h}`,
                          backgroundColor: bgColor, display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', cursor: 'pointer', borderRadius: 8, border: editingIdx === idx ? '2px solid white' : '1px solid rgba(255,255,255,0.2)' }}>
                        {IconComp ? <IconComp size={24} color={textColor} /> : <Plus size={20} color={textColor} className="opacity-40" />}
                        <span style={{ color: textColor, fontSize: 10, marginTop: 4, fontWeight: 700 }}>
                          {cell?.label || 'タップで編集'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* セル編集パネル */}
              {editingIdx !== null && cells[editingIdx] && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-700">ボタン {editingIdx + 1} を編集</p>
                    <button onClick={() => setEditingIdx(null)} className="p-1 hover:bg-slate-100 rounded"><X size={14} /></button>
                  </div>
                  {/* Icon selector */}
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
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">ラベル</label>
                      <input type="text" value={cells[editingIdx].label} onChange={(e) => updateCell(editingIdx, { label: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl min-h-10" placeholder="表示名" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">リンクURL</label>
                      <input type="text" value={cells[editingIdx].url} onChange={(e) => updateCell(editingIdx, { url: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl min-h-10" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              )}

              {/* カラー設定 */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-600 block mb-1">背景色</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded border-0 cursor-pointer" />
                    <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded-lg min-h-10" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-600 block mb-1">文字色</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 rounded border-0 cursor-pointer" />
                    <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded-lg min-h-10" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 text-sm text-slate-600 border border-slate-300 rounded-xl min-h-12 hover:bg-slate-50">
                  レイアウト変更
                </button>
                <button onClick={downloadMenu} className="flex-1 flex items-center justify-center gap-1 py-3 text-white text-sm font-bold rounded-xl min-h-12"
                  style={{ backgroundColor: ACCENT }}>
                  <Download size={14} /> 保存する
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Feature 4: GBP Profile Builder ────────────────────────────────────────────

function GbpProfileBuilder({ onBack }: { onBack: () => void }) {
  const [interviewStep, setInterviewStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GbpProfileResult | null>(null);
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const QUESTIONS = [
    { key: 'businessType', question: 'お店のジャンルを教えてください', placeholder: '例: イタリアンレストラン' },
    { key: 'businessName', question: 'お店の名前を教えてください', placeholder: '例: トラットリア ○○' },
    { key: 'strength', question: '一番のこだわりは何ですか？', placeholder: '例: 自家製生パスタと地元野菜' },
    { key: 'targetCustomer', question: 'どんなお客様に来てほしいですか？', placeholder: '例: 記念日デートのカップル' },
    { key: 'areaFeature', question: 'お店のある地域の特徴は？', placeholder: '例: ○○駅から徒歩3分、商店街の中' },
    { key: 'message', question: '最後に、何か伝えたいメッセージはありますか？', placeholder: '自由にどうぞ（スキップもOK）' },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interviewStep, result]);

  const handleSubmitAnswer = () => {
    const q = QUESTIONS[interviewStep];
    const val = currentInput.trim();
    if (!val && interviewStep < 2) return; // 最初の2問は必須
    setAnswers((prev) => ({ ...prev, [q.key]: val }));
    setCurrentInput('');
    if (interviewStep < QUESTIONS.length - 1) {
      setInterviewStep(interviewStep + 1);
    } else {
      generateProfile({ ...answers, [q.key]: val });
    }
  };

  const generateProfile = async (allAnswers: Record<string, string>) => {
    setIsGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/generate/gbp-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allAnswers),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || '生成に失敗しました'); return; }
      setResult({ profile: data.profile, postTemplates: data.postTemplates });
    } catch { setError('通信エラーが発生しました'); }
    finally { setIsGenerating(false); }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg"><ArrowLeft size={18} /></button>
        <div>
          <p className="text-sm font-bold text-slate-800">GBP プロフィール構成</p>
          <p className="text-[10px] text-slate-400">Googleマップで選ばれるプロフィール</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          {/* Chat interview */}
          {!result && (
            <div className="space-y-3">
              {QUESTIONS.slice(0, interviewStep + 1).map((q, idx) => (
                <div key={q.key}>
                  {/* AI question bubble */}
                  <div className="flex gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ACCENT }}>
                      <MessageSquare size={14} color="white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 border border-slate-200 max-w-[85%]">
                      <p className="text-sm text-slate-700">{q.question}</p>
                    </div>
                  </div>
                  {/* User answer */}
                  {answers[q.key] !== undefined && (
                    <div className="flex justify-end mb-2">
                      <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%]" style={{ backgroundColor: ACCENT_LIGHT }}>
                        <p className="text-sm text-slate-700">{answers[q.key] || '（スキップ）'}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Input */}
              {!isGenerating && interviewStep < QUESTIONS.length && !answers[QUESTIONS[interviewStep].key] && (
                <div className="flex gap-2 mt-4">
                  <input type="text" value={currentInput} onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                    placeholder={QUESTIONS[interviewStep].placeholder}
                    className="flex-1 px-3 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 min-h-12" />
                  <button onClick={handleSubmitAnswer}
                    className="px-4 py-3 text-white text-sm font-bold rounded-xl min-h-12"
                    style={{ backgroundColor: ACCENT }}>
                    {interviewStep === QUESTIONS.length - 1 ? '生成' : '次へ'}
                  </button>
                </div>
              )}

              {isGenerating && (
                <div className="text-center py-6">
                  <Loader2 className="animate-spin mx-auto mb-3" size={30} style={{ color: ACCENT }} />
                  <p className="text-sm font-bold text-slate-700">最強のプロフィールを構成中...</p>
                  <p className="text-xs text-slate-400 mt-1">SEO最適化＋投稿テンプレートを生成しています</p>
                </div>
              )}

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-5">
              {/* Profile */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800">📍 GBPプロフィール文</h3>
                  <CopyButton text={result.profile.text} />
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{result.profile.text}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {result.profile.keywords.map((kw, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF5E0] text-[#6B9E2E] font-bold">#{kw}</span>
                  ))}
                </div>
                {result.profile.tips && (
                  <p className="text-xs text-slate-400 mt-3 italic">💡 {result.profile.tips}</p>
                )}
              </div>

              {/* Post Templates */}
              {result.postTemplates.map((pt, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-800">📝 {pt.type}</h3>
                    <CopyButton text={`${pt.title}\n\n${pt.body}`} />
                  </div>
                  <p className="text-xs font-bold text-slate-600 mb-1">{pt.title}</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{pt.body}</p>
                  <p className="text-[10px] text-slate-400 mt-2">📸 {pt.photoTip}</p>
                </div>
              ))}

              <button onClick={() => { setResult(null); setAnswers({}); setInterviewStep(0); }}
                className="w-full py-3 text-sm font-bold border border-slate-300 rounded-xl min-h-12 hover:bg-slate-50">
                もう一度作り直す
              </button>
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

  // Check session on mount
  useEffect(() => {
    fetch('/api/main/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.paletteId) {
          setPaletteId(data.paletteId);
          setAppState('dashboard');
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = (id: string) => {
    setPaletteId(id);
    setAppState('dashboard');
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setPaletteId('');
    setAppState('login');
  };

  const goBack = () => setAppState('dashboard');

  if (appState === 'login') return <LoginPanel onLogin={handleLogin} />;
  if (appState === 'dashboard') return <Dashboard onNavigate={setAppState} onLogout={handleLogout} />;
  if (appState === 'coupon') return <CouponGenerator onBack={goBack} />;
  if (appState === 'banner') return <BannerCanvas onBack={goBack} />;
  if (appState === 'richmenu') return <RichMenuBuilder onBack={goBack} />;
  if (appState === 'gbp_profile') return <GbpProfileBuilder onBack={goBack} />;

  return null;
}
