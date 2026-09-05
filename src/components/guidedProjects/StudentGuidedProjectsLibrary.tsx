import React, { useState, useEffect, useCallback } from 'react'
import {
  Compass,
  Search,
  Clock,
  Award,
  Play,
  Layers,
  Loader2,
} from 'lucide-react'
import {
  fetchPublishedGuidedProjects,
  fetchStudentProjectDetails,
  type GuidedProjectWithStudentProgress,
  type StudentStageView,
  type GuidedProjectDifficulty,
} from '../../lib/guidedProjects'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { GuidedProjectDetailModal } from './GuidedProjectDetailModal'

interface StudentGuidedProjectsLibraryProps {
  onSelectProject: (projectId: string) => void
}

export const StudentGuidedProjectsLibrary: React.FC<StudentGuidedProjectsLibraryProps> = ({
  onSelectProject,
}) => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<GuidedProjectWithStudentProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | GuidedProjectDifficulty>('all')

  // Selected project for modal
  const [selectedProject, setSelectedProject] = useState<GuidedProjectWithStudentProgress | null>(null)
  const [selectedStages, setSelectedStages] = useState<StudentStageView[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [loadingModal, setLoadingModal] = useState(false)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    const data = await fetchPublishedGuidedProjects(user?.id)
    setProjects(data)
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleOpenDetail = async (project: GuidedProjectWithStudentProgress) => {
    setSelectedProject(project)
    setModalOpen(true)
    setLoadingModal(true)
    const details = await fetchStudentProjectDetails(project.id, user?.id)
    setSelectedStages(details.stages)
    setLoadingModal(false)
  }

  const filteredProjects = projects.filter((p) => {
    const matchesDiff = difficultyFilter === 'all' ? true : p.difficulty === difficultyFilter
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesDiff && matchesSearch
  })

  const { theme } = useTheme()

  if (theme === 'classic') {
    return (
      <div className="space-y-6">
        {/* Hero Header matching Screenshot 4 */}
        <div className="relative bg-gradient-to-r from-[#2E1065] via-[#1E1B4B] to-[#0F172A] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-purple-900/40 overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-400/30 text-[10px] uppercase font-bold text-purple-200">
              <span className="text-purple-400 font-black">@</span>
              <span>MULTI-STAGE CODING JOURNEYS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-wider text-white font-pixel">
              GUIDED PROJECTS
            </h1>

            <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed max-w-xl">
              Build real interactive applications step-by-step. Each stage unlocks sequentially as you master algorithms, data structures, and practical software design.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Difficulty Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setDifficultyFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                difficultyFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ALL PROJECTS ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setDifficultyFilter('beginner')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                difficultyFilter === 'beginner'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              BEGINNER
            </button>
            <button
              type="button"
              onClick={() => setDifficultyFilter('intermediate')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                difficultyFilter === 'intermediate'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              INTERMEDIATE
            </button>
            <button
              type="button"
              onClick={() => setDifficultyFilter('advanced')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                difficultyFilter === 'advanced'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ADVANCED
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search guided projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl p-16 border border-slate-200 text-center shadow-sm">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
            <p className="text-xs uppercase font-bold text-slate-500">
              Loading guided projects...
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 border border-slate-200 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-700">No projects found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const isStarted = Boolean(project.user_progress)
              const completedCount = project.completed_stages_count || 0
              const totalStages = project.stages_count || 1
              const progressPercent = Math.min(100, Math.round((completedCount / totalStages) * 100))

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-purple-400 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-700">
                        {project.difficulty}
                      </span>
                      {project.badge && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Award className="w-3 h-3 text-amber-500" />
                          <span>{project.badge.title}</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors leading-snug">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {project.estimated_minutes} mins
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {project.stages_count || 1} Stages
                      </span>
                    </div>

                    {isStarted && (
                      <div className="pt-2 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold">
                          <span className="text-slate-500">Progress</span>
                          <span className="text-purple-600 font-bold font-mono">
                            {completedCount}/{totalStages} ({progressPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                          <div
                            className="h-full bg-purple-600 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(project)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-bold uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      VIEW ROADMAP
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectProject(project.id)}
                      className="btn-gamified-3d btn-gamified-3d-primary px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isStarted ? 'CONTINUE' : 'START'}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Project Detail Modal */}
        {selectedProject && (
          <GuidedProjectDetailModal
            project={selectedProject}
            stages={selectedStages}
            loading={loadingModal}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onStartOrContinue={(proj) => {
              setModalOpen(false)
              onSelectProject(proj.id)
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-[#180A0A] via-[#0E0505] to-[#0A0404] text-white rounded-2xl p-6 sm:p-8 overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.85)] border-2 border-[#8C2828]">
        <div className="absolute top-0 right-1/4 w-96 h-36 bg-[#FF3D00]/15 blur-[90px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF3D00] to-transparent" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#2A0E0E] border border-[#8C2828] text-[10px] uppercase font-bold text-[#FF8A80]">
            <Compass className="w-3.5 h-3.5 text-[#FF3D00]" />
            <span style={{ fontFamily: "'Cinzel', serif" }}>Multi-Stage Dwarven Blueprints</span>
          </div>

          <h1
            style={{ fontFamily: "'Cinzel', serif" }}
            className="text-2xl sm:text-4xl font-black uppercase tracking-wider text-[#F5E8E8] leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
          >
            Sacred Guided Blueprints
          </h1>

          <p className="text-xs sm:text-sm text-[#A89898] leading-relaxed max-w-xl">
            Forge sovereign interactive software step-by-step. Each chamber unlocks sequentially as you master algorithms, data structures, and practical software design.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0E0606] p-4 rounded-xl border border-[#3D1C1C] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Difficulty Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto p-1 bg-[#140808] rounded-lg border border-[#2D1414]">
          <button
            type="button"
            onClick={() => setDifficultyFilter('all')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              difficultyFilter === 'all'
                ? 'bg-gradient-to-r from-[#8B0000] to-[#550A0A] text-white border-[#FF3D00]'
                : 'border-transparent text-[#8C7A7A] hover:text-[#F5E8E8]'
            }`}
          >
            <span style={{ fontFamily: "'Cinzel', serif" }}>All Blueprints ({projects.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setDifficultyFilter('beginner')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              difficultyFilter === 'beginner'
                ? 'bg-gradient-to-r from-[#8B0000] to-[#550A0A] text-white border-[#FF3D00]'
                : 'border-transparent text-[#8C7A7A] hover:text-[#00E5FF]'
            }`}
          >
            <span style={{ fontFamily: "'Cinzel', serif" }}>Mortal Initiate</span>
          </button>
          <button
            type="button"
            onClick={() => setDifficultyFilter('intermediate')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              difficultyFilter === 'intermediate'
                ? 'bg-gradient-to-r from-[#8B0000] to-[#550A0A] text-white border-[#FF3D00]'
                : 'border-transparent text-[#8C7A7A] hover:text-[#F5D060]'
            }`}
          >
            <span style={{ fontFamily: "'Cinzel', serif" }}>Hero Tier</span>
          </button>
          <button
            type="button"
            onClick={() => setDifficultyFilter('advanced')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
              difficultyFilter === 'advanced'
                ? 'bg-gradient-to-r from-[#8B0000] to-[#550A0A] text-white border-[#FF3D00]'
                : 'border-transparent text-[#8C7A7A] hover:text-[#FF3D00]'
            }`}
          >
            <span style={{ fontFamily: "'Cinzel', serif" }}>God of War</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search blueprints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-[#120A0A] border border-[#3D1C1C] rounded-lg text-xs text-[#F5E8E8] placeholder:text-[#6E5A5A] focus:outline-none focus:border-[#FF3D00] transition-all"
          />
          <Search className="w-3.5 h-3.5 text-[#8C2828] absolute left-3 top-3" />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="bg-[#0E0606] rounded-2xl p-16 border border-[#3D1C1C] text-center shadow-lg">
          <Loader2 className="w-8 h-8 text-[#FF3D00] animate-spin mx-auto mb-3" />
          <p
            style={{ fontFamily: "'Cinzel', serif" }}
            className="text-xs uppercase font-bold text-[#A89898]"
          >
            Summoning Blueprints from Nidavellir...
          </p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-[#0E0606] rounded-2xl p-16 border border-[#3D1C1C] text-center shadow-lg">
          <div className="w-12 h-12 bg-[#240C0C] border border-[#8C2828] text-[#FF3D00] rounded-xl flex items-center justify-center mx-auto mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h3
            style={{ fontFamily: "'Cinzel', serif" }}
            className="text-sm uppercase font-bold text-[#F5E8E8] mb-1"
          >
            No Blueprints Discovered
          </h3>
          <p className="text-xs text-[#8C7A7A] max-w-sm mx-auto">
            {searchTerm
              ? `No blueprints matching "${searchTerm}".`
              : 'New guided relics are currently being forged by Brok and Sindri.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const isStarted = Boolean(project.user_progress)
            const completedCount = project.completed_stages_count || 0
            const totalStages = project.stages_count || 1
            const progressPercent = Math.min(100, Math.round((completedCount / totalStages) * 100))

            return (
              <div
                key={project.id}
                className="bg-[#120808] rounded-2xl border border-[#3D1C1C] hover:border-[#8C2828] p-5 shadow-lg hover:shadow-[0_0_20px_rgba(140,40,40,0.4)] transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-pixel uppercase font-bold bg-[#1C0A0A] border border-[#8C2828] text-[#FF8A80]">
                      {project.difficulty}
                    </span>

                    {project.badge && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#F5D060] bg-[#1C1206] px-2 py-0.5 rounded border border-[#C59B27]/50">
                        <Award className="w-3 h-3 text-[#F5D060]" />
                        <span>{project.badge.title}</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3
                      style={{ fontFamily: "'Cinzel', serif" }}
                      className="text-base font-bold text-[#F5E8E8] group-hover:text-[#FF5722] transition-colors leading-snug"
                    >
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-xs text-[#8C7A7A] line-clamp-2 mt-1 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-3 text-xs text-[#A89898] font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#8C2828]" />
                      {project.estimated_minutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-[#FF3D00]" />
                      {project.stages_count || 1} Stages
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {isStarted && (
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-pixel uppercase">
                        <span className="text-[#8C7A7A]">Forged</span>
                        <span className="text-[#FF5722] font-mono font-bold">
                          {completedCount}/{totalStages} ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1C0A0A] rounded-full overflow-hidden border border-[#3D1C1C]">
                        <div
                          className="h-full bg-gradient-to-r from-[#8B0000] to-[#FF3D00] rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card CTA Actions */}
                <div className="pt-4 mt-4 border-t border-[#200A0A] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(project)}
                    className="text-xs text-[#C4B5B5] hover:text-white font-bold cursor-pointer transition-colors"
                  >
                    <span style={{ fontFamily: "'Cinzel', serif" }}>INSPECT BLUEPRINT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectProject(project.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#8B0000] to-[#550A0A] hover:from-[#A81010] text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 border border-[#8C2828]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span style={{ fontFamily: "'Cinzel', serif" }}>
                      {isStarted ? 'RESUME FORGE' : 'BEGIN FORGE'}
                    </span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <GuidedProjectDetailModal
          project={selectedProject}
          stages={selectedStages}
          loading={loadingModal}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onStartOrContinue={(proj) => {
            setModalOpen(false)
            onSelectProject(proj.id)
          }}
        />
      )}
    </div>
  )
}
