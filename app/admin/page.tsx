"use client";

import { useCallback, useEffect, useState } from 'react';
import { Users, LogOut, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

type Account = {
  id: string;
  paletteId: string;
  name: string;
  status: string;
  isStandard?: boolean;
};

const ACCENT = '#8CC63F';
const ACCENT_LIGHT = '#EBF5E0';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/customers');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (data.success) {
        setAuthenticated(true);
        setAccounts(data.accounts || []);
      }
    } catch {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const refresh = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      if (data.success) setAccounts(data.accounts || []);
      else setError(data.error || '取得に失敗しました');
    } catch { setError('通信エラー'); }
    finally { setIsLoading(false); }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  if (!authenticated) return <div className="min-h-screen flex items-center justify-center"><p className="text-sm text-slate-400">読み込み中...</p></div>;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5FBF0' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
            <span className="text-white text-xs font-black">PB</span>
          </div>
          <div>
            <span className="text-sm font-black text-slate-800">Pal Base</span>
            <span className="text-[10px] text-slate-400 ml-2">管理画面</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} disabled={isLoading} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <RefreshCw size={16} className={`text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleLogout} className="p-2 hover:bg-slate-100 rounded-lg">
            <LogOut size={16} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} style={{ color: ACCENT }} />
            <h1 className="text-base font-bold text-slate-800">Pal Base 契約顧客一覧</h1>
            <span className="text-xs text-slate-400 ml-1">{accounts.length}件</span>
          </div>

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          {accounts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <p className="text-sm text-slate-500">Pal Baseの契約顧客はまだいません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.map((account) => (
                <div key={account.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{ backgroundColor: ACCENT }}>
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
                    {account.status === 'active' ? (
                      <CheckCircle size={14} className="text-green-500" />
                    ) : (
                      <AlertCircle size={14} className="text-slate-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
