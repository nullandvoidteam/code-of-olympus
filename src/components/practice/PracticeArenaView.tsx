import React, { useState, useRef } from 'react'
import {
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Flame,
  Play,
  ArrowRight,
  Swords,
  Sparkles,
  Award,
  Check,
  CheckCircle2,
  Shield,
  Clock,
  Target,
  Trophy,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

interface PracticeArenaViewProps {
  onStartChallenge?: (id?: string) => void
}

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const TECH_FILTERS = ['All Realms', 'Python', 'JavaScript', 'HTML/CSS', 'SQL', 'React', 'Algorithms', 'Data Structures']
const TECH_FILTERS_CLASSIC = ['All', 'Python', 'JavaScript', 'HTML/CSS', 'SQL', 'React', 'Algorithms', 'Data Structures']
const LEVEL_FILTERS = ['All Tiers', 'Mortal', 'Hero', 'God of War']
const SORT_OPTIONS = ['Spartan Favor', 'Newest Blood', 'Most Conquered', 'Hacksilver XP']

interface ChallengeCard {
  id: string
  title: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  tag: string
  xp: number
  lang: string
  locked: boolean
  isDaily?: boolean
  emoji: string
  tierName: string
}

const CHALLENGES: ChallengeCard[] = [
  {
    id: 'reverse-string',
    title: 'Invert the Runic Inscription',
    description: 'Reverse a sacred character string without invoking high-level standard runes.',
    difficulty: 'EASY',
    tag: 'MORTAL',
    xp: 75,
    lang: 'Python',
    locked: false,
    isDaily: true,
    emoji: '🐍',
    tierName: 'Mortal Initiate',
  },
  {
    id: 'fizzbuzz',
    title: 'Echoes of the World Serpent',
    description: 'Output Divine, Serpent, or DivineSerpent across sequential realms up to N.',
    difficulty: 'EASY',
    tag: 'MORTAL',
    xp: 80,
    lang: 'Python',
    locked: false,
    emoji: '🌊',
    tierName: 'Mortal Initiate',
  },
  {
    id: 'palindrome',
    title: 'The Mirror Shield of Atreus',
    description: 'Determine if an alphanumeric sequence reads identical backward and forward.',
    difficulty: 'EASY',
    tag: 'MORTAL',
    xp: 75,
    lang: 'Python',
    locked: false,
    emoji: '🛡️',
    tierName: 'Mortal Initiate',
  },
  {
    id: 'two-sum',
    title: 'Twin Blades of Chaos Target',
    description: 'Locate two runic indices in an array that forge an exact target power level.',
    difficulty: 'MEDIUM',
    tag: 'HERO',
    xp: 125,
    lang: 'Python',
    locked: false,
    emoji: '⚔️',
    tierName: 'Hero Tier',
  },
  {
    id: 'valid-anagram',
    title: 'Cipher of the Vanir Goddess',
    description: 'Confirm if one sacred word rearranges exactly to mirror another.',
    difficulty: 'MEDIUM',
    tag: 'HERO',
    xp: 125,
    lang: 'Python',
    locked: false,
    emoji: '💎',
    tierName: 'Hero Tier',
  },
]

const LEADERBOARD = [
  { rank: 1, emoji: '⚡', name: 'SpartanGhost', xp: '3,240 XP' },
  { rank: 2, emoji: '🪓', name: 'LeviathanWielder', xp: '2,890 XP' },
  { rank: 3, emoji: '🏹', name: 'AtreusLoki', xp: '2,450 XP' },
  { rank: 4, emoji: '🛡️', name: 'ValkyrieQueen', xp: '2,120 XP' },
  { rank: 5, emoji: '🐺', name: 'FenrirBane', xp: '1,980 XP' },
]

const LEADERBOARD_CLASSIC = [
  { rank: 1, emoji: '🥷', name: 'CodeNinja', xp: '3,240 XP' },
  { rank: 2, emoji: '🧙‍♂️', name: 'PythonWizard', xp: '2,890 XP' },
  { rank: 3, emoji: '🚀', name: 'DevRocket', xp: '2,450 XP' },
  { rank: 4, emoji: '👾', name: 'PixelHero', xp: '2,120 XP' },
  { rank: 5, emoji: '🦊', name: 'ByteFox', xp: '1,980 XP' },
]

/* ========================================================================= */
/* CLASSIC PRACTICE ARENA (Matches Screenshot 3 Exactly)                     */
/* ========================================================================= */
const ClassicPracticeArenaView: React.FC<PracticeArenaViewProps> = ({ onStartChallenge }) => {
  const [techFilter, setTechFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const classicChallenges = [
    {
      id: 'reverse-string',
      title: 'Reverse the String',
      description: "Write a function that reverses a string without using Python's built-in reverse method.",
      difficulty: 'Easy',
      lang: 'Python',
      xp: 75,
      time: '5 min',
      emoji: '🐍',
    },
    {
      id: 'fizzbuzz',
      title: 'FizzBuzz Classic',
      description: 'Print numbers 1 to N, replacing multiples of 3 with Fizz and multiples of 5 with Buzz.',
      difficulty: 'Easy',
      lang: 'Python',
      xp: 80,
      time: '5 min',
      emoji: '⚡',
    },
    {
      id: 'palindrome',
      title: 'Valid Palindrome',
      description: 'Check if a given string reads the same forwards and backward, ignoring non-alphanumeric chars.',
      difficulty: 'Easy',
      lang: 'Python',
      xp: 75,
      time: '10 min',
      emoji: '🔁',
    },
    {
      id: 'two-sum',
      title: 'Two Sum Problem',
      description: 'Given an array of integers, return indices of the two numbers such that they add up to target.',
      difficulty: 'Medium',
      lang: 'Python',
      xp: 125,
      time: '15 min',
      emoji: '🎯',
    },
  ]

  const filtered = classicChallenges.filter(c => {
    const matchSearch = searchQuery === '' || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchTech = techFilter === 'All' || c.lang === techFilter
    return matchSearch && matchTech
  })

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6 text-left pb-20 select-none animate-in fade-in duration-300">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* MAIN COLUMN (9 Cols) */}
        <div className="xl:col-span-9 flex flex-col gap-6">
          {/* Hero Banner */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-sm gap-6 relative overflow-hidden">
            <div className="flex flex-col gap-3 z-10 max-w-lg">
              <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider font-mono">
                DAILY CODING ADVENTURE
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Sharpen Your<br />Coding Skills.
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                Solve bite-sized challenges, master new concepts, and earn XP along the way.
              </p>
              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onStartChallenge?.('reverse-string')}
                  className="btn-gamified-3d btn-gamified-3d-primary px-6 py-3 rounded-xl text-sm font-extrabold text-white flex items-center gap-2 cursor-pointer"
                >
                  <span>Start Daily Challenge</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('explore-challenges-section')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="btn-gamified-3d btn-gamified-3d-secondary px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Challenges</span>
                </button>
              </div>
            </div>

            {/* Right Pixel Art illustration */}
            <div className="shrink-0 w-64 h-36 rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-100 p-4 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="text-4xl mb-1">🎮 🤖 🐍</div>
              <span className="text-xs font-bold text-slate-800">Daily Quest Arena</span>
              <span className="text-[10px] text-slate-500">New challenge unlocks in 14h</span>
            </div>
          </div>

          {/* Today's Daily Challenge Spotlight */}
          <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex flex-col gap-2 flex-1 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] uppercase tracking-wider border border-rose-200">
                  🔥 DAILY
                </span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  TODAY&apos;S CHALLENGE
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Reverse the String
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                Write a function that reverses a string without using Python&apos;s built-in reverse method.
              </p>
              <div className="flex items-center gap-3 flex-wrap text-xs font-medium mt-1">
                <span className="text-sky-700 font-bold flex items-center gap-1">
                  🐍 Python
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px]">
                  Easy
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 5 min
                </span>
                <span className="text-amber-600 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> +75 XP
                </span>
              </div>
            </div>

            {/* Right progress & button */}
            <div className="flex flex-col items-center gap-3 z-10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                    0%
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">0 / 1</span>
                </div>
                <button
                  type="button"
                  onClick={() => onStartChallenge?.('reverse-string')}
                  className="btn-gamified-3d btn-gamified-3d-primary px-6 py-3 rounded-xl text-sm font-extrabold text-white flex items-center gap-2 cursor-pointer"
                >
                  <span>Start Challenge</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                🛡️ Complete today&apos;s challenge to protect your 7-day streak.
              </span>
            </div>
          </div>

          {/* Search Bar & Filter Pills */}
          <div id="explore-challenges-section" className="flex flex-col gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by concept, language, or skill"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-slate-200 text-slate-800 text-xs shadow-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Language filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {TECH_FILTERS_CLASSIC.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTechFilter(tag)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    techFilter === tag
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Challenge Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4 hover:border-emerald-500 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {item.difficulty}
                    </span>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> +{item.xp} XP
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <span>{item.lang}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartChallenge?.(item.id)}
                    className="btn-gamified-3d btn-gamified-3d-primary px-4 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>Solve</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR (3 Cols) */}
        <div className="xl:col-span-3 flex flex-col gap-5">
          {/* Practice Stats */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              PRACTICE STATS
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
                  🎯
                </div>
                <span className="font-semibold text-slate-700">36 Challenges Solved</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm">
                  ⚡
                </div>
                <span className="font-semibold text-slate-700">4 Day Streak</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm">
                  🏆
                </div>
                <span className="font-semibold text-slate-700">1,280 XP Earned</span>
              </div>
            </div>
          </div>

          {/* Streak Quest */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left border-b border-slate-100 pb-2">
              STREAK QUEST
            </div>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-2xl shadow-sm">
              🛡️
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900">7 Day Streak</div>
              <span className="text-xs text-orange-600 font-semibold">Keep it up! 🔥</span>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                  ✓
                </div>
              ))}
              <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                5
              </div>
            </div>
            <span className="text-[11px] text-slate-400 block pt-1">
              1 more day for bonus reward!
            </span>
          </div>

          {/* Top Practicers */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              TOP PRACTICERS
            </div>
            <div className="space-y-2">
              {LEADERBOARD_CLASSIC.map((user) => (
                <div key={user.rank} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400 w-4">{user.rank}</span>
                    <span>{user.emoji}</span>
                    <span className="font-semibold text-slate-800">{user.name}</span>
                  </div>
                  <span className="font-bold text-emerald-600">{user.xp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const PracticeArenaView: React.FC<PracticeArenaViewProps> = (props) => {
  const { theme } = useTheme()
  if (theme === 'classic') {
    return <ClassicPracticeArenaView {...props} />
  }

  const { onStartChallenge } = props
  const [techFilter, setTechFilter] = useState('All Realms')
  const [levelFilter, setLevelFilter] = useState('All Tiers')
  const [sortBy, setSortBy] = useState('Spartan Favor')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  const filteredCards = CHALLENGES.filter(c => {
    const matchSearch =
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchTech = techFilter === 'All Realms' || c.lang === techFilter
    const matchLevel =
      levelFilter === 'All Tiers' ||
      (levelFilter === 'Mortal' && c.difficulty === 'EASY') ||
      (levelFilter === 'Hero' && c.difficulty === 'MEDIUM') ||
      (levelFilter === 'God of War' && c.difficulty === 'HARD')
    return matchSearch && matchTech && matchLevel
  })

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6 text-left pb-20 select-none animate-in fade-in duration-300">
      {/* ================================================================ */}
      {/* 2-COLUMN LAYOUT                                                   */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* MAIN CONTENT COLUMN (~75%)                                    */}
        {/* ============================================================ */}
        <div className="xl:col-span-9 flex flex-col gap-6">
          {/* ── A. HERO BANNER: THE CRUCIBLE BATTLEFIELD ── */}
          <div className="relative bg-gradient-to-br from-[#180A0A] via-[#0E0505] to-[#0A0404] border-2 border-[#8C2828] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.85)] gap-6">
            <div className="absolute top-0 right-1/4 w-96 h-36 bg-[#FF3D00]/15 blur-[90px] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF3D00] to-transparent" />
            <div className="absolute -bottom-8 -right-8 text-[180px] font-serif font-black text-red-950/20 pointer-events-none select-none leading-none">
              Ω
            </div>

            {/* Left text */}
            <div className="flex flex-col gap-3 z-10 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF3D00] shadow-[0_0_8px_#FF3D00] animate-pulse" />
                <span
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-[10px] font-bold text-[#FF5722] uppercase tracking-[0.25em]"
                >
                  BLOOD ARENA • COMBAT TRIALS
                </span>
              </div>
              <h1
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-2xl md:text-4xl font-black text-[#F5E8E8] leading-tight tracking-wider uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
              >
                Hone Your Blades<br />In Battle.
              </h1>
              <p className="text-xs sm:text-sm text-[#A89898] leading-relaxed max-w-md">
                Overcome lethal coding trials, prove your algorithmic wrath, and claim divine Hacksilver XP.
              </p>
              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => onStartChallenge?.('reverse-string')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B0000] via-[#B91C1C] to-[#EF4444] hover:from-[#991B1B] hover:to-[#FF3D00] text-white font-bold text-xs sm:text-sm shadow-[0_0_18px_rgba(220,38,38,0.7)] cursor-pointer transition-all active:scale-95 border border-[#FF5722]/60"
                >
                  <span style={{ fontFamily: "'Cinzel', serif" }}>ENTER DAILY BLOOD TRIAL</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#140808] hover:bg-[#1E0C0C] border border-[#3D1C1C] text-[#C4B5B5] hover:text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <span style={{ fontFamily: "'Cinzel', serif" }}>VIEW WAR RITES</span>
                </button>
              </div>
            </div>

            {/* Right Spartan Altar Emblem */}
            <div className="z-10 shrink-0 flex items-center justify-center relative w-60 h-36 rounded-xl bg-gradient-to-b from-[#200A0A] to-[#120505] border border-[#8C2828] p-4 shadow-[0_0_20px_rgba(140,40,40,0.4)]">
              <div className="flex flex-col items-center text-center gap-1.5">
                <Swords className="w-8 h-8 text-[#FF3D00] drop-shadow-[0_0_8px_#FF3D00]" />
                <span
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-xs font-black text-[#F5D060] tracking-widest uppercase mt-1"
                >
                  TRIAL OF CHAOS
                </span>
                <span className="text-[10.5px] text-[#8C7A7A]">Leviathan & Blades Primed</span>
              </div>
            </div>
          </div>

          {/* ── B. TODAY'S SACRED TRIAL SPOTLIGHT ── */}
          <div
            className="rounded-2xl p-6 border-2 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-300"
            style={{
              background: 'var(--theme-surface-card, #0E0606)',
              borderColor: 'var(--theme-border-strong, #8C2828)',
              boxShadow: 'var(--theme-shadow-card, 0 8px 32px rgba(0,0,0,0.85))',
            }}
          >
            <div className="absolute top-0 right-0 w-64 h-32 bg-[#FF3D00]/10 blur-[80px] pointer-events-none" />

            {/* Left */}
            <div className="flex flex-col gap-2 flex-1 z-10">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#240C0C] text-[#FF8A80] font-bold text-[10px] font-pixel uppercase tracking-wider border border-[#8C2828]">
                  <Flame className="w-3 h-3 text-[#FF3D00] animate-pulse" /> DAILY SACRIFICE
                </span>
                <span
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-[10px] font-bold text-[#8C7A7A] uppercase tracking-wider"
                >
                  ORDAINED BY ARES
                </span>
              </div>
              <h2
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-2xl font-black text-[#F5E8E8] tracking-wider uppercase"
              >
                Invert the Runic Inscription
              </h2>
              <p className="text-xs text-[#A89898] leading-relaxed max-w-md">
                Inscribe a battle function that reverses a sacred character string without using Python&apos;s standard reverse spells.
              </p>
              <div className="flex items-center gap-3 flex-wrap text-xs font-medium mt-1">
                <span className="flex items-center gap-1 text-[#00E5FF]">
                  🐍 Python 3.12
                </span>
                <span className="px-2 py-0.5 rounded bg-[#102418] border border-[#00E5FF]/40 text-[#00E5FF] font-bold text-[11px]">
                  Mortal Initiate
                </span>
                <span className="text-[#8C7A7A]">⏱ 5 min Trial</span>
                <span className="flex items-center gap-1 font-bold text-[#F5D060]">
                  <Sparkles className="w-3.5 h-3.5 text-[#F5D060]" /> +75 Hacksilver XP
                </span>
              </div>
            </div>

            {/* Center stone tablet */}
            <div className="shrink-0 flex flex-col items-center justify-center z-10">
              <div className="bg-[#140808] border-2 border-[#3D1C1C] rounded-xl px-5 py-4 shadow-inner font-mono text-xs text-center space-y-1.5">
                <div className="text-[#A89898] font-bold">abcde</div>
                <div className="text-[#FF3D00] text-sm">⚔️</div>
                <div className="text-[#00E5FF] font-bold">edcba</div>
              </div>
            </div>

            {/* Right action area */}
            <div className="flex flex-col items-end gap-3 shrink-0 z-10">
              <div
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-[10px] font-bold text-[#8C7A7A] uppercase tracking-widest"
              >
                WAR READINESS
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="relative w-14 h-14">
                    <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#200A0A" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#DC2626" strokeWidth="3" strokeDasharray="0 94.25" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        style={{ fontFamily: "'Cinzel', serif" }}
                        className="font-bold text-xs text-[#FF5722]"
                      >
                        0%
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#6E5A5A] font-bold">0 / 1</span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => onStartChallenge?.('reverse-string')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#550A0A] hover:from-[#A81010] hover:to-[#730E0E] text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-all active:scale-95 border border-[#8C2828]"
                  >
                    <span style={{ fontFamily: "'Cinzel', serif" }}>ENTER ARENA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1C0A0A] border border-[#8C2828] text-[11px] text-[#FF8A80] font-medium">
                    <Flame className="w-3.5 h-3.5 text-[#FF3D00] animate-pulse" />
                    Slay today&apos;s trial to sustain your 7-day war streak.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── C. SEARCH & FILTER ── */}
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C2828]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search combat trials by runes, algorithms, or mechanics..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#120A0A] border border-[#3D1C1C] text-sm text-[#F5E8E8] placeholder:text-[#6E5A5A] outline-none focus:border-[#FF3D00] focus:ring-1 focus:ring-[#FF3D00]/40 transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]"
              />
            </div>

            {/* Realm Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {TECH_FILTERS.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setTechFilter(f)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    techFilter === f
                      ? 'bg-gradient-to-r from-[#8B0000] to-[#550A0A] text-white border-[#FF3D00] shadow-[0_0_12px_rgba(255,61,0,0.4)]'
                      : 'bg-[#120A0A] text-[#9E8B8B] border-[#2D1515] hover:border-[#522020] hover:text-[#F5E8E8]'
                  }`}
                >
                  <span style={{ fontFamily: "'Cinzel', serif" }}>{f}</span>
                </button>
              ))}
            </div>

            {/* Level + Sort */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {LEVEL_FILTERS.map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setLevelFilter(f)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      levelFilter === f
                        ? 'bg-gradient-to-r from-[#8B0000] to-[#550A0A] text-white border-[#FF3D00] shadow-[0_0_12px_rgba(255,61,0,0.4)]'
                        : 'bg-[#120A0A] text-[#9E8B8B] border-[#2D1515] hover:border-[#522020] hover:text-[#F5E8E8]'
                    }`}
                  >
                    <span style={{ fontFamily: "'Cinzel', serif" }}>{f}</span>
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#140808] border border-[#3D1C1C] text-xs font-bold text-[#C4B5B5] hover:border-[#8C2828] cursor-pointer transition-colors shadow-md"
                >
                  <span style={{ fontFamily: "'Cinzel', serif" }}>Sort: {sortBy}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-1 z-20 bg-[#120707] border border-[#3D1C1C] rounded-xl shadow-2xl p-1 min-w-[170px]">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => { setSortBy(opt); setShowSortDropdown(false) }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          sortBy === opt ? 'bg-[#2A0E0E] text-[#FF8A80]' : 'text-[#A89898] hover:bg-[#1E0C0C]'
                        }`}
                      >
                        <span style={{ fontFamily: "'Cinzel', serif" }}>{opt}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── D. CHALLENGE CARDS CAROUSEL ── */}
          <div className="relative">
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory"
            >
              {filteredCards.map(c => (
                <div
                  key={c.id}
                  className={`snap-start shrink-0 w-[260px] rounded-2xl border overflow-hidden shadow-lg flex flex-col transition-all hover:-translate-y-1 ${
                    c.locked ? 'opacity-65' : ''
                  }`}
                  style={{
                    background: 'var(--theme-surface-card, #120808)',
                    borderColor: c.isDaily ? 'var(--theme-accent-glow, #FF3D00)' : 'var(--theme-border-default, #3D1C1C)',
                    boxShadow: 'var(--theme-shadow-card, 0 4px 16px rgba(0,0,0,0.6))',
                  }}
                >
                  {/* Card top */}
                  <div
                    className="p-4 flex items-center justify-between border-b"
                    style={{
                      background: 'var(--theme-surface-card-alt, #1A0A0A)',
                      borderColor: 'var(--theme-border-subtle, #2A1212)',
                    }}
                  >
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-pixel font-bold bg-[#240C0C] text-[#FF8A80] border border-[#8C2828]/60">
                      {c.tag}
                    </span>
                    <span className="text-3xl leading-none">{c.emoji}</span>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3
                      style={{ fontFamily: "'Cinzel', serif" }}
                      className="font-bold text-sm text-[#F5E8E8] leading-snug"
                    >
                      {c.title}
                    </h3>
                    <p className="text-[11px] text-[#8C7A7A] leading-relaxed flex-1">{c.description}</p>
                  </div>

                  {/* Card footer */}
                  <div className="px-4 pb-4 flex items-center justify-between gap-2 border-t border-[#200A0A] pt-3">
                    <span className="flex items-center gap-1 text-xs font-bold text-[#F5D060] font-mono">
                      <Sparkles className="w-3.5 h-3.5" />
                      +{c.xp} XP
                    </span>
                    {c.locked ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#180A0A] text-[#6E5A5A] text-xs font-bold border border-[#2D1414]">
                        Rune-Locked
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onStartChallenge?.(c.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95 bg-gradient-to-r from-[#8B0000] to-[#550A0A] hover:from-[#A81010] text-white border border-[#8C2828]"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span style={{ fontFamily: "'Cinzel', serif" }}>STRIKE</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll button */}
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#1A0A0A] border border-[#8C2828] shadow-md flex items-center justify-center text-[#F5E8E8] hover:bg-[#280C0C] cursor-pointer transition-all z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* ── E. ACHIEVEMENT ALTAR ── */}
          <div className="bg-[#0E0606] border border-[#3D1C1C] rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#240C0C] border border-[#8C2828] flex items-center justify-center text-2xl shrink-0">
                🏆
              </div>
              <div className="flex flex-col gap-0.5">
                <p
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="font-bold text-sm text-[#F5E8E8] tracking-wide uppercase"
                >
                  Conquer trials to forge trophies of Olympus!
                </p>
                <p className="text-xs text-[#8C7A7A]">
                  Earn divine badges, scale the Valhalla leaderboard, and unleash God of War rank.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT SIDEBAR (~25%)                                          */}
        {/* ============================================================ */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          {/* A. Practice Stats */}
          <div className="bg-[#0E0606] rounded-2xl p-5 border border-[#3D1C1C] shadow-lg space-y-4">
            <div
              style={{ fontFamily: "'Cinzel', serif" }}
              className="text-[10px] font-bold text-[#8C7A7A] uppercase tracking-widest border-b border-[#261010] pb-3"
            >
              WAR DEEDS
            </div>
            <div className="flex flex-col gap-3">
              {[
                { icon: '🎯', label: '36 Trials Slayed' },
                { icon: '⚡', label: '4 Day War Streak' },
                { icon: '🏆', label: '1,280 XP Hacksilver' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-3 text-sm">
                  <span className="text-xl w-8 shrink-0 text-center">{stat.icon}</span>
                  <span className="font-semibold text-[#D1C2C2]">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* B. Streak Quest */}
          <div className="bg-[#0E0606] rounded-2xl p-5 border border-[#3D1C1C] shadow-lg space-y-3">
            <div
              style={{ fontFamily: "'Cinzel', serif" }}
              className="text-[10px] font-bold text-[#8C7A7A] uppercase tracking-widest border-b border-[#261010] pb-3"
            >
              SPARTAN SHIELD STREAK
            </div>

            <div className="flex items-center justify-center py-2">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="text-5xl">🛡️</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    style={{ fontFamily: "'Cinzel', serif" }}
                    className="font-black text-xl text-[#F5D060] mt-1"
                  >
                    7
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p
                style={{ fontFamily: "'Cinzel', serif" }}
                className="font-black text-sm text-[#F5E8E8] uppercase tracking-wider"
              >
                7 Day War Streak
              </p>
              <p className="text-xs text-[#FF5722] mt-0.5">Blades of Chaos Blazing 🔥</p>
            </div>
          </div>

          {/* C. Top Warriors Leaderboard */}
          <div className="bg-[#0E0606] rounded-2xl p-5 border border-[#3D1C1C] shadow-lg space-y-3">
            <div
              style={{ fontFamily: "'Cinzel', serif" }}
              className="text-[10px] font-bold text-[#8C7A7A] uppercase tracking-widest border-b border-[#261010] pb-3"
            >
              OLYMPUS CHAMPIONS
            </div>

            <div className="flex flex-col gap-2">
              {LEADERBOARD.map(entry => (
                <div key={entry.rank} className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                    entry.rank === 1 ? 'bg-[#C59B27] text-black font-black' :
                    entry.rank === 2 ? 'bg-[#3D1C1C] text-[#C4B5B5]' :
                    entry.rank === 3 ? 'bg-[#240C0C] text-[#FF8A80]' : 'bg-[#140808] text-[#6E5A5A]'
                  }`}>
                    {entry.rank}
                  </span>
                  <span className="text-lg">{entry.emoji}</span>
                  <span className="flex-1 text-xs font-semibold text-[#D1C2C2] truncate">{entry.name}</span>
                  <span className="text-[11px] font-mono font-bold text-[#00E5FF] shrink-0">{entry.xp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
