import React from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Flame,
  Clock,
  BookOpen,
  Award,
  Sparkles,
  Swords,
  Shield,
  Zap,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { COURSE_CATALOG } from '../../lib/courseData'
import {
  getCourseProgress,
  getDetailedCourseProgress,
  saveCourseProgress,
  PYTHON_CHAPTERS,
} from '../../lib/courseProgress'
import type {
  CourseProgress,
  DynamicCourseProgress,
  ChapterItem,
} from '../../lib/courseProgress'
import { useAuth } from '../../context/AuthContext'
import { SpiderNetDecal } from '../ui/SpiderNetDecal'
import { SpiderMaskSticker, ThwipSticker, SpiderSenseSticker } from '../ui/SpiderStickers'

interface CourseDetailViewProps {
  courseId: string
  onBackToCourses: () => void
  onStartQuest?: () => void
  onSelectLesson?: (lessonId: string) => void
  onOpenLumi?: () => void
}

/* ========================================================================= */
/* CLASSIC THEME IMPLEMENTATION (Matches Screenshot 1 Exactly)               */
/* ========================================================================= */
const ClassicCourseDetailView: React.FC<CourseDetailViewProps> = ({
  courseId,
  onBackToCourses,
  onStartQuest,
  onSelectLesson,
  onOpenLumi,
}) => {
  const course = COURSE_CATALOG.find(c => c.id === courseId) || COURSE_CATALOG[0]
  const { user } = useAuth()
  const [dynamicProgress, setDynamicProgress] = React.useState<DynamicCourseProgress | null>(null)
  const [, setLoading] = React.useState<boolean>(true)

  const refreshProgress = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDetailedCourseProgress(user?.id, course.id)
      setDynamicProgress(data)
    } finally {
      setLoading(false)
    }
  }, [user?.id, course.id])

  React.useEffect(() => {
    refreshProgress()
  }, [refreshProgress])

  const progressPercent = dynamicProgress?.progressPercent ?? 0
  const completedCount = dynamicProgress?.completedChaptersCount ?? 0
  const totalCount = dynamicProgress?.totalChaptersCount ?? 6
  const remainingCount = Math.max(0, totalCount - completedCount)
  const chapters = dynamicProgress?.chapters ?? PYTHON_CHAPTERS.map((ch, i) => ({ ...ch, status: (i === 0 ? 'current' : 'locked') as 'completed' | 'current' | 'locked' }))
  const activeChapter = chapters.find(c => c.status === 'current') || chapters[0]
  const remainingXP = chapters.filter(c => c.status !== 'completed').reduce((sum, c) => sum + c.xp, 0)
  const isFinished = progressPercent >= 100

  const handleStartOrContinue = async () => {
    if (user?.id && progressPercent === 0) {
      await saveCourseProgress(user.id, course.id, 15, activeChapter.lessonId)
      await refreshProgress()
    }
    if (onSelectLesson) {
      onSelectLesson(activeChapter.lessonId)
    } else if (onStartQuest) {
      onStartQuest()
    }
  }

  const handleSelectChapter = async (ch: ChapterItem) => {
    if (ch.status === 'locked') return
    if (onSelectLesson) {
      onSelectLesson(ch.lessonId)
    } else if (onStartQuest) {
      onStartQuest()
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 text-left pb-20 select-none animate-in fade-in duration-300">
      {/* 1. TOP BREADCRUMB & BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToCourses}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer py-1.5"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Back to Courses</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Learn</span>
          <span>/</span>
          <span className="capitalize">{course.category}</span>
          <span>/</span>
          <span className="text-slate-800 font-bold">{course.title}</span>
        </div>
      </div>

      {/* 2. HERO CARD */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-white border-2 border-emerald-500 shadow-sm flex flex-col justify-between gap-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left info */}
          <div className="flex flex-col gap-3 flex-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 font-bold text-[11px] tracking-wide flex items-center gap-1.5 uppercase font-mono">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                {course.category} • {course.difficulty}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight gamified-shaky-title">
              {course.title}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed max-w-xl font-normal">
              {course.description}
            </p>

            <div className="flex items-center gap-3 text-xs pt-1 flex-wrap">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <span>★★★★★</span>
                <span className="text-slate-800 font-bold ml-1">{course.rating}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">{course.students} adventurers</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap pt-1 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" /> {totalCount} Chapters
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {course.hours}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                {course.difficulty}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> +{course.xp.toLocaleString()} XP
              </span>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleStartOrContinue}
                className="btn-gamified-3d btn-gamified-3d-primary px-6 py-3 rounded-xl text-sm font-extrabold text-white flex items-center gap-2 cursor-pointer"
              >
                <span>{isFinished ? 'Review Quest' : progressPercent > 0 ? 'Continue Quest' : 'Start Adventure'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('curriculum-section')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="btn-gamified-3d btn-gamified-3d-secondary px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer"
              >
                <span>Preview Curriculum</span>
              </button>
            </div>
          </div>

          {/* Right Banner Preview */}
          <div className="shrink-0 w-full lg:w-[420px] rounded-2xl overflow-hidden border border-emerald-100 bg-gradient-to-r from-emerald-50/40 to-sky-50/40 p-5 flex flex-col justify-between relative shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-lg shadow-sm">
                  🏆
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">COURSE REWARD</span>
                  <span className="text-xs font-extrabold text-slate-800">+{course.xp.toLocaleString()} XP • {course.rewardTitle}</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 shadow-sm flex items-center justify-center text-xl">
                {course.icon}
              </div>
            </div>

            <div className="py-4 flex items-center justify-around gap-2 text-center">
              <div>
                <div className="text-2xl">🧑‍💻</div>
                <span className="text-[10px] font-bold text-slate-600">Adventurer</span>
              </div>
              <div className="text-emerald-400 font-black">➔</div>
              <div>
                <div className="text-2xl">🤖</div>
                <span className="text-[10px] font-bold text-slate-600">Lumi</span>
              </div>
              <div className="text-emerald-400 font-black">➔</div>
              <div>
                <div className="text-2xl">📜</div>
                <span className="text-[10px] font-bold text-slate-600">Certificate</span>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-100">
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                <span>YOUR PROGRESS</span>
                <span className="text-emerald-600 font-mono font-bold">
                  {progressPercent}% ({completedCount} of {totalCount} Chapters)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ROW 2: WHAT YOU'LL LEARN & SKILLS YOU'LL UNLOCK */}
      {(course.whatYouWillLearn || course.skillsUnlocked) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {course.whatYouWillLearn && (
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                  What You&apos;ll Learn
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs font-medium text-slate-700">
                {course.whatYouWillLearn.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {course.skillsUnlocked && (
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                  Skills You&apos;ll Unlock
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {course.skillsUnlocked.map((skill, idx) => (
                  <span key={idx} className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${skill.colorClass}`}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MAIN 3-COLUMN SECTION */}
      <div id="curriculum-section" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: CHAPTER TIMELINE (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                Your Adventure
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Complete each chapter to unlock the next.
            </p>
          </div>

          <div className="relative flex flex-col gap-5 pt-2">
            <div className="absolute left-3.5 top-6 bottom-6 w-0.5 bg-slate-200 z-0" />
            <div
              className="absolute left-3.5 top-6 w-0.5 bg-emerald-500 z-0 transition-all duration-500"
              style={{ height: `${Math.min(100, Math.max(5, (completedCount / totalCount) * 100))}%` }}
            />

            {chapters.map((ch, idx) => {
              const isCompleted = ch.status === 'completed'
              const isCurrent = ch.status === 'current'
              const isLocked = ch.status === 'locked'

              if (isCompleted) {
                return (
                  <div
                    key={ch.num}
                    onClick={() => handleSelectChapter(ch)}
                    className="relative z-10 flex items-start gap-3.5 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Chapter {ch.num}</div>
                        <h3 className="text-xs font-bold text-slate-800">{ch.title}</h3>
                        <span className="text-[10px] text-emerald-600 font-semibold">✓ Completed</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Award className="w-3 h-3 text-amber-500" />
                        <span>+{ch.xp} XP</span>
                      </div>
                    </div>
                  </div>
                )
              }

              if (isCurrent) {
                return (
                  <div key={ch.num} className="relative z-10 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>
                    <div className="flex-1 bg-emerald-50/60 rounded-xl p-4 border-2 border-emerald-500 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-emerald-700 font-bold uppercase">Chapter {ch.num}</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold uppercase">
                            ACTIVE QUEST
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-700">+{ch.xp} XP</span>
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">{ch.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{ch.description}</p>
                      <button
                        type="button"
                        onClick={() => handleSelectChapter(ch)}
                        className="mt-1 btn-gamified-3d btn-gamified-3d-primary py-2 px-4 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer w-fit"
                      >
                        <span>{progressPercent > 0 ? 'Resume Chapter' : 'Start Chapter'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              }

              return (
                <div key={ch.num} className="relative z-10 flex items-start gap-3.5 opacity-60">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Chapter {ch.num}</div>
                      <h3 className="text-xs font-bold text-slate-600">{ch.title}</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Complete Chapter 0{idx}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* MIDDLE COLUMN: ACTIVE QUEST + FINAL PROJECT + LUMI (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* CURRENT QUEST CARD */}
          <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                CURRENT QUEST
              </span>
              <span className="text-xs font-bold text-amber-600">
                ⭐ +{activeChapter.xp} XP
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                  {activeChapter.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeChapter.description}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                  <span className="text-amber-600 font-bold">★★☆☆☆ Easy</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> 20 min
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 shrink-0 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shadow-sm">
                🎮
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartOrContinue}
              className="btn-gamified-3d btn-gamified-3d-primary w-full py-2.5 text-xs font-extrabold text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isFinished ? 'Review Quest' : progressPercent > 0 ? 'Resume Quest' : 'Start Quest'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* FINAL PROJECT CARD */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Final Course Project
              </h3>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-16 h-14 shrink-0 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl">
                💻
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <h4 className="font-bold text-xs text-slate-900">
                  Interactive Terminal RPG
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Build an interactive command line game with player inventory and encounters.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 text-[9.5px] font-bold">
                    Python 3
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[9.5px] font-bold">
                    🏆 Certificate
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LUMI GUIDANCE */}
          <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200 shadow-sm flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xl shrink-0">
                🤖
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-xs text-slate-900">
                  Lumi&apos;s Guidance
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {progressPercent === 0
                    ? `\u201CWelcome to Python Adventure! Begin with Chapter 01: ${activeChapter.title} to start your coding path.\u201D`
                    : isFinished
                      ? `\u201CIncredible job! You've achieved 100% completion in Python Adventure. Check your certificate and tackle coding challenges!\u201D`
                      : `\u201CYou're ${progressPercent}% through Python Adventure! Complete Chapter ${activeChapter.num}: ${activeChapter.title} next \u2014 more adventures await!\u201D`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleStartOrContinue}
                className="btn-gamified-3d btn-gamified-3d-primary flex-1 py-2 text-xs font-bold text-white rounded-lg cursor-pointer"
              >
                <span>{progressPercent > 0 ? 'Continue Quest' : 'Start Adventure'}</span>
              </button>
              <button
                type="button"
                onClick={onOpenLumi}
                className="btn-gamified-3d btn-gamified-3d-secondary px-4 py-2 text-xs font-bold rounded-lg cursor-pointer"
              >
                <span>Ask Lumi</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PROGRESS & STATS (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4 sticky top-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-center text-center gap-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              YOUR PROGRESS
            </div>

            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3.5"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute font-black text-xl text-emerald-600">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full flex flex-col gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" /> {totalCount} Chapters Total
                </span>
              </div>
              <div className="flex items-center justify-between text-emerald-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" /> {completedCount} Completed
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block" /> {remainingCount} Remaining
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                XP REWARD POOL
              </span>
              <span className="text-sm font-black text-amber-600 mt-0.5">
                +{remainingXP.toLocaleString()} XP REMAINING
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                DAILY STREAK
              </span>
              <span className="text-xs font-bold text-orange-600 mt-0.5 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" /> 7 Day Streak
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBackToCourses}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 px-5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Courses</span>
        </button>

        <button
          type="button"
          onClick={handleStartOrContinue}
          className="btn-gamified-3d btn-gamified-3d-primary inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-white px-7 py-2.5 rounded-xl cursor-pointer"
        >
          <span>{isFinished ? 'Review Quest' : progressPercent > 0 ? 'Continue Quest' : 'Start Adventure'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* ========================================================================= */
/* GOD OF WAR MYTHIC LEARN CATALOG VIEW                                      */
/* ========================================================================= */
const MythicCourseDetailView: React.FC<CourseDetailViewProps> = ({
  courseId,
  onBackToCourses,
  onStartQuest,
  onSelectLesson,
  onOpenLumi,
}) => {
  const course = COURSE_CATALOG.find(c => c.id === courseId) || COURSE_CATALOG[0]
  const { user } = useAuth()
  const [dynamicProgress, setDynamicProgress] = React.useState<DynamicCourseProgress | null>(null)
  const [, setLoading] = React.useState<boolean>(true)

  const refreshProgress = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDetailedCourseProgress(user?.id, course.id)
      setDynamicProgress(data)
    } finally {
      setLoading(false)
    }
  }, [user?.id, course.id])

  React.useEffect(() => {
    refreshProgress()
  }, [refreshProgress])

  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']
  const progressPercent = dynamicProgress?.progressPercent ?? 0
  const completedCount = dynamicProgress?.completedChaptersCount ?? 0
  const totalCount = dynamicProgress?.totalChaptersCount ?? 6
  const remainingCount = Math.max(0, totalCount - completedCount)
  const chapters = dynamicProgress?.chapters ?? PYTHON_CHAPTERS.map((ch, i) => ({ ...ch, status: (i === 0 ? 'current' : 'locked') as 'completed' | 'current' | 'locked' }))
  const activeChapter = chapters.find(c => c.status === 'current') || chapters[0]
  const activeRoman = ROMAN[parseInt(activeChapter.num, 10) - 1] || activeChapter.num
  const remainingXP = chapters.filter(c => c.status !== 'completed').reduce((sum, c) => sum + c.xp, 0)
  const isFinished = progressPercent >= 100

  const handleStartOrContinue = async () => {
    if (user?.id && progressPercent === 0) {
      await saveCourseProgress(user.id, course.id, 15, activeChapter.lessonId)
      await refreshProgress()
    }
    if (onSelectLesson) {
      onSelectLesson(activeChapter.lessonId)
    } else if (onStartQuest) {
      onStartQuest()
    }
  }

  const handleSelectChapter = async (ch: ChapterItem) => {
    if (ch.status === 'locked') return
    if (onSelectLesson) {
      onSelectLesson(ch.lessonId)
    } else if (onStartQuest) {
      onStartQuest()
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 text-left pb-20 select-none animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToCourses}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#A89898] hover:text-[#FF5722] hover:bg-[#1A0C0C] px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-[#3D1C1C]"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#FF3D00]" />
          <span style={{ fontFamily: "'Cinzel', serif" }} className="tracking-wider">
            RETURN TO REALM ARCHIVES
          </span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#7A6A6A] font-medium">
          <span style={{ fontFamily: "'Cinzel', serif" }}>REALMS</span>
          <span>/</span>
          <span style={{ fontFamily: "'Cinzel', serif" }}>MIDGARD</span>
          <span>/</span>
          <span
            style={{ fontFamily: "'Cinzel', serif" }}
            className="text-[#F5E8E8] font-bold tracking-wider"
          >
            PYTHON SAGA
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. WAR ALTAR HERO CARD                                                    */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl p-6 lg:p-8 bg-gradient-to-br from-[#180A0A] via-[#0E0505] to-[#0A0404] border-2 border-[#8C2828] shadow-[0_12px_40px_rgba(0,0,0,0.9)] flex flex-col justify-between gap-6 overflow-hidden">
        {/* Background glow and decorative elements */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-[#FF3D00]/15 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 right-0 text-[180px] font-serif font-black text-red-950/20 pointer-events-none select-none leading-none">
          Ω
        </div>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF3D00] to-transparent" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Hero Left Content */}
          <div className="flex flex-col gap-3 flex-1 max-w-2xl">
            {/* Category / Level Label */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-[#2A0E0E] border border-[#8C2828] text-[#FF8A80] font-pixel text-[9.5px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3D00] animate-pulse" />
                <span>PYTHON SAGA • SPARTAN INITIATE</span>
              </span>
            </div>

            <h1
              style={{ fontFamily: "'Cinzel', serif" }}
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#F5E8E8] tracking-wider uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
            >
              Python Adventure: Lore of the World Serpent
            </h1>

            <p className="text-xs sm:text-sm text-[#B0A0A0] leading-relaxed max-w-xl">
              Awaken your divine power through {totalCount} mortal trials, arcane algorithms, and forged combat scripts.
            </p>

            {/* Rating / Warriors */}
            <div className="flex items-center gap-3 text-xs pt-1 flex-wrap">
              <div className="flex items-center gap-1 text-[#F5D060] font-bold">
                <span>★★★★★</span>
                <span className="text-[#F5E8E8] font-mono font-black ml-1">4.9 / 5.0</span>
              </div>
              <span className="text-[#554040]">•</span>
              <span className="text-[#8C7A7A] font-medium">12,400+ Spartan Initiates</span>
            </div>

            {/* Metadata Tags Row */}
            <div className="flex items-center gap-3 flex-wrap pt-1 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-[#C4B5B5]">
                <BookOpen className="w-3.5 h-3.5 text-[#8C2828]" /> {totalCount} Trials
              </span>
              <span className="flex items-center gap-1.5 text-[#C4B5B5]">
                <Clock className="w-3.5 h-3.5 text-[#8C2828]" /> 8–10 Hours
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#102418] border border-[#00E5FF]/40 text-[#00E5FF] text-[11px] font-bold">
                Initiate Tier
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#221508] border border-[#C59B27] text-[#F5D060] font-pixel text-[10px] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#F5D060]" /> +{course.xp.toLocaleString()} XP
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleStartOrContinue}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#8B0000] via-[#B91C1C] to-[#EF4444] hover:from-[#991B1B] hover:to-[#FF3D00] text-white text-xs sm:text-sm font-black tracking-wider transition-all shadow-[0_0_20px_rgba(220,38,38,0.7)] flex items-center gap-2 cursor-pointer border border-[#FF5722]/60 active:scale-95"
              >
                <span style={{ fontFamily: "'Cinzel', serif" }}>
                  {isFinished ? 'REVIEW TRIALS' : progressPercent > 0 ? `ENTER TRIAL ${activeRoman}` : 'COMMENCE TRIAL I'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  document.getElementById('mythic-trials')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="px-5 py-3 rounded-xl bg-[#1A0E0E] hover:bg-[#281515] text-[#D1C2C2] hover:text-white border border-[#3D1C1C] text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                <span style={{ fontFamily: "'Cinzel', serif" }}>INSPECT SAGAS</span>
              </button>
            </div>
          </div>

          {/* Hero Right: War Altar Shrine */}
          <div className="shrink-0 w-full lg:w-[400px] h-52 sm:h-60 relative rounded-2xl overflow-hidden flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#1C0D0D] to-[#0A0404] border border-[#3D1C1C] shadow-inner">
            <div className="w-16 h-16 rounded-2xl bg-[#280C0C] border-2 border-[#8C2828] flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(140,40,40,0.6)]">
              <span className="text-3xl">⚔️</span>
            </div>
            <span
              style={{ fontFamily: "'Cinzel', serif" }}
              className="text-sm font-black text-[#F5E8E8] tracking-widest uppercase text-center"
            >
              TRIAL OF {activeChapter.title.toUpperCase()}
            </span>
            <span className="text-xs text-[#8C7A7A] mt-1 text-center">
              Chapter {activeChapter.num}: {activeChapter.description}
            </span>
            <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded bg-[#240C0C] border border-[#8C2828] text-[#FF8A80] text-[10.5px] font-bold">
              <Flame className="w-3.5 h-3.5 text-[#FF3D00] animate-pulse" />
              <span style={{ fontFamily: "'Cinzel', serif" }}>PROGRESS: {progressPercent}% FORGED</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ROW 2: SACRED KNOWLEDGE & COMBAT SKILLS UNLOCKED                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Sacred Knowledge */}
        <div className="lg:col-span-7 bg-[#0E0606] rounded-2xl p-6 border border-[#3D1C1C] shadow-lg flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FF3D00]" />
            <h2
              style={{ fontFamily: "'Cinzel', serif" }}
              className="font-bold text-base text-[#F5E8E8] tracking-wider uppercase"
            >
              Sacred Doctrines to Master
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs font-medium text-[#C4B5B5]">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 stroke-[3]" />
              <span>Variables & Data Scrolls</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 stroke-[3]" />
              <span>Combat Functions</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 stroke-[3]" />
              <span>Lists & Ancient Grimoires</span>
            </div>

            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 stroke-[3]" />
              <span>Conditional Judgment</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 stroke-[3]" />
              <span>Exception Ward Defense</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 stroke-[3]" />
              <span>Boss Script Construction</span>
            </div>

            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 stroke-[3]" />
              <span>Iterative Loops</span>
            </div>
          </div>
        </div>

        {/* Right: Skills You'll Unlock */}
        <div className="lg:col-span-5 bg-[#0E0606] rounded-2xl p-6 border border-[#3D1C1C] shadow-lg flex flex-col justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#F5D060]" />
            <h2
              style={{ fontFamily: "'Cinzel', serif" }}
              className="font-bold text-base text-[#F5E8E8] tracking-wider uppercase"
            >
              Runes Unlocked
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1.5 rounded-lg bg-[#1C0E0E] border border-[#8C2828] text-[#FF8A80] text-xs font-bold flex items-center gap-1.5">
              <span>🐍 Python Rune</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#1C0E0E] border border-[#8C2828] text-[#FF8A80] text-xs font-bold">
              ⚔️ Battle Logic
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#221508] border border-[#C59B27] text-[#F5D060] text-xs font-bold">
              ᚲ Divine Algorithms
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-[#102418] border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-bold">
              🛡️ Bug Extermination
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN 3-COLUMN SECTION (TIMELINE + CURRENT QUEST + STATS)               */}
      {/* ========================================================================= */}
      <div id="mythic-trials" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: CHAPTER TIMELINE (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0E0606] rounded-2xl p-6 border border-[#3D1C1C] shadow-lg flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-[#FF3D00]" />
              <h2
                style={{ fontFamily: "'Cinzel', serif" }}
                className="font-bold text-base text-[#F5E8E8] tracking-wider uppercase"
              >
                Trial Progression
              </h2>
            </div>
            <p className="text-xs text-[#8C7A7A] font-medium">
              Conquer each trial sequentially to appease the gods.
            </p>
          </div>

          {/* Timeline Node Chain */}
          <div className="relative flex flex-col gap-5 pt-2">
            <div className="absolute left-3.5 top-6 bottom-6 w-0.5 bg-[#261010] z-0" />
            <div
              className="absolute left-3.5 top-6 w-0.5 bg-gradient-to-b from-[#991B1B] to-[#FF3D00] shadow-[0_0_8px_#FF3D00] z-0 transition-all duration-500"
              style={{ height: `${Math.min(100, Math.max(5, (completedCount / totalCount) * 100))}%` }}
            />

            {chapters.map((ch, idx) => {
              const isCompleted = ch.status === 'completed'
              const isCurrent = ch.status === 'current'
              const isLocked = ch.status === 'locked'
              const roman = ROMAN[idx] || ch.num

              if (isCompleted) {
                return (
                  <div
                    key={ch.num}
                    onClick={() => handleSelectChapter(ch)}
                    className="relative z-10 flex items-start gap-3.5 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#102A1C] border border-[#00E5FF]/60 text-[#00E5FF] flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <div>
                        <div
                          style={{ fontFamily: "'Cinzel', serif" }}
                          className="text-[9.5px] text-[#8C7A7A] font-bold uppercase tracking-wider"
                        >
                          TRIAL {roman}
                        </div>
                        <h3 className="text-xs font-bold text-[#D1C2C2]">{ch.title}</h3>
                        <span className="text-[10px] text-[#00E5FF] font-semibold flex items-center gap-1">
                          ✓ Conquered
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-pixel text-[9.5px] font-bold text-[#F5D060] bg-[#1C1206] px-2 py-0.5 rounded border border-[#C59B27]/60">
                        <Award className="w-3 h-3 text-[#F5D060]" />
                        <span>+{ch.xp} XP</span>
                      </div>
                    </div>
                  </div>
                )
              }

              if (isCurrent) {
                return (
                  <div key={ch.num} className="relative z-10 flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-[#8B0000] text-white flex items-center justify-center shrink-0 shadow-[0_0_12px_#FF3D00] border-2 border-[#FF3D00] animate-pulse">
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>

                    <div className="flex-1 bg-gradient-to-br from-[#1C0B0B] to-[#120606] rounded-xl p-4 border-2 border-[#8C2828] shadow-[0_4px_16px_rgba(140,40,40,0.4)] flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              style={{ fontFamily: "'Cinzel', serif" }}
                              className="text-[9.5px] text-[#FF5722] font-bold uppercase tracking-wider"
                            >
                              TRIAL {roman}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-[#FF3D00] text-black text-[8px] font-pixel font-bold uppercase">
                              ACTIVE RITE
                            </span>
                          </div>
                          <h3
                            style={{ fontFamily: "'Cinzel', serif" }}
                            className="text-sm font-extrabold text-[#F5E8E8] mt-0.5 uppercase tracking-wide"
                          >
                            {ch.title}
                          </h3>
                        </div>

                        <span
                          style={{ fontFamily: "'Cinzel', serif" }}
                          className="text-xs font-black text-[#FF5722]"
                        >
                          {progressPercent}% FORGED
                        </span>
                      </div>

                      <p className="text-xs text-[#A89898] leading-relaxed">
                        {ch.description}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#3D1C1C]">
                        <div className="flex items-center gap-1 font-pixel text-[9.5px] font-bold text-[#F5D060] bg-[#1C1206] px-2 py-0.5 rounded border border-[#C59B27]/50">
                          <Award className="w-3 h-3 text-[#F5D060]" />
                          <span>+{ch.xp} XP</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectChapter(ch)}
                          className="px-4 py-1.5 bg-gradient-to-r from-[#8B0000] to-[#550A0A] hover:from-[#A81010] hover:to-[#730E0E] text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 border border-[#8C2828] active:scale-95"
                        >
                          <span style={{ fontFamily: "'Cinzel', serif" }}>
                            {progressPercent > 0 ? 'RESUME' : 'COMMENCE'}
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={ch.num} className="relative z-10 flex items-start gap-3.5 opacity-50">
                  <div className="w-7 h-7 rounded-full bg-[#120606] border border-[#3D1C1C] text-[#554040] flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div>
                      <div
                        style={{ fontFamily: "'Cinzel', serif" }}
                        className="text-[9.5px] text-[#6E5A5A] font-bold uppercase tracking-wider"
                      >
                        TRIAL {roman}
                      </div>
                      <h3 className="text-xs font-bold text-[#6E5A5A]">{ch.title}</h3>
                    </div>
                    <span className="text-[10px] text-[#554040] font-medium">
                      Complete Trial {ROMAN[idx - 1] || idx}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* MIDDLE COLUMN: ACTIVE QUEST + FINAL RELIC + MIMIR ADVICE (4.5 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* CURRENT QUEST CARD */}
          <div className="bg-[#0E0606] rounded-2xl p-5 border-2 border-[#8C2828] shadow-[0_4px_20px_rgba(140,40,40,0.3)] flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#240C0C] text-[#FF8A80] text-[10px] font-bold uppercase tracking-wider font-pixel border border-[#8C2828]">
                <Swords className="w-3 h-3 text-[#FF3D00]" />
                <span>ACTIVE TRIAL OBJECTIVE</span>
              </div>

              <div className="font-pixel text-[10px] font-bold text-[#F5D060]">
                ⭐ +{activeChapter.xp} XP
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <h3
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="font-bold text-sm text-[#F5E8E8] leading-tight"
                >
                  {activeChapter.title}
                </h3>
                <p className="text-xs text-[#8C7A7A] leading-relaxed">
                  {activeChapter.description}
                </p>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-[#8C7A7A] font-medium">
                  <span className="text-[#F5D060] font-mono text-[11px]">★★☆☆☆ Hero Tier</span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-[#8C2828]" /> 20 min
                  </span>
                </div>
              </div>

              <div className="w-20 h-16 shrink-0 rounded-xl bg-[#1C0A0A] border border-[#8C2828] flex items-center justify-center text-2xl shadow-inner">
                🎯
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartOrContinue}
              className="w-full py-2.5 bg-gradient-to-r from-[#8B0000] to-[#550A0A] hover:from-[#A81010] hover:to-[#730E0E] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#8C2828] active:scale-95"
            >
              <span style={{ fontFamily: "'Cinzel', serif" }} className="tracking-wider">
                {isFinished ? 'REVIEW TRIALS' : progressPercent > 0 ? 'RESUME TRIAL' : 'COMMENCE TRIAL'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* FINAL BUILD CARD */}
          <div className="bg-[#0E0606] rounded-2xl p-5 border border-[#3D1C1C] shadow-lg flex flex-col justify-between gap-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F5D060]" />
              <h3
                style={{ fontFamily: "'Cinzel', serif" }}
                className="font-bold text-sm text-[#F5E8E8] tracking-wider uppercase"
              >
                Final Grand Relic
              </h3>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-20 h-16 shrink-0 rounded-xl bg-[#1A0A0A] border border-[#3D1C1C] flex items-center justify-center text-3xl">
                🐉
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <h4
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="font-bold text-xs text-[#F5E8E8]"
                >
                  Midgard Text RPG Engine
                </h4>
                <p className="text-[11px] text-[#8C7A7A] leading-relaxed">
                  Forge an interactive dungeon combat game with inventory and boss fights.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded bg-[#1C0A0A] border border-[#8C2828]/50 text-[#FF8A80] text-[9.5px] font-bold">
                    🐍 Python 3
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#221508] border border-[#C59B27]/50 text-[#F5D060] text-[9.5px] font-bold">
                    🏆 God Trophy
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* MIMIR RECOMMENDATION CARD */}
          <div className="bg-gradient-to-r from-[#170A0A] to-[#0E0606] rounded-2xl p-5 border border-[#8C2828]/70 shadow-lg flex flex-col justify-between gap-3 relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#240C0C] border border-[#8C2828] flex items-center justify-center text-xl shrink-0 shadow-[0_0_10px_rgba(140,40,40,0.5)]">
                👁️
              </div>
              <div className="flex flex-col gap-1">
                <h4
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="font-bold text-xs text-[#F5E8E8] tracking-wider uppercase"
                >
                  Mimir&apos;s Council
                </h4>
                <p className="text-xs text-[#A89898] leading-relaxed">
                  {progressPercent === 0
                    ? `\u201CBrother, your saga begins today! Undertake Trial I: ${activeChapter.title} to forge your warrior's destiny.\u201D`
                    : isFinished
                      ? `\u201CAll praise the champion! You've conquered all ${totalCount} trials of the Python Saga. The halls of Valhalla welcome you!\u201D`
                      : `\u201CBrother, you're ${progressPercent}% through the Python saga! Slay Trial ${activeRoman}: ${activeChapter.title} next \u2014 divine power awaits your blade.\u201D`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleStartOrContinue}
                className="flex-1 py-2 bg-gradient-to-r from-[#8B0000] to-[#550A0A] hover:from-[#A81010] text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer border border-[#8C2828] active:scale-95"
              >
                <span style={{ fontFamily: "'Cinzel', serif" }}>HEED COUNCIL</span>
              </button>
              <button
                type="button"
                onClick={onOpenLumi}
                className="px-4 py-2 bg-[#1C0E0E] hover:bg-[#281414] text-[#D1C2C2] hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-[#3D1C1C]"
              >
                <span style={{ fontFamily: "'Cinzel', serif" }}>ASK MIMIR</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PROGRESS DIAL & STATS (2.5 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4 sticky top-6">
          {/* PROGRESS RADIAL DIAL */}
          <div className="bg-[#0E0606] rounded-2xl p-5 border border-[#3D1C1C] shadow-lg flex flex-col items-center text-center gap-4">
            <div
              style={{ fontFamily: "'Cinzel', serif" }}
              className="text-[10px] font-bold text-[#8C7A7A] uppercase tracking-widest"
            >
              WAR COMPLETION
            </div>

            {/* Radial Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1A0A0A"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="3.5"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_6px_#FF3D00] transition-all duration-700"
                />
              </svg>
              <span
                style={{ fontFamily: "'Cinzel', serif" }}
                className="absolute font-black text-xl text-[#FF5722]"
              >
                {progressPercent}%
              </span>
            </div>

            <div className="w-full flex flex-col gap-2 pt-2 border-t border-[#261010] text-xs">
              <div className="flex items-center justify-between text-[#A89898] font-medium">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#8C2828]" /> {totalCount} Trials Total
                </span>
              </div>
              <div className="flex items-center justify-between text-[#00E5FF] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#00E5FF] stroke-[3]" /> {completedCount} Conquered
                </span>
              </div>
              <div className="flex items-center justify-between text-[#6E5A5A] font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border border-[#3D1C1C] inline-block" /> {remainingCount} Remaining
                </span>
              </div>
            </div>
          </div>

          {/* XP REWARD */}
          <div className="bg-[#0E0606] rounded-xl p-4 border border-[#3D1C1C] shadow-md flex items-center justify-between">
            <div className="flex flex-col">
              <span
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-[9px] font-bold text-[#8C7A7A] uppercase tracking-wider"
              >
                HACKSILVER POOL
              </span>
              <span
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-sm font-black text-[#F5D060] mt-0.5"
              >
                +{remainingXP.toLocaleString()} XP REMAINING
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#221508] border border-[#C59B27]/60 flex items-center justify-center text-[#F5D060]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* SPARTAN STREAK */}
          <div className="bg-[#0E0606] rounded-xl p-4 border border-[#3D1C1C] shadow-md flex items-center justify-between">
            <div className="flex flex-col">
              <span
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-[9px] font-bold text-[#8C7A7A] uppercase tracking-wider"
              >
                WAR STREAK
              </span>
              <span className="text-xs font-bold text-[#FF5722] mt-0.5 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#FF3D00] animate-pulse" /> 7 Battles Fought
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM NAVIGATION CONTROLS                                             */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pt-6 border-t border-[#3D1C1C]">
        <button
          type="button"
          onClick={onBackToCourses}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#C4B5B5] hover:text-white px-5 py-2.5 rounded-xl bg-[#140808] hover:bg-[#1F0E0E] transition-colors cursor-pointer border border-[#3D1C1C]"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#FF3D00]" />
          <span style={{ fontFamily: "'Cinzel', serif" }}>ALL SAGAS</span>
        </button>

        <button
          type="button"
          onClick={handleStartOrContinue}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#550A0A] hover:from-[#A81010] hover:to-[#730E0E] shadow-md transition-all cursor-pointer border border-[#8C2828] active:scale-95"
        >
          <span style={{ fontFamily: "'Cinzel', serif" }}>
            {isFinished ? 'REVIEW ALL SAGAS' : progressPercent > 0 ? `ENTER TRIAL ${activeRoman}` : 'COMMENCE TRIAL I'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* ========================================================================= */
/* SPIDER-MAN COURSE DETAIL VIEW                                             */
/* ========================================================================= */
const SpiderManCourseDetailView: React.FC<CourseDetailViewProps> = ({
  courseId,
  onBackToCourses,
  onStartQuest,
  onSelectLesson,
  onOpenLumi,
}) => {
  const { user } = useAuth()
  const [dynamicProgress, setDynamicProgress] = React.useState<DynamicCourseProgress | null>(null)
  const [, setLoading] = React.useState<boolean>(true)

  const refreshProgress = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDetailedCourseProgress(user?.id, courseId || 'python')
      setDynamicProgress(data)
    } finally {
      setLoading(false)
    }
  }, [user?.id, courseId])

  React.useEffect(() => {
    refreshProgress()
  }, [refreshProgress])

  const progressPercent = dynamicProgress?.progressPercent ?? 0
  const completedCount = dynamicProgress?.completedChaptersCount ?? 0
  const totalCount = dynamicProgress?.totalChaptersCount ?? 6
  const chapters = dynamicProgress?.chapters ?? PYTHON_CHAPTERS.map((ch, i) => ({ ...ch, status: (i === 0 ? 'current' : 'locked') as 'completed' | 'current' | 'locked' }))
  const activeChapter = chapters.find(c => c.status === 'current') || chapters[0]
  const isFinished = progressPercent >= 100

  const handleStartOrContinue = async () => {
    if (user?.id && progressPercent === 0) {
      await saveCourseProgress(user.id, courseId || 'python', 15, activeChapter.lessonId)
      await refreshProgress()
    }
    if (onSelectLesson) {
      onSelectLesson(activeChapter.lessonId)
    } else if (onStartQuest) {
      onStartQuest()
    }
  }

  const handleSelectChapter = async (ch: ChapterItem) => {
    if (ch.status === 'locked') return
    if (onSelectLesson) {
      onSelectLesson(ch.lessonId)
    } else if (onStartQuest) {
      onStartQuest()
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 text-left pb-20 select-none animate-in fade-in duration-300">
      {/* ── 1. TOP BREADCRUMB & BACK BUTTON ── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToCourses}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-[#00F0FF] hover:bg-[#151E3A] px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-[#2A3A65]"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span className="tracking-wider">RETURN TO MISSIONS</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>NYC</span>
          <span>/</span>
          <span>QUEENS</span>
          <span>/</span>
          <span className="text-[#00F0FF] font-bold tracking-wider">
            PYTHON PROTOCOL
          </span>
        </div>
      </div>

      {/* ── 2. HERO BANNER: PARKER TELEMETRY PROTOCOL ── */}
      <div
        className="relative rounded-3xl p-6 lg:p-8 border-2 border-[#FF2A34] shadow-[0_12px_40px_rgba(0,240,255,0.18)] flex flex-col justify-between gap-6 overflow-hidden animate-spider-banner"
        style={{
          background: 'linear-gradient(135deg, #151E3A 0%, #0B1021 50%, #1A2E63 100%)',
        }}
      >
        <SpiderNetDecal size={120} position="top-right" glowColor="rgba(0, 240, 255, 0.8)" />
        <SpiderNetDecal size={80} position="bottom-left" glowColor="rgba(255, 42, 52, 0.7)" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left Content */}
          <div className="flex flex-col gap-3 flex-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-[#00F0FF]/40 text-[#00F0FF] text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
                <span>PYTHON PROTOCOL • QUEENS INITIATE</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              Peter Parker&apos;s Python Protocol
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Calculate web trajectory arcs, simulate high-tensile fluid dispersion, and program autonomous spider-bot patrols across NYC.
            </p>

            <div className="flex items-center gap-3 text-xs pt-1 flex-wrap">
              <div className="flex items-center gap-1 text-[#FFD700] font-bold">
                <span>★★★★★</span>
                <span className="text-white font-mono font-black ml-1">4.9 / 5.0</span>
              </div>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-medium">12,400+ Web-Slingers Enrolled</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap pt-1 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-[#00F0FF]" /> {totalCount} Missions
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-[#00F0FF]" /> 8–10 Hours
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] text-[11px] font-bold">
                Friendly Neighborhood
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-400 font-bold text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> +2,400 Spider XP
              </span>
            </div>

            <div className="flex items-center gap-3 pt-3 flex-wrap">
              <button
                type="button"
                onClick={handleStartOrContinue}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-white px-7 py-3 rounded-xl bg-gradient-to-r from-[#FF1744] via-[#E21B24] to-[#1E3A8A] hover:brightness-110 shadow-[0_0_20px_rgba(255,42,52,0.6)] transition-all cursor-pointer border border-[#00F0FF]/50 active:scale-95"
              >
                <span>{isFinished ? 'REVIEW MISSIONS' : progressPercent > 0 ? `RESUME CHAPTER ${activeChapter.num}` : 'START CHAPTER 01'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="hidden sm:block">
                <ThwipSticker size={58} rotate={-6} />
              </div>
            </div>
          </div>

          {/* Right Banner Preview */}
          <div className="shrink-0 w-full lg:w-[380px] rounded-2xl overflow-hidden border border-[#2A3A65] bg-[#0B1021]/80 p-5 flex flex-col justify-between relative shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A3A65]">
              <div className="flex items-center gap-2.5">
                <SpiderMaskSticker size={36} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#00F0FF]">
                    COURSE BADGE
                  </span>
                  <span className="text-xs font-extrabold text-white">
                    Python Web-Master
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#FFD700]">+2,400 XP</span>
            </div>

            <div className="py-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Progress: Chapter {completedCount} of {totalCount}</span>
                <span className="text-[#00F0FF] font-bold font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#151E3A] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF1744] to-[#00F0FF] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#2A3A65] flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#FF2A34] animate-pulse" /> 7-Day Web Streak
              </span>
              <span className="text-[#00F0FF] font-bold">{completedCount} Lessons Cleared</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. CURRICULUM CHAPTER TIMELINE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-[#151E3A] rounded-2xl p-6 border border-[#2A3A65] shadow-lg flex flex-col gap-4 relative overflow-hidden">
          <SpiderNetDecal size={80} position="top-right" opacity={0.3} />

          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-white uppercase tracking-wider">
              Curriculum Chapters
            </h2>
            <span className="text-xs text-[#00F0FF] font-mono font-bold">{totalCount} CHAPTERS</span>
          </div>

          <div className="flex flex-col gap-3">
            {chapters.map((ch) => (
              <div
                key={ch.num}
                onClick={() => handleSelectChapter(ch)}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${ch.status === 'completed'
                    ? 'bg-[#101730] border-emerald-500/40 text-slate-300 hover:border-emerald-400 cursor-pointer'
                    : ch.status === 'current'
                      ? 'bg-gradient-to-r from-[#182346] to-[#101730] border-[#00F0FF] text-white shadow-[0_0_12px_rgba(0,240,255,0.25)] cursor-pointer'
                      : 'bg-[#0B1021]/50 border-[#2A3A65]/50 text-slate-500 opacity-60'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${ch.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                        : ch.status === 'current'
                          ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF] animate-pulse'
                          : 'bg-[#151E3A] text-slate-500 border-[#2A3A65]'
                      }`}
                  >
                    {ch.status === 'completed' ? '✓' : ch.num}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold">{ch.title}</h3>
                    <span className="text-[10px] text-slate-400">
                      {ch.status === 'completed' ? 'Cleared' : ch.status === 'current' ? 'In Progress' : 'Locked'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-[#FFD700]">+{ch.xp} XP</span>
                  {ch.status !== 'locked' ? (
                    <ArrowRight className="w-3.5 h-3.5 text-[#00F0FF]" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Lesson Spotlight (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-[#151E3A] rounded-2xl p-6 border-2 border-[#00F0FF] shadow-lg flex flex-col gap-4 relative overflow-hidden">
            <SpiderNetDecal size={70} position="top-right" opacity={0.35} />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF]">
                CURRENT OBJECTIVE
              </span>
              <span className="text-xs font-mono font-bold text-[#FFD700]">+{activeChapter.xp} XP</span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                Chapter {activeChapter.num}: {activeChapter.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                {activeChapter.description}
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartOrContinue}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#FF1744] to-[#1E3A8A] hover:brightness-110 text-white font-bold text-xs transition-all cursor-pointer border border-[#FF2A34]/50 shadow-md active:scale-95"
            >
              <span>{isFinished ? 'REVIEW FINAL MISSION' : progressPercent > 0 ? `ENTER LESSON ${activeChapter.num}` : 'START FIRST MISSION'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#151E3A] rounded-2xl p-5 border border-[#2A3A65] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SpiderSenseSticker size={38} />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Spider-AI Oracle</span>
                <span className="text-[11px] text-slate-300">Karen can explain concepts & tips</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenLumi}
              className="px-3.5 py-1.5 rounded-xl bg-[#00F0FF]/20 hover:bg-[#00F0FF]/30 border border-[#00F0FF] text-[#00F0FF] text-xs font-bold transition-colors cursor-pointer"
            >
              ASK AI
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ========================================================================= */
/* COURSE DETAIL VIEW DISPATCHER                                             */
/* ========================================================================= */
export const CourseDetailView: React.FC<CourseDetailViewProps> = (props) => {
  const { theme } = useTheme()
  if (theme === 'classic') {
    return <ClassicCourseDetailView {...props} />
  }
  if (theme === 'spiderman') {
    return <SpiderManCourseDetailView {...props} />
  }
  return <MythicCourseDetailView {...props} />
}
