// Lumi AI Service - Supports Gemini & OpenAI models with automatic model selection
// Provides ultra-concise, token-efficient, and accurate mentoring for students.

export interface LumiChatMessage {
  role: 'user' | 'lumi'
  text: string
  time?: string
}

export type LumiProvider = 'gemini' | 'openai' | 'none'

export interface LumiConfig {
  provider: LumiProvider
  geminiKey: string
  openaiKey: string
  activeModelName: string
}

export const LUMI_SYSTEM_PROMPT = `You are Lumi 🤖, the personal pixel-art AI mentor for students on "Code of Olympus" (gamified coding platform).

CRITICAL CONSTRAINTS:
1. ULTRA-CONCISE RESPONSES: Keep every response as small and direct as possible (1 to 3 short sentences, or a tiny code snippet). Save tokens and student time. NO pleasantries, NO intro fluff ("Hello! Sure, I can help!"), NO outro fluff ("Let me know if you need anything else!").
2. PROGRAMMING HELP: Answer student questions on Python, JavaScript, React, HTML/CSS, SQL, algorithms, and debugging with maximum accuracy and brevity.
3. PLATFORM FLOW & NAVIGATION: Know every part of Code of Olympus:
   - Dashboard: Daily streak, XP, learner rank, recent quest resume button.
   - Learn: Core interactive courses (Python Adventure, Web Development, JavaScript, React, Data Structures). Structure: Course -> Chapter -> Lesson -> Exercise -> Quest IDE with live code evaluation.
   - Practice: The Crucible Arena with coding challenges (Reverse String, Palindrome, FizzBuzz, Two Sum, etc.), automated test runners, and XP rewards.
   - Build: Projects Studio & Dwarven Forge. Guided Projects (step-by-step builds like Portfolio, RPG Battle, Weather App) and freeform Project IDE.
   - Arcade: Multiplayer coding games, speed challenges, and team leaderboards.
   - Community: Student project showcases, discussion feed, and dev blogs.
   - Theme: Theme Studio to toggle mythic themes (God of War Dark Olympus, Nordic Mist, Cyberpunk, Pixel Art).
   - Settings: Profile, avatar selection, stats and account settings.
4. PLATFORM LOCATOR: When students ask where to find an option, course, or project, tell them the exact tab and navigation clicks.
5. SMART SUGGESTIONS & NEXT STEPS: When students ask what to do next or state what they completed, suggest the concrete next step:
   - Completed Python basics -> Suggest "Loops & Logic" in Learn or "Reverse String" in Practice (Crucible).
   - Completed HTML/CSS -> Suggest JavaScript in Learn or building a Portfolio in Build tab.
   - Finished a course -> Suggest building a Guided Project in Build or competing in Arcade/Crucible.
6. TONE: Punchy, helpful, energetic pixel-bot 🤖.`

export function getLumiConfig(): LumiConfig {
  const geminiKey = (
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.GEMINI_API_KEY ||
    ''
  ).trim()

  const openaiKey = (
    (import.meta as any).env?.VITE_OPENAI_API_KEY ||
    (import.meta as any).env?.OPENAI_API_KEY ||
    ''
  ).trim()

  if (geminiKey) {
    return {
      provider: 'gemini',
      geminiKey,
      openaiKey,
      activeModelName: 'Gemini 1.5 Flash',
    }
  }

  if (openaiKey) {
    return {
      provider: 'openai',
      geminiKey,
      openaiKey,
      activeModelName: 'GPT-4o Mini',
    }
  }

  return {
    provider: 'none',
    geminiKey: '',
    openaiKey: '',
    activeModelName: 'No API Key Configured',
  }
}

async function callGemini(apiKey: string, history: LumiChatMessage[], userText: string): Promise<string> {
  const recentHistory = history.slice(-6)
  const rawContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []

  for (const msg of recentHistory) {
    rawContents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    })
  }

  if (
    rawContents.length === 0 ||
    rawContents[rawContents.length - 1].role !== 'user' ||
    rawContents[rawContents.length - 1].parts[0].text !== userText
  ) {
    rawContents.push({
      role: 'user',
      parts: [{ text: userText }],
    })
  }

  // Ensure alternating roles starting with 'user'
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []
  for (const item of rawContents) {
    if (contents.length === 0 && item.role !== 'user') {
      continue
    }
    const last = contents[contents.length - 1]
    if (last && last.role === item.role) {
      last.parts[0].text += `\n${item.parts[0].text}`
    } else {
      contents.push({ role: item.role, parts: [{ text: item.parts[0].text }] })
    }
  }

  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash']
  let lastError: Error | null = null

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: LUMI_SYSTEM_PROMPT }],
            },
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 250,
            },
          }),
        }
      )

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}))
        const message = errJson?.error?.message || `Gemini HTTP ${response.status}`
        throw new Error(message)
      }

      const data = await response.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        return text.trim()
      }
    } catch (err: any) {
      lastError = err
    }
  }

  throw lastError || new Error('Gemini could not generate a response.')
}

async function callOpenAI(apiKey: string, history: LumiChatMessage[], userText: string): Promise<string> {
  const recentHistory = history.slice(-6)
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: LUMI_SYSTEM_PROMPT },
  ]

  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })
  }

  if (
    messages[messages.length - 1].role !== 'user' ||
    messages[messages.length - 1].content !== userText
  ) {
    messages.push({ role: 'user', content: userText })
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_tokens: 250,
    }),
  })

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}))
    const message = errJson?.error?.message || `OpenAI HTTP ${response.status}`
    throw new Error(message)
  }

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content
  if (text) {
    return text.trim()
  }

  throw new Error('OpenAI could not generate a response.')
}

export async function askLumi(
  userText: string,
  history: LumiChatMessage[] = []
): Promise<{ text: string; provider: LumiProvider; modelName: string }> {
  const config = getLumiConfig()

  if (config.provider === 'none') {
    return {
      text: "🤖 API key not set in `.env`! Add `VITE_GEMINI_API_KEY` or `VITE_OPENAI_API_KEY` to enable live responses.\n\nQuick navigation: Visit **Learn** for courses, **Practice** for The Crucible challenges, or **Build** for projects.",
      provider: 'none',
      modelName: 'None',
    }
  }

  if (config.provider === 'gemini') {
    try {
      const reply = await callGemini(config.geminiKey, history, userText)
      return { text: reply, provider: 'gemini', modelName: 'Gemini 1.5 Flash' }
    } catch (geminiErr: any) {
      if (config.openaiKey) {
        try {
          const fallbackReply = await callOpenAI(config.openaiKey, history, userText)
          return { text: fallbackReply, provider: 'openai', modelName: 'GPT-4o Mini (Fallback)' }
        } catch {
          // Fall through to report Gemini error
        }
      }
      return {
        text: `🤖 Gemini Error: ${geminiErr?.message || 'Unable to connect'}. Check your API key or network.`,
        provider: 'gemini',
        modelName: 'Gemini 1.5 Flash',
      }
    }
  }

  if (config.provider === 'openai') {
    try {
      const reply = await callOpenAI(config.openaiKey, history, userText)
      return { text: reply, provider: 'openai', modelName: 'GPT-4o Mini' }
    } catch (openaiErr: any) {
      if (config.geminiKey) {
        try {
          const fallbackReply = await callGemini(config.geminiKey, history, userText)
          return { text: fallbackReply, provider: 'gemini', modelName: 'Gemini 1.5 Flash (Fallback)' }
        } catch {
          // Fall through
        }
      }
      return {
        text: `🤖 OpenAI Error: ${openaiErr?.message || 'Unable to connect'}. Check your API key or network.`,
        provider: 'openai',
        modelName: 'GPT-4o Mini',
      }
    }
  }

  return {
    text: "🤖 No AI model available.",
    provider: 'none',
    modelName: 'None',
  }
}
