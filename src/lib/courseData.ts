export interface CourseCatalogItem {
  id: string
  title: string
  category: 'programming' | 'web' | 'ai' | 'game' | 'tools' | 'career'
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  hours: string
  chapters: number
  xp: number
  icon: string
  rating: string
  students: string
  description: string
  rewardTitle: string
  whatYouWillLearn?: string[]
  skillsUnlocked?: { name: string; colorClass: string }[]
}

export const COURSE_CATALOG: CourseCatalogItem[] = [
  {
    id: 'python',
    title: 'Python Adventure',
    category: 'programming',
    difficulty: 'Beginner',
    hours: '8–10 Hours',
    chapters: 18,
    xp: 2400,
    icon: '🐍',
    rating: '4.9',
    students: '12,400+',
    description: 'Master programming fundamentals by completing quests, solving challenges, and building real projects.',
    rewardTitle: 'Python Explorer',
    whatYouWillLearn: [
      'Variables & Data Types',
      'Functions & Loops',
      'Lists & Dictionaries',
      'Conditional Logic',
      'Error Handling',
      'Building Real Projects'
    ],
    skillsUnlocked: [
      { name: 'Python', colorClass: 'bg-sky-50 border-sky-200 text-sky-700' },
      { name: 'Logic', colorClass: 'bg-purple-50 border-purple-200 text-purple-700' },
      { name: 'Problem Solving', colorClass: 'bg-amber-50 border-amber-200 text-amber-700' },
      { name: 'Debugging', colorClass: 'bg-rose-50 border-rose-200 text-rose-700' }
    ]
  },
  {
    id: 'html-css',
    title: 'The HTML & CSS Odyssey',
    category: 'web',
    difficulty: 'Beginner',
    hours: '6–8 Hours',
    chapters: 16,
    xp: 1800,
    icon: '🌐',
    rating: '4.9',
    students: '18,200+',
    description: 'Build modern responsive web pages from scratch with semantic HTML5 and modern CSS techniques.',
    rewardTitle: 'Web Weaver',
    whatYouWillLearn: [
      'Semantic HTML5',
      'CSS Layouts (Flex & Grid)',
      'Responsive Design',
      'Accessibility Best Practices',
      'Styling Elements',
      'Building Web Pages'
    ],
    skillsUnlocked: [
      { name: 'HTML5', colorClass: 'bg-orange-50 border-orange-200 text-orange-700' },
      { name: 'CSS3', colorClass: 'bg-blue-50 border-blue-200 text-blue-700' },
      { name: 'UI Design', colorClass: 'bg-pink-50 border-pink-200 text-pink-700' },
      { name: 'Layouts', colorClass: 'bg-emerald-50 border-emerald-200 text-emerald-700' }
    ]
  },
  {
    id: 'javascript',
    title: 'JavaScript Realms',
    category: 'web',
    difficulty: 'Intermediate',
    hours: '10–12 Hours',
    chapters: 20,
    xp: 3200,
    icon: '⚡',
    rating: '4.8',
    students: '9,500+',
    description: 'Learn the language of the web, build interactive UI components, and connect to real-world APIs.',
    rewardTitle: 'JS Sorcerer',
    whatYouWillLearn: [
      'ES6+ Syntax',
      'DOM Manipulation',
      'Async/Await & Promises',
      'Event Handling',
      'Arrays & Objects',
      'API Fetching'
    ],
    skillsUnlocked: [
      { name: 'JavaScript', colorClass: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
      { name: 'DOM', colorClass: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
      { name: 'Async Logic', colorClass: 'bg-slate-50 border-slate-200 text-slate-700' }
    ]
  },
  {
    id: 'react',
    title: 'React & Frontend Mastery',
    category: 'web',
    difficulty: 'Intermediate',
    hours: '12–14 Hours',
    chapters: 14,
    xp: 3600,
    icon: '⚛️',
    rating: '4.9',
    students: '7,100+',
    description: 'Master modern frontend development using React, hooks, state management, and component architecture.',
    rewardTitle: 'React Architect',
    whatYouWillLearn: [
      'React Components',
      'JSX Syntax',
      'Hooks (useState, useEffect)',
      'Props & State',
      'Component Lifecycle',
      'React Router'
    ],
    skillsUnlocked: [
      { name: 'React', colorClass: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
      { name: 'Frontend', colorClass: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700' },
      { name: 'Components', colorClass: 'bg-lime-50 border-lime-200 text-lime-700' }
    ]
  },
  {
    id: 'sql',
    title: 'SQL & Data Vaults',
    category: 'programming',
    difficulty: 'Beginner',
    hours: '5–6 Hours',
    chapters: 10,
    xp: 1500,
    icon: '🗄️',
    rating: '4.7',
    students: '5,800+',
    description: 'Querying databases, relational models, joins, group by, and backend data design patterns.',
    rewardTitle: 'Data Miner',
  },
  {
    id: 'ai',
    title: 'AI & Prompt Engineering',
    category: 'ai',
    difficulty: 'Intermediate',
    hours: '8–10 Hours',
    chapters: 12,
    xp: 2800,
    icon: '🤖',
    rating: '4.9',
    students: '8,300+',
    description: 'Build generative AI apps, structured prompting, API workflows, and intelligent coding assistants.',
    rewardTitle: 'AI Whisperer',
  },
]

export const EXTENDED_LANGUAGES: CourseCatalogItem[] = [
  {
    id: 'rust',
    title: 'Rust Systems Mastery',
    category: 'programming',
    difficulty: 'Advanced',
    hours: '15–20 Hours',
    chapters: 22,
    xp: 4500,
    icon: '🦀',
    rating: '5.0',
    students: '1,200+',
    description: 'Learn memory safety, borrowing, lifetimes, and high-performance systems programming with Rust.',
    rewardTitle: 'Rustacean',
  },
  {
    id: 'go',
    title: 'Go Concurrency',
    category: 'programming',
    difficulty: 'Intermediate',
    hours: '10–12 Hours',
    chapters: 15,
    xp: 3200,
    icon: '🐹',
    rating: '4.8',
    students: '3,400+',
    description: 'Master goroutines, channels, and scalable backend services with Go.',
    rewardTitle: 'Go Gopher',
  },
  {
    id: 'cpp',
    title: 'C++ Game Engine',
    category: 'game',
    difficulty: 'Advanced',
    hours: '20–25 Hours',
    chapters: 25,
    xp: 5000,
    icon: '⚙️',
    rating: '4.7',
    students: '2,800+',
    description: 'Build a 2D game engine from scratch using modern C++, SDL2, and memory management.',
    rewardTitle: 'Engine Architect',
  },
  {
    id: 'ruby',
    title: 'Ruby on Rails',
    category: 'web',
    difficulty: 'Intermediate',
    hours: '12–15 Hours',
    chapters: 18,
    xp: 3500,
    icon: '💎',
    rating: '4.6',
    students: '4,100+',
    description: 'Rapid web development, MVC architecture, active record, and conventions over configuration.',
    rewardTitle: 'Ruby Artisan',
  },
]
