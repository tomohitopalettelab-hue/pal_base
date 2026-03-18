import { useState } from 'react'
import { MapPin, MessageSquare, ChevronRight, CheckCircle2 } from 'lucide-react'

const INTERVIEW_QUESTIONS = [
  { id: 1, question: 'お店の名前を教えてください', placeholder: '例：カフェ ひだまり' },
  { id: 2, question: 'どんなお店ですか？一言で表すと？', placeholder: '例：自家焙煎コーヒーと手作りケーキのお店' },
  { id: 3, question: 'お客様にとって一番の「売り」は何ですか？', placeholder: '例：豆の産地にこだわった自家焙煎、静かで落ち着く空間' },
  { id: 4, question: 'どんなお客様に来てほしいですか？', placeholder: '例：仕事の合間にホッとしたい方、コーヒー好きな方' },
  { id: 5, question: '他店と比べて「ここだけは負けない」ところは？', placeholder: '例：注文後に焙煎するので、最高の鮮度で提供できる' },
]

export default function GbpProfileBuilder() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [generated, setGenerated] = useState(false)

  const handleAnswer = (id, value) => {
    setAnswers({ ...answers, [id]: value })
  }

  const handleNext = () => {
    if (currentStep < INTERVIEW_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = () => {
    setGenerated(true)
  }

  const progress = Object.keys(answers).length / INTERVIEW_QUESTIONS.length * 100
  const currentQ = INTERVIEW_QUESTIONS[currentStep]

  const sampleProfile = `【${answers[1] || 'お店の名前'}】

${answers[2] || '一言で表すお店の特徴'}

■ こだわり
${answers[3] || 'お店の一番の売り'}

■ こんな方におすすめ
${answers[4] || 'ターゲットのお客様'}

■ 選ばれる理由
${answers[5] || '他店に負けないポイント'}

お気軽にお立ち寄りください。スタッフ一同、心よりお待ちしております。`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#f4fae8] flex items-center justify-center">
          <MapPin className="w-5 h-5 text-[#8CC63F]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">GBP「プロフィール・パワーアップ」構成案</h2>
          <p className="text-xs text-gray-500">Googleマップで選ばれる「最強のプロフィール」を構築</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>AIインタビュー進捗</span>
          <span>{Object.keys(answers).length} / {INTERVIEW_QUESTIONS.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#8CC63F] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Interview Chat */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {/* Question Indicators */}
        <div className="flex gap-1 mb-4">
          {INTERVIEW_QUESTIONS.map((q, i) => (
            <div
              key={q.id}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                answers[q.id] ? 'bg-[#8CC63F]' : i === currentStep ? 'bg-[#a8d96a]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Chat Bubble */}
        <div className="flex gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#8CC63F] flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div className="bg-[#f4fae8] rounded-lg rounded-tl-none p-3 flex-1">
            <p className="text-sm text-gray-800 font-medium">Q{currentQ.id}. {currentQ.question}</p>
          </div>
        </div>

        {/* Answer Input */}
        <textarea
          value={answers[currentQ.id] || ''}
          onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
          placeholder={currentQ.placeholder}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#8CC63F] focus:ring-1 focus:ring-[#8CC63F] resize-none"
        />

        {/* Navigation */}
        <div className="flex justify-between mt-3">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
          >
            前へ
          </button>
          {currentStep < INTERVIEW_QUESTIONS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 bg-[#8CC63F] text-white rounded-lg text-sm font-medium hover:bg-[#6ba02e] cursor-pointer"
            >
              次へ <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#8CC63F] to-[#6ba02e] text-white rounded-lg text-sm font-medium cursor-pointer"
            >
              プロフィールを生成
            </button>
          )}
        </div>
      </div>

      {/* Generated Profile */}
      {generated && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#8CC63F]" />
            <label className="text-sm font-medium text-gray-700">生成されたプロフィール</label>
          </div>
          <div className="bg-white rounded-xl border-2 border-[#8CC63F] p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
              {sampleProfile}
            </pre>
          </div>
          <p className="text-xs text-gray-400">SEOキーワードが自動的に散りばめられた構成になっています</p>
        </div>
      )}
    </div>
  )
}
