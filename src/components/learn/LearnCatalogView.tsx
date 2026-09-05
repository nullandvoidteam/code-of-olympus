import React, { useState, useEffect } from 'react'
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  Check,
  Lock,
  Flame,
  Shield,
  Clock,
  BookOpen,
  Sparkles,
  Swords,
  Compass,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { COURSE_CATALOG } from '../../lib/courseData'
import type { CourseCatalogItem } from '../../lib/courseData'
import { getCourseProgress } from '../../lib/courseProgress'
import type { CourseProgress } from '../../lib/courseProgress'

interface LearnCatalogViewProps {
  onSelectCourse?: (courseId: string) => void
  onOpenLumi?: () => void
}

export type CategoryFilterKey =
  | 'all'
  | 'programming'
  | 'web'
  | 'ai'
  | 'game'
  | 'tools'
  | 'career'

/* ========================================================================= */
/* CLASSIC GAMIFIED LEARN CATALOG VIEW                                       */
/* ========================================================================= */
const ClassicLearnCatalogView: React.FC<LearnCatalogViewProps> = ({
  onSelectCourse,
  onOpenLumi,
}) => {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [progressMap, setProgressMap] = useState<Record<string, CourseProgress>>({})

  useEffect(() => {
    if (user) {
      getCourseProgress(user.id).then(map => setProgressMap(map))
    }
  }, [user])

  const courses = COURSE_CATALOG.map(c => ({
    ...c,
    progress: progressMap[c.id]?.progressPercent || 0,
    status: progressMap[c.id]?.status || 'start'
  }))

  const filteredCourses = courses.filter((c) => {
    const matchesCat = activeCategory === 'all' || c.category === activeCategory
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-7 text-left pb-20 select-none animate-in fade-in duration-300 font-sans">
      {/* 1. HERO BANNER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider self-start">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Coding Quests &amp; Courses</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Choose Your Coding Journey
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Master programming from the ground up with structured adventure paths, interactive editor challenges, and verified project certificates.
          </p>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
              🏆
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-emerald-800">Level 12</span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase">4,850 XP Earned</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTINUE YOUR QUEST SPOTLIGHT */}
      <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-3xl shrink-0">
            🐍
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">
                Continue Your Quest
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Chapter 04: Loops &amp; Logic
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Python Adventure
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>78% complete</span>
              <span>•</span>
              <span className="font-semibold text-emerald-600">3 quests remaining</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectCourse?.('python')}
            className="btn-gamified-3d btn-gamified-3d-primary py-2.5 px-6 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto"
          >
            <span>Continue Quest</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. FILTER TABS & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { key: 'all', label: 'All Courses' },
            { key: 'programming', label: 'Python & Data' },
            { key: 'web', label: 'Web & Frontend' },
            { key: 'ai', label: 'Artificial Intelligence' },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white shadow-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* 4. COURSES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                      {c.difficulty}
                    </span>
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                      ★ {c.rating}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1 leading-snug group-hover:text-emerald-700 transition-colors">
                    {c.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {c.description}
              </p>

              {/* Progress or Chapters */}
              {c.progress > 0 ? (
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{c.chapters} Chapters</span>
                    <span className="font-bold text-emerald-600">{c.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span>{c.chapters} Chapters</span>
                  <span>{c.hours}</span>
                  <span className="font-bold text-amber-600">+{c.xp} XP</span>
                </div>
              )}
            </div>

            {/* Action CTA */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onSelectCourse?.(c.id)}
                className={`w-full py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  c.status === 'completed'
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'btn-gamified-3d btn-gamified-3d-primary text-white'
                }`}
              >
                <span>
                  {c.status === 'completed'
                    ? 'Review Course'
                    : c.status === 'continue'
                    ? 'Continue Quest'
                    : 'Start Course'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 5. ASK LUMI AI BANNER */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-2xl shrink-0">
            🤖
          </div>
          <div className="flex flex-col">
            <h3 className="font-extrabold text-sm text-slate-900">
              Unsure which path to choose? Ask Lumi AI Mentor
            </h3>
            <p className="text-xs text-slate-500">
              Lumi analyzes your skill level, interests, and past challenges to recommend your next quest.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenLumi}
          className="btn-gamified-3d btn-gamified-3d-secondary px-5 py-2 rounded-xl text-xs font-bold text-slate-800 shrink-0 cursor-pointer"
        >
          <span>Ask Lumi AI</span>
        </button>
      </div>
    </div>
  )
}

/* ========================================================================= */
/* GOD OF WAR LEARN CATALOG VIEW (UNCHANGED)                                 */
/* ========================================================================= */
const GodOfWarLearnCatalogView: React.FC<LearnCatalogViewProps> = ({
  onSelectCourse,
  onOpenLumi,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilterKey>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories: Array<{ key: CategoryFilterKey; label: string; rune: string }> = [
    { key: 'all', label: 'All Sagas', rune: 'ᚠ' },
    { key: 'programming', label: 'Core Sorcery', rune: 'ᚢ' },
    { key: 'web', label: 'Realm Weaving', rune: 'ᚦ' },
    { key: 'ai', label: 'Oracle & Runes', rune: 'ᚨ' },
    { key: 'game', label: 'Combat Engines', rune: 'ᚱ' },
    { key: 'tools', label: 'Dwarven Forge', rune: 'ᚲ' },
    { key: 'career', label: 'Valhalla Path', rune: 'ᚷ' },
  ]

  const pathNodes = [
    {
      step: 'MORTAL FOUNDATIONS',
      title: 'HTML & CSS',
      realm: 'Midgard',
      status: 'completed',
      sub: 'ᚱ Web Glyphs',
    },
    {
      step: 'SPARTAN LOGIC',
      title: 'Python Lore',
      realm: 'Sparta',
      status: 'current',
      sub: 'ᛟ Python Rite',
    },
    {
      step: 'DYNAMIC WILL',
      title: 'JavaScript',
      realm: 'Alfheim',
      status: 'locked',
      sub: 'ᚦ Light Runes',
    },
    {
      step: 'COMPONENT ARCHITECTURE',
      title: 'React Forge',
      realm: 'Nidavellir',
      status: 'locked',
      sub: 'ᚲ Dwarven UI',
    },
    {
      step: 'PROPHECY & INTELLECT',
      title: 'AI Oracle',
      realm: 'Jotunheim',
      status: 'locked',
      sub: 'ᚨ Giant Wisdom',
    },
    {
      step: 'GODHOOD ASCENSION',
      title: 'Grand Trials',
      realm: 'Asgard',
      status: 'locked',
      sub: 'ᛏ War Projects',
    },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-7 text-left pb-20 select-none animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. WAR CODEX BANNER (GOD OF WAR SANCTUARY)                                */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8 bg-[#0D0808] border border-[#3D1C1C] shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
        {/* Background glow and Omega watermark */}
        <div className="absolute -right-10 -bottom-14 text-[220px] font-serif font-black text-red-950/20 pointer-events-none select-none leading-none">
          Ω
        </div>
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-red-600/10 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-20 bg-amber-600/10 blur-[80px] pointer-events-none" />

        {/* Top Magma Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF3D00] to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF3D00] shadow-[0_0_8px_#FF3D00] animate-pulse" />
              <span
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-[11px] font-black tracking-[0.25em] text-[#FF5722] uppercase"
              >
                THE SACRED ARCHIVES OF OLYMPUS & YGGDRASIL
              </span>
              <span className="text-amber-500/60 text-xs">⚔</span>
            </div>

            <h1
              style={{ fontFamily: "'Cinzel', serif" }}
              className="text-2xl sm:text-4xl font-extrabold text-[#F5E8E8] tracking-wider uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
            >
              Choose Your Next Trial
            </h1>

            <p className="text-xs sm:text-sm text-[#A89898] leading-relaxed max-w-xl">
              Forge your divine code through battle-tested trials, sacred algorithms, and epic real-world projects. Master every realm from Midgard to Asgard.
            </p>
          </div>

          {/* Quick War Stats / Seal */}
          <div className="flex items-center gap-4 border border-[#3D1C1C] bg-[#140B0B]/80 backdrop-blur-md px-5 py-3.5 rounded-xl shadow-inner">
            <div className="flex flex-col items-center border-r border-[#3D1C1C] pr-4">
              <span
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-[10px] text-[#A89898] tracking-widest uppercase font-bold"
              >
                REALMS UNLOCKED
              </span>
              <span
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-xl font-black text-[#F5D060] drop-shadow-[0_0_8px_rgba(245,208,96,0.3)]"
              >
                3 / 9
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-[10px] text-[#A89898] tracking-widest uppercase font-bold"
              >
                HACKSILVER
              </span>
              <span
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-xl font-black text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]"
              >
                +2,400 XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RUNIC SEARCH & REALM FILTERS                                           */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-3">
        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C2828] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sagas, divine languages, or combat skills (e.g., Python, Loops, React)..."
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#120A0A] border border-[#3D1C1C] text-xs sm:text-sm text-[#F5E8E8] placeholder:text-[#6E5A5A] focus:outline-none focus:border-[#FF3D00] focus:ring-1 focus:ring-[#FF3D00]/40 transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]"
            />
          </div>

          <button
            type="button"
            className="h-12 px-5 rounded-xl bg-[#170C0C] border border-[#3D1C1C] hover:border-[#8C2828] text-[#C4B5B5] hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#8C2828]" />
            <span style={{ fontFamily: "'Cinzel', serif" }} className="tracking-wider text-xs">
              Filters
            </span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-[#8C7A7A] font-medium">
            <Compass className="w-3.5 h-3.5 text-[#FF3D00]" />
            <span>24 Epic Sagas Available Across Realms</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.key
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8B0000] to-[#550A0A] text-[#FFE4E4] border border-[#FF3D00] shadow-[0_0_15px_rgba(255,61,0,0.4)]'
                      : 'bg-[#120A0A] text-[#9E8B8B] hover:text-[#F5E8E8] border border-[#2D1515] hover:border-[#522020]'
                  }`}
                >
                  <span className="text-[#FF5722] text-[11px]">{cat.rune}</span>
                  <span style={{ fontFamily: "'Cinzel', serif" }} className="tracking-wider text-[11px]">
                    {cat.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FEATURED SAGA: PYTHON ADVENTURE (GOD OF WAR ALTAR)                     */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-[#160A0A] via-[#0E0606] to-[#0A0404] border-2 border-[#8C2828]/80 shadow-[0_8px_32px_rgba(0,0,0,0.9)] flex flex-col justify-between gap-6 overflow-hidden group">
        {/* Magma ambient backlight */}
        <div className="absolute -top-16 right-10 w-96 h-48 bg-[#FF3D00]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-32 bg-[#DC2626]/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Top Badges */}
        <div className="flex items-center justify-between relative z-10 flex-wrap gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#240C0C] border border-[#8C2828] text-[#FF8A80] text-[10.5px] font-bold shadow-md">
            <Flame className="w-3.5 h-3.5 text-[#FF3D00] animate-pulse" />
            <span style={{ fontFamily: "'Cinzel', serif" }} className="tracking-widest">
              ACTIVE TRIAL • SPARTAN FAVOR
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1C1206] border border-[#C59B27] text-[#F5D060] text-[11px] font-bold shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#F5D060]" />
            <span style={{ fontFamily: "'Cinzel', serif" }} className="tracking-wider">
              +2,400 HACKSILVER XP
            </span>
          </div>
        </div>

        {/* Main Altar Body */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4 flex-1">
            {/* Serpent Rune Icon */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-b from-[#240F0F] to-[#120606] border border-[#8C2828] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(140,40,40,0.5)]">
              <span className="text-2xl">🐍</span>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <h2
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-2xl sm:text-3xl font-black text-[#F5E8E8] tracking-wide uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                >
                  Python Adventure: Jormungandr Lore
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-[#B0A0A0] leading-relaxed max-w-2xl">
                Master variables, control flows, and divine scripts. From your first ritual variable to summoning autonomous battle algorithms.
              </p>

              {/* Meta Tags */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                <span className="px-2.5 py-0.5 rounded bg-[#2A0E0E] border border-[#8C2828]/60 text-[#FF9E80] font-bold text-[11px]">
                  PYTHON 3.12
                </span>
                <span className="px-2.5 py-0.5 rounded bg-[#102028] border border-[#00E5FF]/40 text-[#00E5FF] font-bold text-[11px]">
                  Mortal → Hero
                </span>
                <span className="flex items-center gap-1 text-[#8C7A7A] text-[11.5px] font-medium">
                  <BookOpen className="w-3.5 h-3.5 text-[#8C2828]" /> 18 Trials
                </span>
                <span className="flex items-center gap-1 text-[#8C7A7A] text-[11.5px] font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#8C2828]" /> 8–10 Hours
                </span>
              </div>

              {/* Progress Bar with Molten Lava Glow */}
              <div className="flex items-center gap-3 mt-2 max-w-lg">
                <div className="flex-1 h-2.5 bg-[#1F0A0A] rounded-full overflow-hidden border border-[#3D1C1C] p-[1px]">
                  <div
                    className="h-full bg-gradient-to-r from-[#991B1B] via-[#DC2626] to-[#FF3D00] rounded-full shadow-[0_0_10px_#FF3D00]"
                    style={{ width: '78%' }}
                  />
                </div>
                <span className="text-xs text-[#A89898] font-medium">Trial 4 of 6</span>
                <span
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-xs font-black text-[#FF5722]"
                >
                  78% FORGED
                </span>
              </div>
            </div>
          </div>

          {/* Right War Emblem / Leviathan Freeze */}
          <div className="hidden lg:flex shrink-0 w-64 h-32 rounded-xl bg-gradient-to-br from-[#1A0C0C] to-[#0A0404] border border-[#3D1C1C] items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,61,0,0.15),transparent_70%)]" />
            <div className="relative z-10 flex flex-col items-center text-center gap-1">
              <Swords className="w-8 h-8 text-[#FF3D00] drop-shadow-[0_0_8px_#FF3D00]" />
              <span
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-[11px] font-bold text-[#F5D060] tracking-widest uppercase mt-1"
              >
                BLADES OF CHAOS READY
              </span>
              <span className="text-[10px] text-[#8C7A7A]">Next: While Loops of Helheim</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#3D1C1C] relative z-10">
          <button
            type="button"
            onClick={() => onSelectCourse && onSelectCourse('python')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8B0000] via-[#B91C1C] to-[#EF4444] hover:from-[#991B1B] hover:to-[#FF3D00] text-white text-xs sm:text-sm font-black tracking-wider transition-all shadow-[0_0_18px_rgba(220,38,38,0.6)] flex items-center gap-2 cursor-pointer border border-[#FF5722]/50 active:scale-95"
          >
            <span style={{ fontFamily: "'Cinzel', serif" }}>ENTER TRIAL</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onSelectCourse && onSelectCourse('python')}
            className="px-5 py-2.5 rounded-xl bg-[#1A0E0E] hover:bg-[#251414] text-[#D1C2C2] hover:text-white border border-[#3D1C1C] text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            <span style={{ fontFamily: "'Cinzel', serif" }}>INSPECT RUNE TREE</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. REALM SAGAS GRID (3-COLUMN GRID OF 6 STONE TABLETS)                    */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 px-1">
          <Shield className="w-4 h-4 text-[#FF3D00]" />
          <h2
            style={{ fontFamily: "'Cinzel', serif" }}
            className="text-lg font-bold text-[#F5E8E8] tracking-wider uppercase"
          >
            Sagas Across the Nine Realms
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* ------------------------------------------------------------- */}
          {/* COURSE 01: PYTHON ADVENTURE                                  */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-[#120808] rounded-2xl p-5 border border-[#3D1C1C] hover:border-[#8C2828] shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-all flex flex-col justify-between gap-4 group hover:shadow-[0_4px_24px_rgba(140,40,40,0.4)]">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#200A0A] border border-[#8C2828] flex items-center justify-center shrink-0 shadow-inner">
                  <span className="text-2xl">🐍</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded bg-[#240C0C] text-[#FF8A80] font-pixel text-[9px] font-bold uppercase border border-[#8C2828]/40">
                    PYTHON
                  </span>
                  <h3
                    style={{ fontFamily: "'Cinzel', serif" }}
                    className="font-bold text-sm text-[#F5E8E8] mt-1 group-hover:text-[#FF5722] transition-colors truncate"
                  >
                    Python: World Serpent
                  </h3>
                  <p className="text-xs text-[#8C7A7A] line-clamp-2 mt-0.5 leading-relaxed">
                    Learn programming fundamentals through the ancient scrolls of Midgard.
                  </p>
                </div>
              </div>

              {/* Meta details */}
              <div className="flex items-center justify-between text-xs text-[#8C7A7A] font-medium pt-2 border-t border-[#261010]">
                <span className="text-[11px] font-bold text-[#00E5FF]">Beginner</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-[#8C2828]" /> 8–10 hours
                </span>
                <span
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-[10.5px] font-bold text-[#F5D060]"
                >
                  +2,400 XP
                </span>
              </div>
            </div>

            {/* Progress & CTA */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex-1 h-2 bg-[#1C0A0A] rounded-full overflow-hidden mr-3 border border-[#3D1C1C]">
                  <div
                    className="h-full bg-gradient-to-r from-[#991B1B] to-[#FF3D00]"
                    style={{ width: '78%' }}
                  />
                </div>
                <span
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-[10px] font-bold text-[#FF5722]"
                >
                  78%
                </span>
              </div>

              <button
                type="button"
                onClick={() => onSelectCourse && onSelectCourse('python')}
                className="w-full py-2.5 bg-gradient-to-r from-[#8B0000] to-[#550A0A] hover:from-[#A81010] hover:to-[#730E0E] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border border-[#8C2828] active:scale-95"
              >
                <span style={{ fontFamily: "'Cinzel', serif" }} className="tracking-wider">
                  CONTINUE TRIAL
                </span>
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COURSE 02: JAVASCRIPT JOURNEY                                */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-[#120808] rounded-2xl p-5 border border-[#3D1C1C] hover:border-[#8C2828] shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-all flex flex-col justify-between gap-4 group hover:shadow-[0_4px_24px_rgba(140,40,40,0.4)]">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#200A0A] border border-[#8C2828] flex items-center justify-center shrink-0 shadow-inner">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded bg-[#240C0C] text-[#F5D060] font-pixel text-[9px] font-bold uppercase border border-[#C59B27]/40">
                    JAVASCRIPT
                  </span>
                  <h3
                    style={{ fontFamily: "'Cinzel', serif" }}
                    className="font-bold text-sm text-[#F5E8E8] mt-1 group-hover:text-[#F5D060] transition-colors truncate"
                  >
                    JavaScript: Lightning of Zeus
                  </h3>
                  <p className="text-xs text-[#8C7A7A] line-clamp-2 mt-0.5 leading-relaxed">
                    Master interactive web lightning and dynamic DOM manipulation.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#8C7A7A] font-medium pt-2 border-t border-[#261010]">
                <span className="text-[11px] font-bold text-[#F5D060]">Hero Tier</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-[#8C2828]" /> 10–12 hours
                </span>
                <span
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-[10.5px] font-bold text-[#F5D060]"
                >
                  +3,000 XP
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#6E5A5A] font-medium">Dormant</span>
              <button
                type="button"
                onClick={() => onSelectCourse && onSelectCourse('javascript')}
                className="px-5 py-2.5 bg-gradient-to-r from-[#8B0000] to-[#550A0A] hover:from-[#A81010] hover:to-[#730E0E] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border border-[#8C2828] active:scale-95"
              >
                <span style={{ fontFamily: "'Cinzel', serif" }} className="tracking-wider">
                  START TRIAL
                </span>
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COURSE 03: WEB BUILDER (HTML + CSS)                          */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-[#120808] rounded-2xl p-5 border border-[#3D1C1C] hover:border-[#8C2828] shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-all flex flex-col justify-between gap-4 group hover:shadow-[0_4px_24px_rgba(140,40,40,0.4)]">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#200A0A] border border-[#8C2828] flex items-center justify-center shrink-0 shadow-inner">
                  <span className="text-2xl">🏛️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded bg-[#240C0C] text-[#FF8A80] font-pixel text-[9px] font-bold uppercase border border-[#8C2828]/40">
                    HTML + CSS
                  </span>
                  <h3
                    style={{ fontFamily: "'Cinzel', serif" }}
                    className="font-bold text-sm text-[#F5E8E8] mt-1 group-hover:text-[#FF5722] transition-colors truncate"
                  >
                    Temple Builder: CSS Glyphs
                  </h3>
                  <p className="text-xs text-[#8C7A7A] line-clamp-2 mt-0.5 leading-relaxed">
                    Carve monumental architectures and responsive layouts into stone.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#8C7A7A] font-medium pt-2 border-t border-[#261010]">
                <span className="text-[11px] font-bold text-[#00E5FF]">Completed</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-[#8C2828]" /> 6–8 hours
                </span>
                <span
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-[10.5px] font-bold text-[#F5D060]"
                >
                  +1,800 XP
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#00E5FF] font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Conquered
              </span>
              <button
                type="button"
                onClick={() => onSelectCourse && onSelectCourse('web-builder')}
                className="px-5 py-2.5 bg-[#1C0E0E] hover:bg-[#2B1414] text-[#D1C2C2] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#3D1C1C]"
              >
                <span style={{ fontFamily: "'Cinzel', serif" }}>REVIEW RITES</span>
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COURSE 04: REACT REALMS                                      */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-[#120808]/70 rounded-2xl p-5 border border-[#2A1414] shadow-md flex flex-col justify-between gap-4 group opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#1A0A0A] border border-[#3D1C1C] flex items-center justify-center shrink-0">
                  <span className="text-2xl">⚛️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded bg-[#1C0A0A] text-[#00E5FF] font-pixel text-[9px] font-bold uppercase border border-[#00E5FF]/30">
                    REACT
                  </span>
                  <h3
                    style={{ fontFamily: "'Cinzel', serif" }}
                    className="font-bold text-sm text-[#D1C2C2] mt-1 truncate"
                  >
                    React Realms: Dwarven UI
                  </h3>
                  <p className="text-xs text-[#6E5A5A] line-clamp-2 mt-0.5 leading-relaxed">
                    Build reactive runes with components, state machines, and hooks.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#6E5A5A] font-medium pt-2 border-t border-[#261010]">
                <span className="text-[11px] font-semibold text-[#8C7A7A]">Hero Tier</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-[#3D1C1C]" /> 12–15 hours
                </span>
                <span
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-[10.5px] font-bold text-[#F5D060]/70"
                >
                  +3,600 XP
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#8C2828] font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#8C2828]" /> Rune-Locked
              </span>
              <button
                type="button"
                className="px-3.5 py-2 bg-[#1C0E0E] text-[#8C7A7A] rounded-xl text-xs font-bold border border-[#2D1414] cursor-not-allowed"
              >
                <span style={{ fontFamily: "'Cinzel', serif" }}>REQUIREMENTS</span>
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COURSE 05: AI EXPLORER                                       */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-[#120808]/70 rounded-2xl p-5 border border-[#2A1414] shadow-md flex flex-col justify-between gap-4 group opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#1A0A0A] border border-[#3D1C1C] flex items-center justify-center shrink-0">
                  <span className="text-2xl">👁️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded bg-[#1C0A0A] text-[#FF5722] font-pixel text-[9px] font-bold uppercase border border-[#FF3D00]/30">
                    ORACLE AI
                  </span>
                  <h3
                    style={{ fontFamily: "'Cinzel', serif" }}
                    className="font-bold text-sm text-[#D1C2C2] mt-1 truncate"
                  >
                    Mimir&apos;s Oracle: AI Lore
                  </h3>
                  <p className="text-xs text-[#6E5A5A] line-clamp-2 mt-0.5 leading-relaxed">
                    Build intelligent agents and converse with ancient LLM wisdom.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#6E5A5A] font-medium pt-2 border-t border-[#261010]">
                <span className="text-[11px] font-semibold text-[#8C7A7A]">God Tier</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-[#3D1C1C]" /> 14–18 hours
                </span>
                <span
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-[10.5px] font-bold text-[#F5D060]/70"
                >
                  +4,000 XP
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#8C2828] font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#8C2828]" /> Rune-Locked
              </span>
              <button
                type="button"
                className="px-3.5 py-2 bg-[#1C0E0E] text-[#8C7A7A] rounded-xl text-xs font-bold border border-[#2D1414] cursor-not-allowed"
              >
                <span style={{ fontFamily: "'Cinzel', serif" }}>REQUIREMENTS</span>
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* COURSE 06: GAME MAKER                                        */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-[#120808] rounded-2xl p-5 border border-[#3D1C1C] hover:border-[#8C2828] shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-all flex flex-col justify-between gap-4 group hover:shadow-[0_4px_24px_rgba(140,40,40,0.4)]">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#200A0A] border border-[#8C2828] flex items-center justify-center shrink-0 shadow-inner">
                  <span className="text-2xl">⚔️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded bg-[#240C0C] text-[#FF8A80] font-pixel text-[9px] font-bold uppercase border border-[#8C2828]/40">
                    COMBAT ENGINE
                  </span>
                  <h3
                    style={{ fontFamily: "'Cinzel', serif" }}
                    className="font-bold text-sm text-[#F5E8E8] mt-1 group-hover:text-[#FF5722] transition-colors truncate"
                  >
                    Valhalla: 2D Combat Forge
                  </h3>
                  <p className="text-xs text-[#8C7A7A] line-clamp-2 mt-0.5 leading-relaxed">
                    Code collision physics, boss mechanics, and Spartan rage meters.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#8C7A7A] font-medium pt-2 border-t border-[#261010]">
                <span className="text-[11px] font-bold text-[#F5D060]">Hero Tier</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-[#8C2828]" /> 12–16 hours
                </span>
                <span
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-[10.5px] font-bold text-[#F5D060]"
                >
                  +3,800 XP
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#6E5A5A] font-medium">Dormant</span>
              <button
                type="button"
                onClick={() => onSelectCourse && onSelectCourse('game-maker')}
                className="px-5 py-2.5 bg-gradient-to-r from-[#8B0000] to-[#550A0A] hover:from-[#A81010] hover:to-[#730E0E] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border border-[#8C2828] active:scale-95"
              >
                <span style={{ fontFamily: "'Cinzel', serif" }} className="tracking-wider">
                  START TRIAL
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. RECOMMENDED PATH: YGGDRASIL REALM PROGRESSION                          */}
      {/* ========================================================================= */}
      <div className="bg-[#0E0606] rounded-2xl p-6 sm:p-7 border border-[#3D1C1C] shadow-[0_8px_32px_rgba(0,0,0,0.85)] flex flex-col gap-5 relative overflow-hidden">
        {/* Subtle background rune pattern */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF3D00]/50 to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[#FF3D00] text-lg">ᚲ</span>
            <h3
              style={{ fontFamily: "'Cinzel', serif" }}
              className="font-bold text-base text-[#F5E8E8] tracking-wider uppercase"
            >
              Yggdrasil Ascension Path
            </h3>
          </div>
          <span className="text-xs text-[#8C7A7A] font-medium">
            The ordained sequence from mortal initiate to God of Code.
          </span>
        </div>

        {/* Node progression trail */}
        <div className="relative flex items-center justify-between gap-2 overflow-x-auto py-5 px-2 scrollbar-none">
          {/* Blood-iron track background */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-3 h-1 bg-[#261010] z-0" />
          {/* Active Molten lava progress */}
          <div className="absolute left-8 w-[25%] top-1/2 -translate-y-3 h-1 bg-gradient-to-r from-[#991B1B] via-[#DC2626] to-[#FF3D00] shadow-[0_0_10px_#FF3D00] z-0" />

          {pathNodes.map((node, nIdx) => {
            const isCompleted = node.status === 'completed'
            const isCurrent = node.status === 'current'

            return (
              <div
                key={nIdx}
                className="relative z-10 flex flex-col items-center gap-2.5 min-w-[110px]"
              >
                {/* Node rune tablet */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs shadow-lg transition-all ${
                    isCompleted
                      ? 'bg-[#102A1C] text-[#00E5FF] border border-[#00E5FF]/60 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                      : isCurrent
                      ? 'bg-[#2A0E0E] text-[#FF5722] border-2 border-[#FF3D00] shadow-[0_0_16px_rgba(255,61,0,0.6)] animate-pulse'
                      : 'bg-[#140808] text-[#554040] border border-[#2D1414]'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : isCurrent ? (
                    <Flame className="w-5 h-5 text-[#FF3D00]" />
                  ) : (
                    <Lock className="w-4 h-4 text-[#554040]" />
                  )}
                </div>

                <div className="flex flex-col items-center text-center">
                  <span
                    style={{ fontFamily: "'Cinzel', serif" }}
                    className="text-[9px] text-[#8C7A7A] font-bold uppercase tracking-wider"
                  >
                    {node.step}
                  </span>
                  <span
                    style={{ fontFamily: "'Cinzel', serif" }}
                    className={`text-[11px] font-bold mt-0.5 ${
                      isCurrent
                        ? 'text-[#FF5722]'
                        : isCompleted
                        ? 'text-[#00E5FF]'
                        : 'text-[#554040]'
                    }`}
                  >
                    {node.sub}
                  </span>
                  <span className="text-[9.5px] text-[#6E5A5A] mt-0.5">{node.realm}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. BOTTOM ORACLE SUMMON: MIMIR CONSULTATION                               */}
      {/* ========================================================================= */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#170B0B] via-[#100707] to-[#1A0C0C] border border-[#3D1C1C] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-32 bg-[#FF3D00]/5 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-[#240C0C] border border-[#8C2828] flex items-center justify-center text-2xl shrink-0 shadow-[0_0_12px_rgba(140,40,40,0.5)]">
            👁️
          </div>
          <div>
            <h3
              style={{ fontFamily: "'Cinzel', serif" }}
              className="font-bold text-sm sm:text-base text-[#F5E8E8] tracking-wider uppercase"
            >
              Consult Mimir: The Smartest Head Alive
            </h3>
            <p className="text-xs text-[#8C7A7A] mt-0.5">
              Unsure which trial to conquer next? Mimir will analyze your combat deeds and guide your path.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenLumi}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#550A0A] hover:from-[#A81010] hover:to-[#730E0E] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-[#8C2828] active:scale-95"
        >
          <span style={{ fontFamily: "'Cinzel', serif" }} className="tracking-wider">
            SUMMON MIMIR
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export const LearnCatalogView: React.FC<LearnCatalogViewProps> = (props) => {
  const { theme } = useTheme()
  if (theme === 'classic') {
    return <ClassicLearnCatalogView {...props} />
  }
  return <GodOfWarLearnCatalogView {...props} />
}
