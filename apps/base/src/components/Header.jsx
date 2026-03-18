import { Leaf } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#8CC63F] flex items-center justify-center">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">Pal-Base</h1>
          <p className="text-xs text-gray-500">制作・構築特化型エンジン</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400 bg-[#f4fae8] px-3 py-1 rounded-full">
          センス不要。5分でプロの販促物。
        </span>
      </div>
    </header>
  )
}
