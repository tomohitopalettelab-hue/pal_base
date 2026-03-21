"use client";

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const ACCENT = '#8CC63F';

export default function AdminLoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(data?.error || 'ログインに失敗しました。');
        return;
      }
      window.location.href = '/admin';
    } catch {
      setError('通信エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5FBF0' }}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
            <span className="text-white text-sm font-black">PB</span>
          </div>
          <div>
            <p className="text-lg font-black text-slate-800 leading-none">pal base</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">管理者ログイン</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="管理者ID" value={id} onChange={(e) => setId(e.target.value)}
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
