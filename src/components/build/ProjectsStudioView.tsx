import React, { useState } from 'react'
import {
  Search,
  Plus,
  Eye,
  Star,
  GitFork,
  Check,
  Lock,
  Compass,
  Layers,
  Flame,
  Swords,
  Hammer,
  Shield,
  Sparkles,
} from 'lucide-react'
import { StudentGuidedProjectsLibrary } from '../guidedProjects/StudentGuidedProjectsLibrary'
import { useTheme } from '../../context/ThemeContext'

interface ProjectsStudioViewProps {
  onNewProject?: () => void
  onSelectGuidedProject?: (projectId: string) => void
}

type ProjectStatus = 'published' | 'in_progress' | 'completed' | 'archived'
type FilterTab = 'all' | ProjectStatus

interface Project {
  id: string
  title: string
  subtitle: string
  status: ProjectStatus
  tags: string[]
  xp: number
  views?: number
  stars?: number
  progress?: number
  updatedLabel: string
  thumbnail: React.ReactNode
}

/* ─── Thumbnail Components ─── */
const TerminalThumb: React.FC = () => (
  <div className="w-full h-full bg-[#0A0404] rounded-xl p-3 font-mono text-[9px] space-y-0.5 border border-[#3D1C1C]">
    <div className="text-[#8C7A7A]"># Spartan Combat Engine</div>
    <div className="text-[#D1C2C2]">Striking enemy Draugr (HP: 100)...</div>
    <div className="text-[#FF3D00]">{'> '}Heavy Strike: 42 DMG</div>
    <div className="text-[#00E5FF]">Valkyrie Defeated! ⚔️ XP: +840</div>
  </div>
)

const PortfolioThumb: React.FC = () => (
  <div className="w-full h-full bg-gradient-to-br from-[#1C0A0A] to-[#0A0404] rounded-xl p-3 overflow-hidden border border-[#3D1C1C]">
    <div className="w-full bg-gradient-to-r from-[#8B0000] to-[#550A0A] rounded-lg h-10 flex items-center px-3 mb-2 border border-[#8C2828]">
      <span style={{ fontFamily: "'Cinzel', serif" }} className="text-white font-bold text-[9px]">
        WAR ARCHIVES OF KRATOS
      </span>
    </div>
    <div className="text-[8px] text-[#8C7A7A]">Runic components and weapons loadout...</div>
  </div>
)

const PixelRunnerThumb: React.FC = () => (
  <div className="w-full h-full bg-[#140808] rounded-xl p-2 flex flex-col justify-between border border-[#3D1C1C]">
    <div className="flex justify-between text-[8px] text-[#A89898] font-mono">
      <span>REALM: HELHEIM</span>
      <span className="text-[#FF5722]">SCORE: 1,420</span>
    </div>
    <div className="text-center text-xl">⚔️ 🛡️ 🐉</div>
    <div className="h-1.5 w-full bg-[#8C2828] rounded-full" />
  </div>
)

const MovieExplorerThumb: React.FC = () => (
  <div className="w-full h-full bg-[#0E0606] rounded-xl p-2 flex flex-col gap-1 border border-[#3D1C1C]">
    <div className="text-[8px] font-bold text-[#F5E8E8]" style={{ fontFamily: "'Cinzel', serif" }}>
      YGGDRASIL PROPHECIES
    </div>
    <div className="flex gap-1">
      <div className="w-8 h-10 bg-[#240C0C] rounded border border-[#8C2828] flex items-center justify-center text-xs">
        📜
      </div>
      <div className="flex flex-col gap-0.5 text-[7px] text-[#8C7A7A]">
        <span className="text-[#F5D060]">Rating: 9.8 / 10</span>
        <span>Fate of Ragnarok</span>
      </div>
    </div>
  </div>
)

const LumiMiniThumb: React.FC = () => (
  <div className="w-full h-full bg-[#120707] rounded-xl p-2.5 flex flex-col justify-between border border-[#3D1C1C]">
    <div className="text-[8px] font-bold text-[#00E5FF]" style={{ fontFamily: "'Cinzel', serif" }}>
      MIMIR ORACLE CHAT
    </div>
    <div className="bg-[#240C0C] text-[#FF8A80] rounded p-1 text-[7.5px] border border-[#8C2828]">
      Mimir: What council seek ye?
    </div>
  </div>
)

const STATUS_BADGE: Record<ProjectStatus, { label: string; className: string }> = {
  published: { label: 'CONQUERED', className: 'bg-[#102418] text-[#00E5FF] border border-[#00E5FF]/40' },
  in_progress: { label: 'FORGING', className: 'bg-[#2A0E0E] text-[#FF8A80] border border-[#FF3D00]/50' },
  completed: { label: 'HONORED', className: 'bg-[#221508] text-[#F5D060] border border-[#C59B27]/50' },
  archived: { label: 'DORMANT', className: 'bg-[#140808] text-[#6E5A5A] border border-[#2D1414]' },
}

const PROJECTS: Project[] = [
  {
    id: 'num-guess',
    title: 'Spartan Combat Engine',
    subtitle: 'A combat-oriented terminal battle simulator with difficulty modifiers and rage gauge.',
    status: 'published',
    tags: ['Python', 'Combat'],
    xp: 250,
    views: 248,
    stars: 18,
    updatedLabel: 'Updated 2 days ago',
    thumbnail: <TerminalThumb />,
  },
  {
    id: 'portfolio',
    title: 'Sanctuary of Achievements',
    subtitle: 'A monumental personal war altar presenting all conquered trophies.',
    status: 'in_progress',
    tags: ['HTML', 'CSS', 'Basalt'],
    xp: 300,
    progress: 68,
    updatedLabel: 'Forged 1 day ago',
    thumbnail: <PortfolioThumb />,
  },
  {
    id: 'pixel-runner',
    title: 'Escape from Helheim',
    subtitle: 'An endless battle runner engine dodging Draugr strikes and flame hazards.',
    status: 'published',
    tags: ['JavaScript', 'Canvas'],
    xp: 400,
    views: 521,
    stars: 42,
    updatedLabel: 'Forged 5 days ago',
    thumbnail: <PixelRunnerThumb />,
  },
  {
    id: 'movie-explorer',
    title: 'Chronicles of Ragnarok',
    subtitle: 'Ancient data indexer tracing mythological timeline data and prophecies.',
    status: 'completed',
    tags: ['Python', 'Pandas'],
    xp: 350,
    updatedLabel: 'Completed 3 days ago',
    thumbnail: <MovieExplorerThumb />,
  },
  {
    id: 'lumi-mini',
    title: 'Mimir AI Oracle',
    subtitle: 'An autonomous conversation agent channeling wisdom from the severed head.',
    status: 'in_progress',
    tags: ['Python', 'AI'],
    xp: 0,
    progress: 42,
    updatedLabel: 'Updated yesterday',
    thumbnail: <LumiMiniThumb />,
  },
]

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All Relics' },
  { id: 'in_progress', label: 'Forging' },
  { id: 'published', label: 'Conquered' },
  { id: 'completed', label: 'Honored' },
  { id: 'archived', label: 'Dormant' },
]

export const ProjectsStudioView: React.FC<ProjectsStudioViewProps> = ({
  onNewProject,
  onSelectGuidedProject,
}) => {
  const [studioMode, setStudioMode] = useState<'guided' | 'freeform'>('guided')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = PROJECTS.filter(p => {
    const matchFilter = activeFilter === 'all' || p.status === activeFilter
    const matchSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchFilter && matchSearch
  })
  const { theme } = useTheme()

  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6 text-left pb-20 select-none animate-in fade-in duration-300">
      {/* Studio Navigation Switcher */}
      {theme === 'classic' ? (
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl w-fit border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setStudioMode('guided')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              studioMode === 'guided'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="font-pixel text-[10px] tracking-wider uppercase">GUIDED PROJECTS</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode('freeform')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              studioMode === 'freeform'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span className="font-pixel text-[10px] tracking-wider uppercase">FREEFORM STUDIO</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-1.5 bg-[#0E0606] rounded-xl w-fit border border-[#3D1C1C] shadow-lg">
          <button
            type="button"
            onClick={() => setStudioMode('guided')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              studioMode === 'guided'
                ? 'bg-gradient-to-r from-[#8B0000] to-[#550A0A] text-white border border-[#FF3D00] shadow-[0_0_12px_rgba(255,61,0,0.4)]'
                : 'text-[#9E8B8B] hover:text-[#F5E8E8]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#FF3D00]" />
            <span style={{ fontFamily: "'Cinzel', serif" }}>Dwarven Blueprints</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode('freeform')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              studioMode === 'freeform'
                ? 'bg-gradient-to-r from-[#8B0000] to-[#550A0A] text-white border border-[#FF3D00] shadow-[0_0_12px_rgba(255,61,0,0.4)]'
                : 'text-[#9E8B8B] hover:text-[#F5E8E8]'
            }`}
          >
            <Hammer className="w-3.5 h-3.5 text-[#FF3D00]" />
            <span style={{ fontFamily: "'Cinzel', serif" }}>Brok & Sindri&apos;s Forge</span>
          </button>
        </div>
      )}

      {studioMode === 'guided' ? (
        <StudentGuidedProjectsLibrary
          onSelectProject={(id) => onSelectGuidedProject?.(id)}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* MAIN FORGE COLUMN (~75%) */}
          <div className="xl:col-span-9 flex flex-col gap-6">
            {/* HERO CREATION BANNER */}
            <div className="relative bg-gradient-to-br from-[#180A0A] via-[#0E0505] to-[#0A0404] border-2 border-[#8C2828] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.85)] gap-6">
              <div className="absolute top-0 right-1/4 w-96 h-36 bg-[#FF3D00]/15 blur-[90px] pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF3D00] to-transparent" />

              <div className="flex flex-col gap-3 z-10 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF3D00] animate-pulse" />
                  <span
                    style={{ fontFamily: "'Cinzel', serif" }}
                    className="text-[10px] font-bold text-[#FF5722] uppercase tracking-[0.25em]"
                  >
                    DWARVEN WORKBENCH
                  </span>
                </div>
                <h1
                  style={{ fontFamily: "'Cinzel', serif" }}
                  className="text-2xl md:text-4xl font-black text-[#F5E8E8] leading-tight tracking-wider uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
                >
                  Forge Legendary<br />Code Artifacts.
                </h1>
                <p className="text-xs sm:text-sm text-[#A89898] leading-relaxed max-w-md">
                  Transform raw algorithmic knowledge into sovereign web engines, games, and divine tools.
                </p>
                <div className="flex items-center gap-3 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={onNewProject}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B0000] via-[#B91C1C] to-[#EF4444] hover:from-[#991B1B] hover:to-[#FF3D00] text-white font-bold text-xs sm:text-sm shadow-[0_0_18px_rgba(220,38,38,0.7)] cursor-pointer transition-all active:scale-95 border border-[#FF5722]/60"
                  >
                    <Plus className="w-4 h-4" />
                    <span style={{ fontFamily: "'Cinzel', serif" }}>FORGE NEW RELIC</span>
                  </button>
                </div>
              </div>

              {/* Right Altar Icon */}
              <div className="z-10 shrink-0 flex items-center justify-center relative w-60 h-36 rounded-xl bg-gradient-to-b from-[#200A0A] to-[#120505] border border-[#8C2828] p-4 shadow-[0_0_20px_rgba(140,40,40,0.4)]">
                <div className="flex flex-col items-center text-center gap-1.5">
                  <Hammer className="w-8 h-8 text-[#FF3D00] drop-shadow-[0_0_8px_#FF3D00]" />
                  <span
                    style={{ fontFamily: "'Cinzel', serif" }}
                    className="text-xs font-black text-[#F5D060] tracking-widest uppercase mt-1"
                  >
                    HULDRA BROTHERS FORGE
                  </span>
                  <span className="text-[10.5px] text-[#8C7A7A]">Leviathan Upgrades Active</span>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {FILTER_TABS.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      activeFilter === tab.id
                        ? 'bg-gradient-to-r from-[#8B0000] to-[#550A0A] text-white border-[#FF3D00] shadow-[0_0_12px_rgba(255,61,0,0.4)]'
                        : 'bg-[#120A0A] text-[#9E8B8B] border-[#2D1515] hover:border-[#522020] hover:text-[#F5E8E8]'
                    }`}
                  >
                    <span style={{ fontFamily: "'Cinzel', serif" }}>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-[#8C2828] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search forged relics..."
                  className="w-full pl-9 pr-3 py-2 bg-[#120A0A] border border-[#3D1C1C] rounded-lg text-xs text-[#F5E8E8] placeholder:text-[#6E5A5A] outline-none focus:border-[#FF3D00]"
                />
              </div>
            </div>

            {/* Relics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map(p => {
                const badge = STATUS_BADGE[p.status]
                return (
                  <div
                    key={p.id}
                    className="bg-[#120808] rounded-2xl border border-[#3D1C1C] overflow-hidden shadow-lg hover:border-[#8C2828] hover:shadow-[0_0_20px_rgba(140,40,40,0.4)] transition-all flex flex-col justify-between group"
                  >
                    <div className="p-3 h-36 relative">
                      {p.thumbnail}
                      <span className={`absolute top-5 right-5 px-2 py-0.5 rounded text-[9px] font-pixel font-bold uppercase ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="p-4 flex flex-col gap-2 flex-1 border-t border-[#200A0A]">
                      <h3
                        style={{ fontFamily: "'Cinzel', serif" }}
                        className="font-bold text-sm text-[#F5E8E8] group-hover:text-[#FF5722] transition-colors"
                      >
                        {p.title}
                      </h3>
                      <p className="text-[11px] text-[#8C7A7A] line-clamp-2 leading-relaxed">
                        {p.subtitle}
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {p.tags.map(t => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-[#1C0A0A] text-[#FF8A80] text-[10px] font-bold border border-[#8C2828]/40"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {p.progress !== undefined && (
                        <div className="pt-2">
                          <div className="flex justify-between text-[10px] text-[#A89898] mb-1">
                            <span style={{ fontFamily: "'Cinzel', serif" }}>FORGE STAGE</span>
                            <span className="font-mono text-[#FF5722]">{p.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-[#1C0A0A] rounded-full overflow-hidden border border-[#3D1C1C]">
                            <div
                              className="h-full bg-gradient-to-r from-[#8B0000] to-[#FF3D00]"
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="px-4 pb-4 flex items-center justify-between border-t border-[#200A0A] pt-3 text-xs">
                      <span className="text-[#F5D060] font-mono font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> +{p.xp} XP
                      </span>
                      <button
                        type="button"
                        onClick={onNewProject}
                        className="px-3.5 py-1.5 rounded-lg bg-[#1C0A0A] hover:bg-[#280C0C] text-[#D1C2C2] hover:text-white border border-[#3D1C1C] font-bold text-xs cursor-pointer transition-all"
                      >
                        <span style={{ fontFamily: "'Cinzel', serif" }}>OPEN FORGE</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT SIDEBAR (~25%) */}
          <div className="xl:col-span-3 flex flex-col gap-4">
            <div className="bg-[#0E0606] rounded-2xl p-5 border border-[#3D1C1C] shadow-lg space-y-3">
              <div
                style={{ fontFamily: "'Cinzel', serif" }}
                className="text-[10px] font-bold text-[#8C7A7A] uppercase tracking-widest border-b border-[#261010] pb-3"
              >
                FORGE MILESTONES
              </div>
              <div className="flex flex-col gap-2.5 text-xs text-[#D1C2C2]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E5FF] stroke-[3]" />
                  <span>Inscribe First Script (+100 XP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E5FF] stroke-[3]" />
                  <span>Publish Sovereign App (+150 XP)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00E5FF] stroke-[3]" />
                  <span>Channel External APIs (+200 XP)</span>
                </div>
                <div className="flex items-center gap-2 text-[#6E5A5A]">
                  <Lock className="w-3.5 h-3.5 text-[#3D1C1C]" />
                  <span>Grand God of War Engine (+300 XP)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
