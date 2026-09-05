import React, { useState, useCallback, useMemo } from 'react'
import {
  Heart,
  MessageSquare,
  UserPlus,
  UserCheck,
  Send,
  Trash2,
  Users,
  Search,
  ExternalLink,
  Sparkles,
  BookOpen,
  FolderGit2,
  Flag,
  Clock,
  X,
  Share2,
  Flame,
  Trophy,
  HelpCircle,
  Code2,
  CheckCircle2,
  Zap,
  Tag,
  Copy,
  Check,
  Rocket,
  Compass,
  Filter,
  ShieldCheck,
  Award,
  TrendingUp,
} from 'lucide-react'
import {
  useCommunityFeed,
  fetchPostComments,
  addPostComment,
  deletePostComment,
  reportContent,
  type CommunityPost,
  type PostComment,
} from '../../lib/community'
import { useBlogs, type Blog } from '../../lib/blogs'
import { useProjectShowcases, type ProjectShowcase } from '../../lib/projects'
import { useAuth } from '../../context/AuthContext'
import { relativeTime } from '../crucible/crucibleTokens'
import { toast } from 'react-hot-toast'

/* ─────────────────────────────────────────────────────────────
   ClassicCommentThread — Light gamified discussion panel
───────────────────────────────────────────────────────────────── */
interface ClassicCommentThreadProps {
  postId: string
  onClose: () => void
}

export const ClassicCommentThread: React.FC<ClassicCommentThreadProps> = ({ postId, onClose }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<PostComment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  const loadComments = useCallback(async () => {
    setLoading(true)
    const data = await fetchPostComments(postId)
    setComments(data)
    setLoading(false)
  }, [postId])

  React.useEffect(() => {
    loadComments()
  }, [loadComments])

  const handlePost = async () => {
    if (!user?.id || !newComment.trim()) return
    setIsPosting(true)
    const result = await addPostComment(user.id, postId, newComment.trim())
    if (result) {
      setNewComment('')
      await loadComments()
    } else {
      toast.error('Failed to post comment')
    }
    setIsPosting(false)
  }

  const handleDelete = async (commentId: string) => {
    if (!user?.id) return
    const success = await deletePostComment(commentId)
    if (success) await loadComments()
  }

  return (
    <div className="flex flex-col gap-0 rounded-2xl overflow-hidden bg-[#faf8f5] border border-stone-200 mt-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-stone-800">
            Discussion ({comments.length})
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Comments list */}
      <div className="flex flex-col gap-2.5 p-4 max-h-72 overflow-y-auto">
        {loading ? (
          <div className="text-center py-4 text-xs text-stone-400 font-medium">Loading comments…</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-stone-400">
            <div className="text-2xl mb-1">💬</div>
            <p className="text-xs font-medium">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3 group bg-white p-3 rounded-xl border border-stone-100 shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0 flex items-center justify-center text-xs font-bold">
                {(c.author_name || '?').charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-stone-900">
                    {c.author_name || 'Anonymous Learner'}
                  </span>
                  {c.author_role === 'admin' && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Staff
                    </span>
                  )}
                  <span className="text-[10px] text-stone-400">{relativeTime(c.created_at)}</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">{c.content}</p>
              </div>

              {user?.id === c.user_id && (
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-rose-500 cursor-pointer"
                  title="Delete comment"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reply input */}
      {user && (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-stone-200 bg-white">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handlePost()}
            placeholder="Write a helpful reply..."
            className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 placeholder:text-stone-400 outline-none focus:bg-white focus:border-emerald-500 transition-all"
          />
          <button
            type="button"
            onClick={handlePost}
            disabled={isPosting || !newComment.trim()}
            className="p-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white transition-all disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Gamified Helper Components & Card
───────────────────────────────────────────────────────────────── */
const CopySnippetButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Code copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-stone-200 transition-colors p-1 rounded cursor-pointer"
      title="Copy snippet"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  )
}

const getPostCategory = (post: CommunityPost) => {
  if (post.project_showcase) {
    return { label: 'Showcase', icon: Rocket, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
  }
  const lower = post.content.toLowerCase()
  if (
    lower.includes('completed') ||
    lower.includes('finished') ||
    lower.includes('solved') ||
    lower.includes('milestone') ||
    lower.includes('achievement') ||
    lower.includes('passed') ||
    lower.includes('unlocked')
  ) {
    return { label: 'Milestone', icon: Trophy, color: 'bg-amber-50 text-amber-800 border-amber-200' }
  }
  if (
    lower.includes('?') ||
    lower.includes('help') ||
    lower.includes('how to') ||
    lower.includes('error') ||
    lower.includes('issue') ||
    lower.includes('why')
  ) {
    return { label: 'Question', icon: HelpCircle, color: 'bg-rose-50 text-rose-700 border-rose-200' }
  }
  if (
    lower.includes('```') ||
    lower.includes('const ') ||
    lower.includes('function') ||
    lower.includes('import ') ||
    lower.includes('def ')
  ) {
    return { label: 'Code Snippet', icon: Code2, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
  }
  return { label: 'Discussion', icon: MessageSquare, color: 'bg-purple-50 text-purple-700 border-purple-200' }
}

const getAuthorBadge = (authorRole?: string, authorName?: string) => {
  if (authorRole === 'admin') {
    return { title: 'Staff', color: 'bg-purple-100 text-purple-800 border-purple-200', level: 25 }
  }
  const hash = (authorName || 'coder').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const level = 3 + (hash % 13)
  const ranks = ['Novice', 'Adventurer', 'Code Knight', 'Builder', 'Grandmaster']
  const rank = ranks[hash % ranks.length]
  return { title: rank, color: 'bg-stone-100 text-stone-700 border-stone-200', level }
}

const renderPostContent = (text: string) => {
  const codeRegex = /```([a-zA-Z]*)\n?([\s\S]*?)```/g
  const parts: { type: 'text' | 'code'; content: string; lang?: string }[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'code', lang: match[1] || 'javascript', content: match[2].trim() })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) })
  }

  if (parts.length === 0 || (parts.length === 1 && parts[0].type === 'text')) {
    return (
      <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-normal whitespace-pre-line break-words">
        {text}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {parts.map((p, idx) =>
        p.type === 'text' ? (
          <p
            key={idx}
            className="text-xs sm:text-sm text-stone-800 leading-relaxed font-normal whitespace-pre-line break-words"
          >
            {p.content}
          </p>
        ) : (
          <div
            key={idx}
            className="rounded-xl overflow-hidden bg-[#18181b] border border-stone-800 text-stone-200 font-mono text-xs shadow-inner"
          >
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#202024] border-b border-stone-800 text-[10px] text-stone-400">
              <span className="font-bold uppercase tracking-wider text-emerald-400">
                {p.lang || 'code'}
              </span>
              <CopySnippetButton text={p.content} />
            </div>
            <pre className="p-3.5 overflow-x-auto text-[11.5px] leading-relaxed scrollbar-thin scrollbar-thumb-stone-700">
              <code>{p.content}</code>
            </pre>
          </div>
        )
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ClassicPostCard — Single gamified card
───────────────────────────────────────────────────────────────── */
interface ClassicPostCardProps {
  post: CommunityPost
  onLike: (postId: string) => void
  onFollow: (authorId: string) => void
  onReport: (postId: string) => void
  onDelete?: (postId: string) => void
  currentUserId?: string
  isAdmin?: boolean
}

const ClassicPostCard: React.FC<ClassicPostCardProps> = ({
  post,
  onLike,
  onFollow,
  onReport,
  onDelete,
  currentUserId,
  isAdmin,
}) => {
  const [showComments, setShowComments] = useState(false)
  const isOwn = currentUserId === post.user_id
  const category = getPostCategory(post)
  const authorBadge = getAuthorBadge(post.author_role, post.author_name)
  const CategoryIcon = category.icon

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Transmission link copied to clipboard! 📋')
    }
  }

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-200 flex flex-col gap-4 group">
      {/* Post author header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Avatar with level badge */}
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
              {(post.author_name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-stone-900 border border-stone-700 text-white text-[9px] font-pixel font-bold">
              L{authorBadge.level}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-extrabold text-stone-900 text-sm tracking-tight truncate">
                {post.author_name || 'Anonymous Coder'}
              </h4>
              <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold border ${authorBadge.color}`}>
                {authorBadge.title}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-md text-[10px] font-bold border ${category.color}`}
              >
                <CategoryIcon className="w-3 h-3" />
                <span>{category.label}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-stone-400 font-medium mt-0.5">
              <span>@{post.author_name?.toLowerCase().replace(/\s+/g, '_') || 'coder'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" />
                {relativeTime(post.created_at ?? '')}
              </span>
            </div>
          </div>
        </div>

        {/* Follow author */}
        {!isOwn && (
          <button
            type="button"
            onClick={() => onFollow(post.user_id)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              post.is_following_author
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
            }`}
          >
            {post.is_following_author ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Follow</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Post body */}
      <div className="min-w-0">{renderPostContent(post.content)}</div>

      {/* Post Image */}
      {post.image_url && (
        <div className="rounded-xl overflow-hidden border border-stone-200 max-h-72">
          <img src={post.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Project showcase preview */}
      {post.project_showcase && (
        <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white border border-indigo-200/80 flex flex-col gap-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
              <Rocket className="w-3.5 h-3.5 text-indigo-600" />
              <span>Project Showcase</span>
            </span>
            {post.project_showcase.project_category && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                {post.project_showcase.project_category}
              </span>
            )}
          </div>
          <h5 className="font-extrabold text-sm text-stone-900">{post.project_showcase.title}</h5>
          {post.project_showcase.description && (
            <p className="text-xs text-stone-600 line-clamp-2">{post.project_showcase.description}</p>
          )}
          {post.project_showcase.live_url && (
            <a
              href={post.project_showcase.live_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 hover:underline mt-1"
            >
              <span>Launch Live App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Actions footer */}
      <div className="flex items-center justify-between pt-3 border-t border-stone-100 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Like / Cheer Button */}
          <button
            type="button"
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              post.is_liked_by_user
                ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-2xs'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${post.is_liked_by_user ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{post.likes_count}</span>
            {post.is_liked_by_user && <span className="text-[10px] text-rose-500 font-pixel">Liked</span>}
          </button>

          {/* Comments Toggle Button */}
          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              showComments
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-2xs'
                : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{post.comments_count}</span>
            <span className="text-[10px] text-stone-400 font-sans hidden sm:inline">Comments</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100 hover:text-stone-900 transition-all cursor-pointer"
            title="Share transmission"
          >
            <Share2 className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={() => onReport(post.id)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
            title="Report post"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>

          {(isOwn || isAdmin) && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(post.id)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete post"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable comments thread */}
      {showComments && (
        <ClassicCommentThread postId={post.id} onClose={() => setShowComments(false)} />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ClassicCommunityFeed — Main Gamified Community View
───────────────────────────────────────────────────────────────── */
export const ClassicCommunityFeed: React.FC = () => {
  const { user, profile, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<'posts' | 'blogs' | 'showcases'>('posts')
  const [search, setSearch] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [readingBlog, setReadingBlog] = useState<Blog | null>(null)

  // 1. Posts Feed Data
  const {
    posts,
    loading: postsLoading,
    toggleLike: likePost,
    toggleFollow: followAuthor,
    removePost: deletePost,
    addPost: createPost,
    refreshFeed: refreshPosts,
  } = useCommunityFeed(user?.id)

  // 2. Blogs Data
  const {
    blogs,
    loading: blogsLoading,
    toggleBlogLike,
  } = useBlogs(false, user?.id)

  // 3. Project Showcases Data
  const {
    showcases,
    loading: showcasesLoading,
  } = useProjectShowcases()

  // Filters
  const filteredPosts = posts.filter((p) => {
    if (
      search &&
      !p.content.toLowerCase().includes(search.toLowerCase()) &&
      !p.author_name?.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  const filteredBlogs = blogs.filter((b) => {
    if (
      search &&
      !b.title.toLowerCase().includes(search.toLowerCase()) &&
      !b.summary?.toLowerCase().includes(search.toLowerCase()) &&
      !b.author?.username?.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  const filteredShowcases = showcases.filter((s) => {
    if (
      search &&
      !s.title.toLowerCase().includes(search.toLowerCase()) &&
      !s.description?.toLowerCase().includes(search.toLowerCase()) &&
      !s.author_name?.toLowerCase().includes(search.toLowerCase()) &&
      !s.project_title?.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  // Gamified Post Filtering & Composer States
  const [postCategoryFilter, setPostCategoryFilter] = useState<'all' | 'trending' | 'questions' | 'milestones' | 'code'>('all')
  const [composerCategory, setComposerCategory] = useState<'discussion' | 'question' | 'code' | 'milestone'>('discussion')

  const sortedAndFilteredPosts = useMemo(() => {
    let list = [...filteredPosts]

    if (postCategoryFilter === 'trending') {
      list.sort((a, b) => ((b.likes_count || 0) * 2 + (b.comments_count || 0) * 3) - ((a.likes_count || 0) * 2 + (a.comments_count || 0) * 3))
    } else if (postCategoryFilter === 'questions') {
      list = list.filter(p => p.content.includes('💡 [Question]') || p.content.includes('?') || /how|why|error|bug|help|issue|fix/i.test(p.content))
    } else if (postCategoryFilter === 'milestones') {
      list = list.filter(p => p.content.includes('🏆 [Milestone]') || p.project_showcase || /completed|shipped|finished|passed|level|built|launched/i.test(p.content))
    } else if (postCategoryFilter === 'code') {
      list = list.filter(p => p.content.includes('⚡ [Snippet]') || p.content.includes('```') || /function|const|import|class|def /i.test(p.content))
    }

    return list
  }, [filteredPosts, postCategoryFilter])

  const handleLikePost = async (postId: string) => {
    if (!user?.id) return
    await likePost(postId)
  }

  const handleFollow = async (authorId: string) => {
    if (!user?.id) return
    await followAuthor(authorId)
    await refreshPosts()
  }

  const handleReport = async (postId: string) => {
    if (!user?.id) return
    await reportContent(user.id, 'Reported by user', postId)
    toast.success('Report submitted for review.')
  }

  const handleDeletePost = async (postId: string) => {
    if (!user?.id) return
    await deletePost(postId)
    await refreshPosts()
  }

  const handleCreatePost = async () => {
    if (!user?.id || !newPostContent.trim()) return
    setIsPosting(true)

    // Prefix with category tag for nice gamified filtering if selected
    let contentToSave = newPostContent.trim()
    if (composerCategory === 'question' && !contentToSave.startsWith('💡 [Question]')) {
      contentToSave = `💡 [Question] ${contentToSave}`
    } else if (composerCategory === 'code' && !contentToSave.startsWith('⚡ [Snippet]')) {
      contentToSave = `⚡ [Snippet] ${contentToSave}`
    } else if (composerCategory === 'milestone' && !contentToSave.startsWith('🏆 [Milestone]')) {
      contentToSave = `🏆 [Milestone] ${contentToSave}`
    }

    await createPost(contentToSave, 'text')
    setNewPostContent('')
    await refreshPosts()
    setIsPosting(false)
    toast.success('Post published! +15 XP earned!')
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-6 pb-20 select-none font-sans animate-in fade-in duration-300">
      {/* ── 1. Gamified Community Hero with Shaded Animation & Cartoonish Image ── */}
      <div className="relative bg-gradient-to-r from-[#FAF5FF] via-[#F3E8FF] to-[#EDE9FE] border border-purple-200/80 rounded-3xl p-6 sm:p-8 md:p-10 overflow-hidden shadow-md flex flex-col md:flex-row items-center justify-between gap-6 animate-shade-sweep">
        {/* Shaded Ambient Glow Overlays */}
        <div className="absolute -right-12 -top-12 w-80 h-80 rounded-full bg-purple-300/30 blur-3xl pointer-events-none animate-shade-glow" />
        <div className="absolute left-1/3 bottom-0 w-72 h-32 bg-indigo-300/20 blur-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/5 via-transparent to-white/40 pointer-events-none" />

        {/* Full Cover Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/extracted/community_guild_art.jpg"
            alt="Community Guild Art"
            className="w-full h-full object-cover opacity-85 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF5FF] via-[#FAF5FF]/80 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col gap-2.5 max-w-xl text-left">
          <div className="flex items-center gap-1.5 text-purple-700 font-pixel text-[10px] font-bold tracking-wider uppercase bg-white/90 border border-purple-200 px-3 py-1 rounded-full w-fit shadow-xs backdrop-blur-sm">
            <span>✦</span>
            <span>CODÉDEX COMMUNITY GUILD</span>
            <span>✦</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight font-pixel">
            Community Hub ✨
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
            Explore discussions, share advice, read community blog articles, and browse creative project showcases built by fellow coders!
          </p>

          <div className="flex items-center gap-3 pt-2">
            <span className="px-3 py-1 rounded-xl bg-white/90 border border-purple-200 text-purple-700 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Global Developer Lounge
            </span>
          </div>
        </div>

      </div>

      {/* ── 2. Profile Network Bar ── */}
      {profile && (
        <div className="bg-white border border-[#ece7df] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-base flex items-center justify-center shadow-xs">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                (profile.username || 'A').charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="font-extrabold text-stone-900 text-base">
                {profile.full_name || profile.username || 'Adventurer'}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                  Level {profile.level || 1}
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  {profile.xp?.toLocaleString() || 0} XP
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:ml-auto">
            <div className="flex flex-col items-center">
              <span className="text-base font-black text-stone-900 font-pixel">{posts.length}</span>
              <span className="text-[10px] text-stone-400 font-bold uppercase">Posts</span>
            </div>
            <div className="h-6 w-[1px] bg-stone-200" />
            <div className="flex flex-col items-center">
              <span className="text-base font-black text-stone-900 font-pixel">{blogs.length}</span>
              <span className="text-[10px] text-stone-400 font-bold uppercase">Blogs</span>
            </div>
            <div className="h-6 w-[1px] bg-stone-200" />
            <div className="flex flex-col items-center">
              <span className="text-base font-black text-stone-900 font-pixel">{showcases.length}</span>
              <span className="text-[10px] text-stone-400 font-bold uppercase">Showcases</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Section Navigation Tabs & Search ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Main 3 Sections: Posts, Blogs, Projects */}
        <div className="flex items-center gap-1.5 p-1.5 bg-stone-100 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'posts'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>💬 Posts</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200/80 text-stone-700 font-mono">
              {posts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('blogs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'blogs'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>📰 Blogs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200/80 text-stone-700 font-mono">
              {blogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('showcases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'showcases'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>🚀 Project Showcases</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200/80 text-stone-700 font-mono">
              {showcases.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="text-xs pl-8 pr-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-800 placeholder:text-stone-400 outline-none focus:border-emerald-500 transition-all w-full sm:w-56"
          />
        </div>
      </div>

      {/* ── 4. TAB CONTENT ── */}

      {/* TAB 1: POSTS */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Feed Column */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Gamified Post Composer */}
            {user && (
              <div className="bg-white border border-[#e5e0d8] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                {/* Header row with user stats and XP incentive */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-black text-xs flex items-center justify-center">
                      {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-stone-800 tracking-tight">
                        {profile?.username || 'Fellow Builder'}
                      </span>
                      <span className="text-[10px] text-stone-400 font-semibold">
                        Level {profile?.level || 1} • {profile?.xp || 0} XP
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span>+15 XP per post</span>
                  </div>
                </div>

                {/* Category Selection Chips */}
                <div className="flex items-center gap-1.5 pt-3 pb-2 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'discussion', label: '💬 Discussion' },
                    { id: 'question', label: '💡 Question' },
                    { id: 'code', label: '⚡ Code Snippet' },
                    { id: 'milestone', label: '🏆 Milestone' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setComposerCategory(cat.id as any)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                        composerCategory === cat.id
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative mt-2">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={
                      composerCategory === 'question'
                        ? 'Ask the community! What code issue, bug, or concept are you stuck on?'
                        : composerCategory === 'code'
                        ? 'Share a cool function, trick, or component snippet (use ```js code ```)...'
                        : composerCategory === 'milestone'
                        ? 'What did you just build, pass, or conquer today? Celebrate your win!'
                        : 'What are you building or learning today? Share your thoughts...'
                    }
                    rows={3}
                    className="w-full text-xs sm:text-sm rounded-xl px-4 py-3 bg-[#faf8f5] border border-stone-200 text-stone-900 placeholder:text-stone-400 outline-none resize-none transition-all focus:bg-white focus:border-emerald-500"
                  />
                </div>

                {/* Composer Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewPostContent(prev => prev + '\n```javascript\n// Paste your code here\n```\n')
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Insert code snippet format"
                    >
                      <Code2 className="w-3 h-3 text-stone-500" />
                      <span>+ Code Block</span>
                    </button>
                    <span className="text-[10px] text-stone-400 hidden sm:inline font-medium">
                      Markdown & syntax highlighting supported
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {newPostContent.length > 0 && (
                      <span className="text-[10px] text-stone-400 font-mono">
                        {newPostContent.length} chars
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleCreatePost}
                      disabled={isPosting || !newPostContent.trim()}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white text-xs font-black shadow-[0_3px_0_#047857] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{isPosting ? 'Publishing…' : 'Publish'}</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Gamified Feed Sub-Filters */}
            <div className="flex items-center justify-between bg-white border border-[#e5e0d8] rounded-xl px-4 py-2.5 shadow-xs overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Feed', icon: Compass },
                  { id: 'trending', label: 'Hot & Trending', icon: Flame },
                  { id: 'questions', label: 'Questions', icon: HelpCircle },
                  { id: 'milestones', label: 'Milestones', icon: Trophy },
                  { id: 'code', label: 'Snippets', icon: Code2 },
                ].map(tab => {
                  const Icon = tab.icon
                  const active = postCategoryFilter === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPostCategoryFilter(tab.id as any)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${active ? 'text-amber-400' : 'text-stone-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="text-[11px] font-bold text-stone-400 pl-3 shrink-0 hidden md:block">
                {sortedAndFilteredPosts.length} {sortedAndFilteredPosts.length === 1 ? 'post' : 'posts'}
              </div>
            </div>

            {/* Posts Stream */}
            {postsLoading ? (
              <div className="py-20 text-center text-stone-400 text-xs font-semibold flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading community feed…</span>
              </div>
            ) : sortedAndFilteredPosts.length === 0 ? (
              <div className="py-16 text-center bg-white border border-[#ece7df] rounded-2xl flex flex-col items-center gap-3 p-6">
                <span className="text-4xl">🚀</span>
                <h4 className="font-black text-stone-800 text-sm tracking-tight">No posts found in this category</h4>
                <p className="text-xs text-stone-500 max-w-sm">
                  {search
                    ? `No posts matching "${search}". Try adjusting your search term.`
                    : 'Be the trailblazer who starts this conversation!'}
                </p>
                {postCategoryFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setPostCategoryFilter('all')}
                    className="mt-1 px-4 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    View All Posts
                  </button>
                )}
              </div>
            ) : (
              sortedAndFilteredPosts.map((post) => (
                <ClassicPostCard
                  key={post.id}
                  post={post}
                  onLike={handleLikePost}
                  onFollow={handleFollow}
                  onReport={handleReport}
                  onDelete={handleDeletePost}
                  currentUserId={user?.id}
                  isAdmin={isAdmin}
                />
              ))
            )}
          </div>

          {/* Gamified Community Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Daily Builder Quest Card */}
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 font-pixel">
                    Daily Quest
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black">
                  +25 XP
                </span>
              </div>
              <p className="text-xs font-bold text-stone-800 mb-1">
                Participate in Discussions
              </p>
              <p className="text-[11px] text-stone-500 mb-3 leading-relaxed">
                Post an update or share feedback on 2 fellow builders' posts today.
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-black text-stone-500">
                  <span>Progress</span>
                  <span className="text-amber-700">1 / 2 Completed</span>
                </div>
                <div className="w-full h-2 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full w-1/2" />
                </div>
              </div>
            </div>

            {/* Top Active Builders / Leaderboard Spotlight */}
            <div className="bg-white border border-[#e5e0d8] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 font-pixel">
                    Community Champions
                  </h4>
                </div>
                <span className="text-[10px] text-stone-400 font-semibold">Weekly</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {[
                  { name: 'Alex Rivera', handle: '@arivera', xp: '1,450 XP', level: 14, badge: '🥇' },
                  { name: 'Elena Chen', handle: '@echen', xp: '1,120 XP', level: 12, badge: '🥈' },
                  { name: 'Marcus Vance', handle: '@marcus_v', xp: '980 XP', level: 10, badge: '🥉' },
                ].map((champ, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base select-none">{champ.badge}</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-stone-800 leading-tight">
                          {champ.name}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {champ.handle} • Lv. {champ.level}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {champ.xp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Topics & Hashtags */}
            <div className="bg-white border border-[#e5e0d8] rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100 mb-3">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 font-pixel">
                  Trending Topics
                </h4>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: '#javascript', count: '142' },
                  { tag: '#react', count: '98' },
                  { tag: '#guidedprojects', count: '76' },
                  { tag: '#fullstack', count: '54' },
                  { tag: '#algorithms', count: '39' },
                  { tag: '#olympuslevel10', count: '27' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSearch(item.tag.replace('#', ''))}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-bold transition-all cursor-pointer"
                  >
                    <span className="text-stone-900">{item.tag}</span>
                    <span className="text-[9px] text-stone-400 font-mono font-normal">({item.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Community Guidelines Widget */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-[11px] text-stone-600 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 font-black text-stone-800 uppercase tracking-wider text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Olympus Code of Conduct</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-stone-500 text-[10px]">
                <li>Encourage and celebrate each other's code wins</li>
                <li>Share reproducible code snippets for debugging</li>
                <li>Keep critiques constructive and supportive</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BLOGS */}
      {activeTab === 'blogs' && (
        <div className="flex flex-col gap-4">
          {blogsLoading ? (
            <div className="py-16 text-center text-stone-400 text-xs font-medium">Loading articles…</div>
          ) : filteredBlogs.length === 0 ? (
            <div className="py-16 text-center bg-white border border-[#ece7df] rounded-2xl flex flex-col items-center gap-2">
              <span className="text-3xl">📖</span>
              <h4 className="font-bold text-stone-800 text-sm">No blog articles found</h4>
              <p className="text-xs text-stone-500 max-w-sm">Community blog articles will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white border border-[#ece7df] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {blog.cover_image_url ? (
                    <div className="h-44 w-full overflow-hidden bg-stone-100">
                      <img
                        src={blog.cover_image_url}
                        alt={blog.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 flex items-center justify-center text-4xl">
                      📝
                    </div>
                  )}

                  <div className="p-5 flex flex-col gap-2.5 flex-1">
                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {blog.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <h3 className="font-extrabold text-base text-stone-900 leading-snug">
                      {blog.title}
                    </h3>

                    {blog.summary && (
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-medium">
                        {blog.summary}
                      </p>
                    )}

                    {/* Author & Date */}
                    <div className="flex items-center justify-between pt-3 mt-auto border-t border-stone-100 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">
                          {(blog.author?.username || 'A').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] font-bold text-stone-700">
                          {blog.author?.username || 'Codédex Staff'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleBlogLike(blog.id)}
                          className={`flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
                            blog.is_liked_by_user ? 'text-rose-500' : 'text-stone-400 hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${blog.is_liked_by_user ? 'fill-rose-500' : ''}`} />
                          <span>{blog.likes_count}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setReadingBlog(blog)}
                          className="px-3 py-1 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-[11px] font-bold shadow-xs cursor-pointer"
                        >
                          Read Article →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROJECT SHOWCASES */}
      {activeTab === 'showcases' && (
        <div className="flex flex-col gap-4">
          {showcasesLoading ? (
            <div className="py-16 text-center text-stone-400 text-xs font-medium">Loading project showcases…</div>
          ) : filteredShowcases.length === 0 ? (
            <div className="py-16 text-center bg-white border border-[#ece7df] rounded-2xl flex flex-col items-center gap-2">
              <span className="text-3xl">🚀</span>
              <h4 className="font-bold text-stone-800 text-sm">No project showcases found</h4>
              <p className="text-xs text-stone-500 max-w-sm">Completed student project builds will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredShowcases.map((sc) => (
                <div
                  key={sc.id}
                  className="bg-white border border-[#ece7df] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {Boolean(sc.preview_url || sc.image_url) ? (
                    <div className="h-36 w-full overflow-hidden bg-stone-100">
                      <img
                        src={(sc.preview_url || sc.image_url) ?? ''}
                        alt={sc.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-28 w-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-3xl">
                      💻
                    </div>
                  )}

                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                        {sc.project_title || sc.category || 'Project'}
                      </span>
                      <span className="text-[10px] text-stone-400">{relativeTime(sc.created_at ?? '')}</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-stone-900 line-clamp-1">{sc.title}</h4>
                    <p className="text-xs text-stone-600 line-clamp-2 font-medium leading-relaxed">
                      {sc.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 mt-auto border-t border-stone-100">
                      <div className="text-[11px] font-bold text-stone-700 truncate">
                        By {sc.author_name || 'Adventurer'}
                      </div>

                      {sc.live_url ? (
                        <a
                          href={sc.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-[11px] font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                        >
                          <span>Live Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-stone-400">Published</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 5. Reading Blog Modal ── */}
      {readingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-stone-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-100 flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  📖 Article Reader
                </span>
                <h2 className="text-xl font-black text-stone-900 mt-1">{readingBlog.title}</h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 font-medium">
                  <span>By {readingBlog.author?.username || 'Codédex Team'}</span>
                  <span>•</span>
                  <span>{relativeTime(readingBlog.created_at)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReadingBlog(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-4 text-sm text-stone-800 leading-relaxed">
              {readingBlog.cover_image_url && (
                <div className="rounded-2xl overflow-hidden max-h-64 border border-stone-200">
                  <img src={readingBlog.cover_image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              {readingBlog.summary && (
                <p className="font-semibold text-stone-900 bg-stone-50 p-4 rounded-xl border border-stone-200">
                  {readingBlog.summary}
                </p>
              )}
              <div className="whitespace-pre-line font-normal text-stone-700">
                {readingBlog.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => toggleBlogLike(readingBlog.id)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                  readingBlog.is_liked_by_user
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-stone-200 text-stone-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${readingBlog.is_liked_by_user ? 'fill-rose-600' : ''}`} />
                <span>{readingBlog.likes_count} Likes</span>
              </button>

              <button
                type="button"
                onClick={() => setReadingBlog(null)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
