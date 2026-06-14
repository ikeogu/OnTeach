import { create } from 'zustand'
import { nanoid } from 'nanoid'

export type PlayerPhase =
  | 'idle'
  | 'joining'
  | 'connecting'
  | 'ready'
  | 'active'
  | 'complete'
  | 'error'

export interface QAMessage {
  id: string
  role: 'student' | 'avatar'
  text: string
  timestamp: string
}

export interface Bookmark {
  block_id: number
  label: string
}

interface PlayerState {
  // Pre-join (loaded from public session API)
  shareSlug: string | null
  sessionName: string
  creatorName: string
  coverImageUrl: string | null
  studentName: string

  // After join (from Laravel)
  sessionInstanceId: string | null
  livekitUrl: string | null
  livekitToken: string | null
  roomName: string | null

  // Phase
  phase: PlayerPhase
  errorMessage: string | null

  // Block progress
  currentBlockId: number | null
  currentBlockIndex: number
  totalBlocks: number
  sectionLabel: string | null
  chapterIndex: number
  totalChapters: number

  // Avatar state
  avatarSpeaking: boolean

  // Q&A
  qaOpen: boolean
  qaMessages: QAMessage[]
  qaStreaming: boolean
  qaStreamingText: string

  // Bookmarks / skip-to-section
  bookmarks: Bookmark[]
  skipMenuOpen: boolean

  // Overlays
  isPaused: boolean
  mediaOverlay: { url: string; mediaType: string; displayDuration: number } | null
  actionOverlay: { label: string; actionType: string; target: string } | null

  // Actions
  setShareSlug: (slug: string) => void
  setPublicSession: (name: string, creatorName: string, coverImageUrl: string | null) => void
  setStudentName: (name: string) => void
  setJoinResult: (r: { sessionInstanceId: string; livekitUrl: string; livekitToken: string; roomName: string }) => void
  setPhase: (phase: PlayerPhase, error?: string) => void
  handleServerMessage: (msg: Record<string, unknown>) => void
  submitQuestion: (text: string) => void
  closeQA: () => void
  openSkipMenu: () => void
  closeSkipMenu: () => void
  setPaused: (v: boolean) => void
  dismissMediaOverlay: () => void
  dismissActionOverlay: () => void
  reset: () => void
}

const ts = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const initial = {
  shareSlug: null,
  sessionName: '',
  creatorName: '',
  coverImageUrl: null,
  studentName: '',
  sessionInstanceId: null,
  livekitUrl: null,
  livekitToken: null,
  roomName: null,
  phase: 'idle' as PlayerPhase,
  errorMessage: null,
  currentBlockId: null,
  currentBlockIndex: 0,
  totalBlocks: 0,
  sectionLabel: null,
  chapterIndex: 0,
  totalChapters: 0,
  avatarSpeaking: false,
  qaOpen: false,
  qaMessages: [] as QAMessage[],
  qaStreaming: false,
  qaStreamingText: '',
  bookmarks: [] as Bookmark[],
  skipMenuOpen: false,
  isPaused: false,
  mediaOverlay: null,
  actionOverlay: null,
}

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  ...initial,

  setShareSlug: (slug) => set({ shareSlug: slug }),

  setPublicSession: (name, creatorName, coverImageUrl) =>
    set({ sessionName: name, creatorName, coverImageUrl }),

  setStudentName: (name) => set({ studentName: name }),

  setJoinResult: ({ sessionInstanceId, livekitUrl, livekitToken, roomName }) =>
    set({ sessionInstanceId, livekitUrl, livekitToken, roomName }),

  setPhase: (phase, error) => set({ phase, errorMessage: error ?? null }),

  handleServerMessage: (msg) => {
    const t = msg.type as string

    if (t === 'session_ready') {
      set({
        phase: 'active',
        sessionName: (msg.session_name as string) || get().sessionName,
        bookmarks: (msg.bookmarks as Bookmark[]) || [],
        totalChapters: ((msg.bookmarks as Bookmark[]) || []).length,
      })
    } else if (t === 'block_started') {
      set({
        currentBlockId: msg.block_id as number,
        currentBlockIndex: msg.index as number,
        totalBlocks: msg.total as number,
        sectionLabel: (msg.section_label as string) || null,
        chapterIndex: (msg.chapter_index as number) ?? 0,
        totalChapters: (msg.total_chapters as number) ?? get().totalChapters,
        mediaOverlay: null,
        actionOverlay: null,
      })
    } else if (t === 'avatar_speaking') {
      set({ avatarSpeaking: msg.state === 'start' })
    } else if (t === 'hand_raised') {
      set({ qaOpen: true })
    } else if (t === 'qa_answer_chunk') {
      set((s) => ({
        qaStreaming: true,
        qaStreamingText: s.qaStreamingText + (msg.text as string),
      }))
    } else if (t === 'qa_answer_done') {
      const { qaStreamingText } = get()
      set((s) => ({
        qaStreaming: false,
        qaStreamingText: '',
        qaMessages: [
          ...s.qaMessages,
          { id: nanoid(), role: 'avatar', text: qaStreamingText, timestamp: ts() },
        ],
      }))
    } else if (t === 'show_media') {
      set({
        mediaOverlay: {
          url: msg.url as string,
          mediaType: msg.media_type as string,
          displayDuration: msg.display_duration as number,
        },
      })
    } else if (t === 'show_action') {
      set({
        actionOverlay: {
          label: msg.label as string,
          actionType: msg.action_type as string,
          target: msg.target as string,
        },
      })
    } else if (t === 'resume') {
      set({ avatarSpeaking: false, skipMenuOpen: false })
    } else if (t === 'session_complete') {
      set({ phase: 'complete', avatarSpeaking: false })
    } else if (t === 'error') {
      set({ phase: 'error', errorMessage: msg.message as string })
    }
  },

  submitQuestion: (text) =>
    set((s) => ({
      qaMessages: [
        ...s.qaMessages,
        { id: nanoid(), role: 'student', text, timestamp: ts() },
      ],
    })),

  closeQA: () => set({ qaOpen: false }),
  openSkipMenu: () => set({ skipMenuOpen: true }),
  closeSkipMenu: () => set({ skipMenuOpen: false }),
  setPaused: (v) => set({ isPaused: v }),
  dismissMediaOverlay: () => set({ mediaOverlay: null }),
  dismissActionOverlay: () => set({ actionOverlay: null }),
  reset: () => set(initial),
}))
