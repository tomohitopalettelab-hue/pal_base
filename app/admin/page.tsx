"use client";

import { useCallback, useEffect, useState } from 'react';
import {
  Users, LogOut, RefreshCw, CheckCircle, AlertCircle, ArrowLeft, ChevronDown, ChevronRight,
  MapPin, MessageCircle, ExternalLink, Loader2, X, Link2, Eye, EyeOff, Settings,
} from 'lucide-react';

type Account = {
  id: string;
  paletteId: string;
  name: string;
  status: string;
  isStandard?: boolean;
};

type CustomerSettings = {
  gbpConnected: boolean;
  gbpLocationId: string | null;
  lineConnected: boolean;
  lineRichMenuId: string | null;
};

const ACCENT = '#8CC63F';
const ACCENT_LIGHT = '#EBF5E0';

// ── GBP Setup Guide ───────────────────────────────────────────────────────────

function GbpSetupPanel({ paletteId, settings, onRefresh }: { paletteId: string; settings: CustomerSettings; onRefresh: () => void }) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshToken = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/oauth/gbp/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paletteId }) });
      onRefresh();
    } catch { /* ignore */ }
    finally { setIsRefreshing(false); }
  };

  const steps = [
    { title: 'Googleアカウントの準備', desc: 'ビジネス用のGoogleアカウントが必要です。個人用と分けることを推奨します。', link: null },
    { title: 'Googleビジネスプロフィールの作成', desc: 'Google検索またはGoogleマップで「ビジネスプロフィール」を検索し、お店の情報を登録します。', link: 'https://business.google.com/' },
    { title: 'オーナー確認の完了', desc: 'Googleからハガキ・電話・メールのいずれかで本人確認が届きます。指示に従って確認を完了してください。', link: null },
    { title: 'OAuth連携（このボタンから）', desc: '上記3ステップ完了後、下のボタンでGBPとPal Baseを連携します。', link: null },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin size={16} style={{ color: '#E53935' }} />
          <h3 className="text-sm font-bold text-slate-800">GBPセットアップ</h3>
        </div>
        {settings.gbpConnected ? (
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✅ 接続済み</span>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">未接続</span>
        )}
      </div>

      {/* Step-by-step guide */}
      <div className="space-y-1 mb-3">
        {steps.map((step, i) => (
          <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
            <button onClick={() => setExpandedStep(expandedStep === i ? null : i)}
              className="w-full flex items-center gap-2 p-2.5 text-left hover:bg-slate-50">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">{i + 1}</span>
              <span className="text-xs font-bold text-slate-700 flex-1">{step.title}</span>
              {expandedStep === i ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
            </button>
            {expandedStep === i && (
              <div className="px-3 pb-3 text-xs text-slate-500">
                <p>{step.desc}</p>
                {step.link && (
                  <a href={step.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1.5 text-blue-500 hover:underline">
                    <ExternalLink size={10} /> 管理画面を開く
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <a href={`/api/oauth/gbp?paletteId=${encodeURIComponent(paletteId)}`}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 text-white text-xs font-bold rounded-xl min-h-10"
          style={{ backgroundColor: settings.gbpConnected ? '#64748b' : ACCENT }}>
          <Link2 size={12} /> {settings.gbpConnected ? '再連携する' : 'GBP OAuth連携'}
        </a>
        {settings.gbpConnected && (
          <button onClick={refreshToken} disabled={isRefreshing}
            className="px-3 py-2.5 text-xs border border-slate-300 rounded-xl min-h-10 hover:bg-slate-50 disabled:opacity-50">
            {isRefreshing ? <Loader2 className="animate-spin" size={12} /> : <RefreshCw size={12} />}
          </button>
        )}
      </div>
      {settings.gbpLocationId && (
        <p className="text-[10px] text-slate-400 mt-2 truncate">Location: {settings.gbpLocationId}</p>
      )}
    </div>
  );
}

// ── LINE Setup Guide ──────────────────────────────────────────────────────────

function LineSetupPanel({ paletteId, settings, onRefresh }: { paletteId: string; settings: CustomerSettings; onRefresh: () => void }) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const steps = [
    { title: 'LINE公式アカウントの作成', desc: 'LINE for Businessから無料で公式アカウントを作成します。', link: 'https://www.linebiz.com/jp/entry/' },
    { title: 'LINE Developersでチャネル作成', desc: 'LINE Developersにログイン → プロバイダー作成 → Messaging APIチャネルを作成します。', link: 'https://developers.line.biz/console/' },
    { title: 'Channel Access Token発行', desc: 'チャネル設定画面の「Messaging API設定」タブから、Channel Access Token (long-lived) を発行します。' , link: null },
    { title: 'トークンを入力', desc: '発行したChannel Access TokenとChannel Secretを下のフォームに貼り付けてください。', link: null },
  ];

  const saveLineSettings = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/line-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paletteId, lineChannelAccessToken: token, lineChannelSecret: secret }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${data.botName || 'LINE Bot'} と接続しました`);
        setToken('');
        setSecret('');
        onRefresh();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch { setMessage('❌ 通信エラー'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} style={{ color: '#06C755' }} />
          <h3 className="text-sm font-bold text-slate-800">LINEセットアップ</h3>
        </div>
        {settings.lineConnected ? (
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✅ 接続済み</span>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">未接続</span>
        )}
      </div>

      {/* Step-by-step guide */}
      <div className="space-y-1 mb-3">
        {steps.map((step, i) => (
          <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
            <button onClick={() => setExpandedStep(expandedStep === i ? null : i)}
              className="w-full flex items-center gap-2 p-2.5 text-left hover:bg-slate-50">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0">{i + 1}</span>
              <span className="text-xs font-bold text-slate-700 flex-1">{step.title}</span>
              {expandedStep === i ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
            </button>
            {expandedStep === i && (
              <div className="px-3 pb-3 text-xs text-slate-500">
                <p>{step.desc}</p>
                {step.link && (
                  <a href={step.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1.5 text-blue-500 hover:underline">
                    <ExternalLink size={10} /> 管理画面を開く
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Token input */}
      <div className="space-y-2">
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Channel Access Token</label>
          <div className="flex gap-1">
            <input type={showToken ? 'text' : 'password'} value={token} onChange={(e) => setToken(e.target.value)} placeholder="Channel Access Token を貼り付け"
              className="flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded-lg min-h-9" />
            <button onClick={() => setShowToken(!showToken)} className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50">
              {showToken ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Channel Secret</label>
          <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Channel Secret を貼り付け"
            className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg min-h-9" />
        </div>
        <button onClick={saveLineSettings} disabled={isSaving || !token.trim()}
          className="w-full py-2.5 text-white text-xs font-bold rounded-xl min-h-10 disabled:opacity-50"
          style={{ backgroundColor: '#06C755' }}>
          {isSaving ? <Loader2 className="animate-spin mx-auto" size={14} /> : '接続テスト＆保存'}
        </button>
        {message && <p className="text-xs text-center">{message}</p>}
      </div>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [customerSettings, setCustomerSettings] = useState<CustomerSettings | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/customers');
      if (res.status === 401) { window.location.href = '/login'; return; }
      const data = await res.json();
      if (data.success) { setAuthenticated(true); setAccounts(data.accounts || []); }
    } catch { window.location.href = '/login'; }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  // URL params from OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gbpError = params.get('gbp_error');
    const gbpConnected = params.get('gbp_connected');
    const paletteId = params.get('paletteId');
    if (gbpError) setError(decodeURIComponent(gbpError));
    if (gbpConnected && paletteId) {
      const acc = accounts.find((a) => a.paletteId === paletteId);
      if (acc) { setSelectedAccount(acc); loadSettings(paletteId); }
    }
  }, [accounts]);

  const refresh = async () => {
    setIsLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (data.success) setAccounts(data.accounts || []);
      else setError(data.error || '取得に失敗しました');
    } catch { setError('通信エラー'); }
    finally { setIsLoading(false); }
  };

  const loadSettings = async (paletteId: string) => {
    try {
      const res = await fetch(`/api/admin/settings?paletteId=${encodeURIComponent(paletteId)}`);
      const data = await res.json();
      if (data.success) setCustomerSettings(data.settings);
    } catch { setCustomerSettings({ gbpConnected: false, gbpLocationId: null, lineConnected: false, lineRichMenuId: null }); }
  };

  const selectAccount = (acc: Account) => {
    setSelectedAccount(acc);
    setCustomerSettings(null);
    loadSettings(acc.paletteId);
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  if (!authenticated) return <div className="min-h-screen flex items-center justify-center"><p className="text-sm text-slate-400">読み込み中...</p></div>;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#F5FBF0' }}>
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          {selectedAccount && (
            <button onClick={() => { setSelectedAccount(null); setCustomerSettings(null); }} className="p-1.5 -ml-1 hover:bg-slate-100 rounded-lg">
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
            <span className="text-white text-xs font-black">PB</span>
          </div>
          <div>
            <span className="text-sm font-black text-slate-800">Pal Base</span>
            <span className="text-[10px] text-slate-400 ml-2">管理画面</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!selectedAccount && (
            <button onClick={refresh} disabled={isLoading} className="p-2 hover:bg-slate-100 rounded-lg">
              <RefreshCw size={16} className={`text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button onClick={handleLogout} className="p-2 hover:bg-slate-100 rounded-lg"><LogOut size={16} className="text-slate-500" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 flex-1">{error}</p>
              <button onClick={() => setError('')}><X size={12} className="text-red-400" /></button>
            </div>
          )}

          {/* Customer List */}
          {!selectedAccount && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} style={{ color: ACCENT }} />
                <h1 className="text-base font-bold text-slate-800">Pal Base 契約顧客</h1>
                <span className="text-xs text-slate-400 ml-1">{accounts.length}件</span>
              </div>

              {accounts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                  <p className="text-sm text-slate-500">Pal Baseの契約顧客はまだいません</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <button key={account.id} onClick={() => selectAccount(account)}
                      className="w-full bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-slate-300 hover:shadow-sm transition-all text-left">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: ACCENT }}>
                        {account.paletteId?.slice(0, 2) || '??'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{account.name}</p>
                        <p className="text-xs text-slate-400">{account.paletteId}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${account.isStandard ? 'text-white' : 'text-[#6B9E2E]'}`}
                          style={{ backgroundColor: account.isStandard ? ACCENT : ACCENT_LIGHT }}>
                          {account.isStandard ? 'Standard' : 'Lite'}
                        </span>
                        <Settings size={14} className="text-slate-300" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Customer Detail */}
          {selectedAccount && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white" style={{ backgroundColor: ACCENT }}>
                  {selectedAccount.paletteId?.slice(0, 2)}
                </div>
                <div>
                  <p className="text-base font-bold text-slate-800">{selectedAccount.name}</p>
                  <p className="text-xs text-slate-400">{selectedAccount.paletteId}</p>
                </div>
              </div>

              {!customerSettings ? (
                <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" size={24} style={{ color: ACCENT }} /></div>
              ) : (
                <>
                  <GbpSetupPanel paletteId={selectedAccount.paletteId} settings={customerSettings} onRefresh={() => loadSettings(selectedAccount.paletteId)} />
                  <LineSetupPanel paletteId={selectedAccount.paletteId} settings={customerSettings} onRefresh={() => loadSettings(selectedAccount.paletteId)} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
