/** Speaks NPC lines with the browser's speech synthesis. Pitch and rate differ per character. */
const hasSpeech = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'

const FEMALE = /female|woman|samantha|karen|tessa|moira|fiona|serena|zira|susan|hazel|libby|sonia|natasha|jenny|aria|victoria|ava|allison|kate|martha|joanna|amy|emma/i
const MALE = /\bmale\b|daniel|david|george|alex|fred|mark|ryan|oliver|thomas|guy|james|rishi|arthur|gordon|aaron|brian|eric|liam|ezra|reed/i
const LANG_ORDER = ['en-ng', 'en-gb', 'en-za', 'en-au', 'en-ie', 'en-us', 'en']

let voices: SpeechSynthesisVoice[] = []
function loadVoices() {
  if (!hasSpeech()) return
  voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'))
}
if (hasSpeech()) {
  loadVoices()
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices)
}

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

function chooseVoice(key: string, female: boolean) {
  if (!voices.length) loadVoices()
  if (!voices.length) return undefined
  const rank = (v: SpeechSynthesisVoice) => {
    const i = LANG_ORDER.indexOf(v.lang.toLowerCase().replace('_', '-'))
    return i === -1 ? LANG_ORDER.length : i
  }
  const sorted = [...voices].sort((a, b) => rank(a) - rank(b))
  const matches = sorted.filter((v) => (female ? FEMALE.test(v.name) && !MALE.test(v.name) : MALE.test(v.name) && !FEMALE.test(v.name)))
  const pool = matches.length ? matches : sorted
  const best = rank(pool[0])
  const top = pool.filter((v) => rank(v) <= best + 1)
  return top[hash(key) % top.length]
}

export interface VoiceProfile {
  /** seed so the same person always sounds the same */
  key: string
  female: boolean
  pitch: number
  rate: number
}

export const voice = {
  supported: hasSpeech,
  speak(text: string, p: VoiceProfile) {
    if (!hasSpeech()) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const v = chooseVoice(p.key, p.female)
    if (v) {
      u.voice = v
      u.lang = v.lang
    } else u.lang = 'en-NG'
    const jitter = ((hash(p.key) % 21) - 10) / 100
    u.pitch = Math.min(2, Math.max(0.1, p.pitch + (p.female ? 0.2 : 0) + jitter))
    u.rate = Math.min(1.6, Math.max(0.6, p.rate + jitter / 2))
    u.volume = 1
    window.speechSynthesis.speak(u)
  },
  stop() {
    if (hasSpeech()) window.speechSynthesis.cancel()
  },
}
