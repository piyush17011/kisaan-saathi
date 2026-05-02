import React, { useEffect, useRef, useState } from 'react'
import { session as apiSession } from '../utils/api'
import Toast from './Toast'
import { t } from '../utils/i18n'

const stepsTemplate = (language) => [
  {
    key: 'crop',
    question: '🌾 ' + t('Which crop are you growing?', language),
    options: [
      t('Wheat', language),
      t('Rice', language),
      t('Cotton', language),
      t('Tomato', language),
      t('Onion', language)
    ]
  },
  {
    key: 'problem',
    question: '🍂 ' + t('What issue are you facing?', language),
    options: [
      t('Yellow Leaves', language),
      t('Low Growth', language),
      t('Pest Problem', language),
      t('Dry Soil', language),
      t('Low Yield', language)
    ]
  },
  {
    key: 'soil_type',
    question: '🌱 ' + t('What is your soil type? (loamy, sandy, clay, etc.)', language),
    hint: t('If unsure, common soil types: loamy (fertile), sandy (drains well), clay (holds water), silt (fine particles)', language),
    options: [t('Loamy', language), t('Sandy', language), t('Clay', language), t('Silt', language), t('Not sure', language)]
  },
  {
    key: 'ph',
    question: '🧪 ' + t('Soil pH level? (4.0-9.0)', language),
    hint: t('pH 6.0-7.0 is ideal for most crops. If unknown, leave blank or click "Skip"', language),
    options: [t('Skip', language)]
  },
  {
    key: 'nitrogen_ppm',
    question: '🟢 ' + t('Soil Nitrogen (N) in ppm?', language),
    hint: t('Typical range: 5-50 ppm. If unknown, leave blank or click "Skip"', language),
    options: [t('Skip', language)]
  },
  {
    key: 'phosphorus_ppm',
    question: '🟡 ' + t('Soil Phosphorus (P) in ppm?', language),
    hint: t('Typical range: 5-30 ppm. If unknown, leave blank or click "Skip"', language),
    options: [t('Skip', language)]
  },
  {
    key: 'potassium_ppm',
    question: '🟠 ' + t('Soil Potassium (K) in ppm?', language),
    hint: t('Typical range: 50-200 ppm. If unknown, leave blank or click "Skip"', language),
    options: [t('Skip', language)]
  },
  {
    key: 'water',
    question: '💧 ' + t('Water availability?', language),
    options: [t('Low', language), t('Moderate', language), t('High', language)],
    hint: t('Or specify in liters/day or mm/week. Low: <5L/day, Moderate: 5-20L/day, High: >20L/day', language)
  },
  {
    key: 'budget',
    question: '💰 ' + t('What is your budget range?', language),
    options: [t('Low', language), t('Medium', language), t('High', language)]
  },
  {
    key: 'description',
    question: '📝 ' + t('Describe your farm problem briefly', language)
  }
]

const WATER_NORMALISE = {
  'कमी': 'Low', 'मध्यम': 'Moderate', 'जास्त': 'High',
  'अधिक': 'High',
  'khup': 'High', 'jaast': 'High', 'kami': 'Low', 'madhyam': 'Moderate',
  'low': 'Low', 'moderate': 'Moderate', 'high': 'High',
  'medium': 'Moderate',
}
const BUDGET_NORMALISE = {
  'कमी': 'Low', 'मध्यम': 'Medium', 'जास्त': 'High', 'अधिक': 'High',
  'low': 'Low', 'medium': 'Medium', 'high': 'High',
  'kami': 'Low', 'madhyam': 'Medium', 'jaast': 'High',
}
const normalise = (val, map) => map[val?.trim()] || map[val?.trim()?.toLowerCase()] || val

// ─── Marathi digit → word mapping ──────────────────────────────────────────
const MARATHI_ONES = [
  'शून्य', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ',
  'दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस',
  'वीस', 'एकवीस', 'बावीस', 'तेवीस', 'चोवीस', 'पंचवीस', 'सव्वीस', 'सत्तावीस', 'अठ्ठावीस', 'एकोणतीस',
  'तीस', 'एकतीस', 'बत्तीस', 'तेहतीस', 'चौतीस', 'पस्तीस', 'छत्तीस', 'सदतीस', 'अडतीस', 'एकोणचाळीस',
  'चाळीस', 'एकेचाळीस', 'बेचाळीस', 'त्रेचाळीस', 'चव्वेचाळीस', 'पंचेचाळीस', 'सेहेचाळीस', 'सत्तेचाळीस', 'अठ्ठेचाळीस', 'एकोणपन्नास',
  'पन्नास', 'एक्कावन्न', 'बावन्न', 'त्रेपन्न', 'चोपन्न', 'पंचावन्न', 'छप्पन्न', 'सत्तावन्न', 'अठ्ठावन्न', 'एकोणसाठ',
  'साठ', 'एकसष्ट', 'बासष्ट', 'त्रेसष्ट', 'चौसष्ट', 'पासष्ट', 'सहासष्ट', 'सदुसष्ट', 'अडुसष्ट', 'एकोणसत्तर',
  'सत्तर', 'एकाहत्तर', 'बहात्तर', 'त्र्याहत्तर', 'चौऱ्याहत्तर', 'पंच्याहत्तर', 'शहात्तर', 'सत्याहत्तर', 'अठ्ठ्याहत्तर', 'एकोणऐंशी',
  'ऐंशी', 'एक्क्याऐंशी', 'ब्याऐंशी', 'त्र्याऐंशी', 'चौऱ्याऐंशी', 'पंच्याऐंशी', 'शहाऐंशी', 'सत्याऐंशी', 'अठ्ठ्याऐंशी', 'एकोणनव्वद',
  'नव्वद', 'एक्क्याण्णव', 'ब्याण्णव', 'त्र्याण्णव', 'चौऱ्याण्णव', 'पंच्याण्णव', 'शहाण्णव', 'सत्त्याण्णव', 'अठ्ठ्याण्णव', 'नव्याण्णव'
]

function numberToMarathi(n) {
  const num = parseInt(n, 10)
  if (isNaN(num)) return n
  if (num < 0) return 'उणे ' + numberToMarathi(Math.abs(num))
  if (num < 100) return MARATHI_ONES[num] || String(num)
  if (num < 1000) {
    const hundreds = Math.floor(num / 100)
    const rest = num % 100
    const hundredWord = hundreds === 1 ? 'शंभर' : MARATHI_ONES[hundreds] + ' शे'
    return rest === 0 ? hundredWord : hundredWord + ' ' + MARATHI_ONES[rest]
  }
  if (num < 100000) {
    const thousands = Math.floor(num / 1000)
    const rest = num % 1000
    const thousandWord = MARATHI_ONES[thousands] ? MARATHI_ONES[thousands] + ' हजार' : thousands + ' हजार'
    return rest === 0 ? thousandWord : thousandWord + ' ' + numberToMarathi(rest)
  }
  // fallback for very large numbers
  return String(num)
}

/**
 * Converts digits in text to Marathi spoken words.
 * e.g. "१०-२०" → "दहा-वीस"   "25 kg" → "पंचवीस kg"
 */
function spellNumbersInMarathi(text) {
  // Replace Devanagari digits first → ASCII digits
  const devanagariMap = { '०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9' }
  let normalized = text.replace(/[०-९]/g, d => devanagariMap[d] || d)
  // Replace standalone number sequences (including decimals)
  return normalized.replace(/\d+(\.\d+)?/g, (match) => {
    if (match.includes('.')) {
      const [intPart, decPart] = match.split('.')
      return numberToMarathi(intPart) + ' दशांश ' + [...decPart].map(d => MARATHI_ONES[parseInt(d)]).join(' ')
    }
    return numberToMarathi(match)
  })
}

function AnalysisRenderer({ text }) {
  if (!text) return null
  const lines = text.split('\n').filter(l => l.trim() !== '')
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const tr = line.trim()
        if (/^#{1,3}\s/.test(tr)) {
          return (
            <p key={i} className="font-bold text-[#9be15d] text-sm mt-3 mb-1">
              {renderInline(tr.replace(/^#{1,3}\s+/, ''))}
            </p>
          )
        }
        if (/^[-*•]\s/.test(tr) && !tr.startsWith('**')) {
          return (
            <div key={i} className="flex gap-2 text-sm text-white/75">
              <span className="text-[#9be15d] mt-0.5 shrink-0">•</span>
              <span>{renderInline(tr.replace(/^[-*•]\s+/, ''))}</span>
            </div>
          )
        }
        if (/^\d+\.\s/.test(tr)) {
          const num = tr.match(/^(\d+)\./)[1]
          return (
            <div key={i} className="flex gap-2 text-sm text-white/75">
              <span className="text-[#9be15d] font-bold shrink-0 w-5">{num}.</span>
              <span>{renderInline(tr.replace(/^\d+\.\s+/, ''))}</span>
            </div>
          )
        }
        if (/^[⚠️💡✅❌🌱💧🌾🔥📌🏷]/.test(tr)) {
          return (
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/80">
              {renderInline(tr)}
            </div>
          )
        }
        return (
          <p key={i} className="text-sm text-white/75 leading-relaxed">
            {renderInline(tr)}
          </p>
        )
      })}
    </div>
  )
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} className="text-white/90">{part.slice(1, -1)}</em>
    return part
  })
}

export default function AskTab({ farmerId, weatherContext }) {
  const [language, setLanguage] = useState('English')
  const steps = stepsTemplate(language)
  const [messages, setMessages] = useState([])
  const [step, setStep] = useState(0)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [location, setLocation] = useState('')
  const [result, setResult] = useState(null)
  const [cropValidation, setCropValidation] = useState(null)
  const [ttsVoices, setTtsVoices] = useState([])
  const bottomRef = useRef()
  const [formData, setFormData] = useState({
    crop: '', problem: '', water: '', budget: '', description: ''
  })

  useEffect(() => {
    const load = () => setTtsVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.onvoiceschanged = load
  }, [])

  useEffect(() => {
    setMessages([{ type: 'bot', text: stepsTemplate(language)[0].question }])
    setStep(0)
    setFormData({ crop: '', problem: '', water: '', budget: '', description: '' })
    setResult(null)
    setCropValidation(null)
  }, [language])

  useEffect(() => {
    setLocation(t('Fetching location...', 'English'))
    if (!navigator.geolocation) {
      setLocation(t('Location unavailable', 'English'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          )
          const data = await res.json()
          const addr = data.address || {}
          const state = addr.state || ''
          const district =
            addr.state_district || addr.district || addr.city ||
            addr.town || addr.county || addr.suburb || ''
          setLocation(district && state ? `${district}, ${state}` : state || t('Location unavailable', 'English'))
        } catch {
          setLocation(t('Location unavailable', 'English'))
        }
      },
      () => setLocation(t('Location unavailable', 'English'))
    )
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const speakText = () => {
    if (!result?.overall_analysis) return

    let cleanText = result.overall_analysis
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s*/g, '')
      .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
      .replace(/^\s*[-*•]\s+/gm, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim()

    // ── Marathi: spell out all numbers as words ──
    if (language === 'Marathi') {
      cleanText = spellNumbersInMarathi(cleanText)
    }

    let langCode = 'en-US'
    if (language === 'Hindi') langCode = 'hi-IN'
    else if (language === 'Marathi') langCode = 'mr-IN'

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = langCode

    const voice =
      ttsVoices.find(v => v.lang === langCode && v.name.toLowerCase().includes('india')) ||
      ttsVoices.find(v => v.lang === langCode) ||
      ttsVoices.find(v => v.lang.startsWith(langCode.split('-')[0]))
    if (voice) utterance.voice = voice

    utterance.rate = 0.88
    utterance.pitch = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const sendMessage = async (value) => {
    // Allow empty values for optional fields
    const currentStep = steps[step]
    const isOptionalField = ['ph', 'nitrogen_ppm', 'phosphorus_ppm', 'potassium_ppm'].includes(currentStep.key)
    
    if (!isOptionalField && !value.trim()) return
    
    const processedValue = value.trim() || (isOptionalField ? 'Not specified' : value)
    
    setMessages(prev => [...prev, { type: 'user', text: processedValue }])
    let normalisedValue = processedValue
    if (currentStep.key === 'water') normalisedValue = normalise(processedValue, WATER_NORMALISE)
    if (currentStep.key === 'budget') normalisedValue = normalise(processedValue, BUDGET_NORMALISE)
    const updatedData = { ...formData, [currentStep.key]: normalisedValue }
    setFormData(updatedData)
    setInput('')

    if (step < steps.length - 1) {
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'bot', text: steps[step + 1].question }])
        setStep(prev => prev + 1)
      }, 700)
    } else {
      setLoading(true)
      setTimeout(async () => {
        try {
          const res = await apiSession({
            farmer_id: farmerId,
            crop: updatedData.crop,
            farmer_problem: updatedData.problem,
            extra_description: updatedData.description,
            water_availability: updatedData.water,
            budget_range: updatedData.budget,
            location,
            soil_type: updatedData.soil_type || 'Not specified',
            ph: updatedData.ph || 'Not specified',
            nitrogen_ppm: updatedData.nitrogen_ppm || 'Not specified',
            phosphorus_ppm: updatedData.phosphorus_ppm || 'Not specified',
            potassium_ppm: updatedData.potassium_ppm || 'Not specified',
            language,
            // ── pass weather context to backend ──
            weather_context: weatherContext || null,
          })
          setResult(res.data.answer)
          if (res.data.crop_validation) setCropValidation(res.data.crop_validation)
          setMessages(prev => [
            ...prev,
            { type: 'bot', text: '✅ ' + t('AI recommendations generated successfully.', language) }
          ])
        } catch (err) {
          const errorMessage =
            err.response?.data?.detail ||
            err.response?.data?.message ||
            t('Failed to generate AI response.', language)
          setToast({ message: errorMessage, type: 'error' })
        } finally {
          setLoading(false)
        }
      }, 1500)
    }
  }

  return (
    <div className="relative h-[88vh] overflow-hidden rounded-[34px] border border-white/10 bg-[#0f140d] shadow-2xl">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#141c11] px-6 py-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-condiment text-4xl text-[#9be15d]">{t('Kisaan AI', language)}</p>
            <p className="text-sm uppercase tracking-[0.2em] text-white/40">{t('Smart Farming Assistant', language)}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['English', 'Hindi', 'Marathi'].map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  language === l
                    ? 'bg-[#9be15d] text-[#18230f]'
                    : 'border border-white/10 bg-white/5 text-white/60'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Location bar */}
      <div className="border-b border-white/5 bg-[#11180d] px-6 py-3">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
        />
      </div>

      {/* Chat messages */}
      <div className="h-[55vh] overflow-y-auto px-5 py-6 space-y-5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-xl ${
              msg.type === 'user'
                ? 'bg-[#9be15d] text-[#18230f]'
                : 'border border-white/10 bg-[#18210f] text-white'
            }`}>
              <div>{msg.text}</div>
              {msg.type === 'bot' && steps[step] && steps[step].hint && (
                <div className="mt-2 text-xs text-white/60 italic border-t border-white/10 pt-2">
                  💡 {steps[step].hint}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-3xl border border-white/10 bg-[#18210f] px-5 py-4 text-sm text-white shadow-xl">
              {t('Analyzing soil...', language)}<br />
              {t('Checking farming conditions...', language)}<br />
              {t('Generating AI recommendations...', language)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick-reply options */}
      {!loading && step < steps.length && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {steps[step].options?.map((option) => (
            <button
              key={option}
              onClick={() => sendMessage(option)}
              className="rounded-full border border-[#9be15d]/20 bg-[#9be15d]/10 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#dfffc2] transition-all hover:bg-[#9be15d]/20"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      {!loading && step < steps.length && (
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#141c11] p-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('Type your answer...', language)}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-white/30"
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(input) }}
            />
            <button
              onClick={() => sendMessage(input)}
              className="rounded-2xl bg-[#9be15d] px-6 py-4 font-black uppercase tracking-wider text-[#18230f] transition-all hover:scale-105"
            >
              {t('Send', language)}
            </button>
          </div>
        </div>
      )}

      {/* Result overlay */}
      {result && (
        <div className="absolute inset-0 z-30 overflow-y-auto bg-[#0f140d] p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-condiment text-5xl text-[#9be15d]">{t('AI Recommendation', language)}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.2em] text-white/40">{t('Smart Farming Analysis', language)}</p>
              </div>
              <button
                onClick={speakText}
                className="rounded-2xl border border-[#9be15d]/20 bg-[#9be15d]/10 px-5 py-3 text-sm font-bold uppercase tracking-wide text-[#dfffc2]"
              >
                {t('Listen', language)}
              </button>
            </div>

            {/* Crop unsuitable warning */}
            {cropValidation && !cropValidation.is_suitable && (
              <div className="rounded-[28px] border-2 border-red-500/50 bg-red-500/10 p-6 shadow-2xl">
                <h3 className="mb-3 flex items-center gap-2 text-xl font-black uppercase tracking-wide text-red-400">
                  ⚠️ {t('Crop Suitability Alert', language)}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-white/75">{cropValidation.warning}</p>
                <div className="rounded-lg border border-red-400/30 bg-red-500/5 p-4">
                  <p className="mb-3 text-sm font-bold text-white/80">{t('Region Information', language)}</p>
                  <ul className="space-y-2 text-xs text-white/60">
                    <li><strong className="text-white/80">{t('Climate Zone', language)}:</strong> {cropValidation.climate}</li>
                    <li><strong className="text-white/80">{t('Annual Rainfall', language)}:</strong> {cropValidation.rainfall}</li>
                    <li><strong className="text-white/80">{t('Soil Type', language)}:</strong> {cropValidation.soil}</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Crop suitable */}
            {cropValidation && cropValidation.is_suitable && (
              <div className="rounded-[28px] border-2 border-[#9be15d]/50 bg-[#9be15d]/10 p-6 shadow-2xl">
                <h3 className="mb-3 flex items-center gap-2 text-xl font-black uppercase tracking-wide text-[#9be15d]">
                  ✅ {t('Crop is Well-Suited', language)}
                </h3>
                <p className="text-sm text-white/75">{cropValidation.warning}</p>
              </div>
            )}

            {/* Better crop options */}
            {cropValidation && !cropValidation.is_suitable && cropValidation.suitable_crops?.length > 0 && (
              <div className="rounded-[28px] border border-yellow-500/30 bg-yellow-500/5 p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-black uppercase tracking-wide text-yellow-400">
                  💡 {t('Better Crop Options for', language)} {cropValidation.region}
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {cropValidation.suitable_crops.map((crop, idx) => (
                    <div key={idx} className="rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4">
                      <p className="font-bold text-yellow-300">🌾 {crop}</p>
                      <p className="mt-1 text-xs text-white/60">{t('Recommended for this region', language)}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 rounded-lg border border-yellow-400/20 bg-yellow-400/5 p-3 text-xs text-white/70">
                  <strong>{t('Tip', language)}:</strong> {t('These crops are naturally suited to', language)} {cropValidation.region}'s {t('climate and soil. Growing them will likely give you better yields with less effort.', language)}
                </p>
              </div>
            )}

            {/* Water compatibility warning */}
            {cropValidation && !cropValidation.water_compatible && (
              <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-4">
                <p className="flex items-start gap-2 text-sm text-white/70">
                  <span className="text-lg">⚠️</span>
                  <span>{cropValidation.water_message}</span>
                </p>
              </div>
            )}

            {/* Overall analysis */}
            <div className="rounded-[28px] border border-[#9be15d]/20 bg-[#17210f] p-6 shadow-2xl">
              <h3 className="mb-4 text-2xl font-black uppercase tracking-wide text-[#9be15d]">
                {t('Overall Analysis', language)}
              </h3>
              <AnalysisRenderer text={result.overall_analysis} />
            </div>

            {/* Fertilizers */}
            {result.fertilizers?.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-black uppercase tracking-wide text-[#9be15d]">
                  🌾 {t('Fertilizers', language)}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.fertilizers.map((f, i) => (
                    <div key={i} className="rounded-[24px] border border-white/10 bg-[#141c11] p-5 shadow-xl">
                      <p className="text-xl font-black uppercase text-[#9be15d]">{f.name}</p>
                      <p className="mt-2 text-sm text-white/60">{t('Quantity', language)}: {f.quantity_per_acre}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Soil tips */}
            {result.soil_analysis_and_tips?.length > 0 && (
              <div>
                <h3 className="mb-3 text-lg font-black uppercase tracking-wide text-[#9be15d]">
                  🌱 {t('Recommendations', language)}
                </h3>
                <div className="space-y-3">
                  {result.soil_analysis_and_tips.map((tip, i) => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-[#141c11] p-4 shadow-xl">
                      <AnalysisRenderer text={tip} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}