import React, { useState, useCallback } from 'react'
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

  return (
    <div className="bg-white border border-[#ece7df] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col gap-3.5">
      {/* Post author header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
            {(post.author_name || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-stone-900 text-sm">{post.author_name || 'Anonymous Coder'}</h4>
              {post.author_role === 'admin' && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Staff
                </span>
              )}
            </div>
            <span className="text-[10px] text-stone-400 font-medium">{relativeTime(post.created_at ?? '')}</span>
          </div>
        </div>

        {/* Follow author */}
        {!isOwn && (
          <button
            type="button"
            onClick={() => onFollow(post.user_id)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              post.is_following_author
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100'
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
      <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium whitespace-pre-line">
        {post.content}
      </p>

      {/* Post Image */}
      {post.image_url && (
        <div className="rounded-xl overflow-hidden border border-stone-200 max-h-72">
          <img src={post.image_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Project showcase preview */}
      {post.project_showcase && (
        <div className="rounded-2xl p-4 bg-emerald-50/60 border border-emerald-200/80 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              🚀 Project Showcase
            </span>
            {post.project_showcase.project_category && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-700 text-[10px] font-bold">
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
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline mt-1"
            >
              <span>Live Demo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Actions footer */}
      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
              post.is_liked_by_user ? 'text-rose-500' : 'text-stone-500 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.is_liked_by_user ? 'fill-rose-500' : ''}`} />
            <span>{post.likes_count}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-emerald-600 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.comments_count}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReport(post.id)}
            className="text-[11px] font-medium text-stone-400 hover:text-amber-600 transition-colors cursor-pointer p-1"
            title="Report post"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>

          {(isOwn || isAdmin) && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(post.id)}
              className="text-[11px] font-medium text-stone-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
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
    await createPost(newPostContent.trim(), 'text')
    setNewPostContent('')
    await refreshPosts()
    setIsPosting(false)
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-6 pb-20 select-none font-sans animate-in fade-in duration-300">
      {/* ── 1. Gamified Community Hero ── */}
      <div className="relative bg-[#faf7f2] border border-[#ece7df] rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xs flex items-center justify-between">
        <div className="relative z-10 flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-1.5 text-amber-600 font-pixel text-[10px] font-bold tracking-wider uppercase bg-amber-50 border border-amber-200 px-3 py-1 rounded-full w-fit">
            <span>✦</span>
            <span>CODÉDEX COMMUNITY</span>
            <span>✦</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Community Hub ✨
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
            Explore discussions, read community blog articles, and browse creative project showcases built by fellow coders!
          </p>
        </div>

        {/* Decorative art */}
        <div className="hidden md:flex items-center justify-end w-2/5 shrink-0 pointer-events-none">
          <img src="/extracted/hero2_art_clean.png" alt="" className="h-28 w-auto object-contain opacity-90" />
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
        <div className="flex flex-col gap-4">
          {/* Post Composer */}
          {user && (
            <div className="bg-white border border-[#ece7df] rounded-2xl p-5 shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="font-pixel text-[10px] font-bold text-stone-800 uppercase tracking-wider">
                  Share With The Community
                </span>
              </div>

              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What are you building or learning today? Share your progress or ask a question..."
                rows={3}
                className="w-full text-xs sm:text-sm rounded-xl px-4 py-3 bg-[#faf8f5] border border-stone-200 text-stone-900 placeholder:text-stone-400 outline-none resize-none transition-all focus:bg-white focus:border-emerald-500"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-stone-400 font-medium">
                  💡 Be kind, helpful, and encourage fellow coders.
                </span>
                <button
                  type="button"
                  onClick={handleCreatePost}
                  disabled={isPosting || !newPostContent.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white text-xs font-extrabold shadow-[0_3px_0_#047857] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                >
                  <span>{isPosting ? 'Posting…' : 'Share Post'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {postsLoading ? (
            <div className="py-16 text-center text-stone-400 text-xs font-medium">Loading community posts…</div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-16 text-center bg-white border border-[#ece7df] rounded-2xl flex flex-col items-center gap-2">
              <span className="text-3xl">🌱</span>
              <h4 className="font-bold text-stone-800 text-sm">No posts found</h4>
              <p className="text-xs text-stone-500 max-w-sm">Be the first to share an update in the community!</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
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
