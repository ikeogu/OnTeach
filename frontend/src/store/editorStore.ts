import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { DraftBlock, BlockType, BlockPayload } from '../api/sessions'

interface EditorState {
  blocks: DraftBlock[]
  selectedId: string | null
  saveStatus: 'saved' | 'saving' | 'unsaved'

  setBlocks: (blocks: DraftBlock[]) => void
  addBlock: (type: BlockType, atIndex?: number) => void
  updateBlock: (clientId: string, patch: Partial<Omit<DraftBlock, 'clientId'>>) => void
  deleteBlock: (clientId: string) => void
  reorderBlocks: (blocks: DraftBlock[]) => void
  selectBlock: (clientId: string | null) => void
  setSaveStatus: (status: EditorState['saveStatus']) => void
}

const defaultPayload = (type: BlockType): BlockPayload => {
  switch (type) {
    case 'spoken_text':
      return { text: '', reading_speed: 1.0, voice_emphasis: 'neutral', auto_pause_after: true }
    case 'media_insert':
      return { url: '', media_type: 'image', display_duration: 20, spoken_text: '' }
    case 'action_button':
      return { label: '', action_type: 'link', target: '' }
    case 'pause':
      return { duration_seconds: 2 }
  }
}

export const useEditorStore = create<EditorState>((set) => ({
  blocks: [],
  selectedId: null,
  saveStatus: 'saved',

  setBlocks: (blocks) => set({ blocks }),

  addBlock: (type, atIndex) =>
    set((s) => {
      const block: DraftBlock = { clientId: nanoid(), type, payload: defaultPayload(type), bookmark_label: null }
      const blocks = [...s.blocks]
      const idx = atIndex !== undefined ? atIndex + 1 : blocks.length
      blocks.splice(idx, 0, block)
      return { blocks, selectedId: block.clientId, saveStatus: 'unsaved' }
    }),

  updateBlock: (clientId, patch) =>
    set((s) => ({
      blocks: s.blocks.map((b) => (b.clientId === clientId ? { ...b, ...patch } : b)),
      saveStatus: 'unsaved',
    })),

  deleteBlock: (clientId) =>
    set((s) => ({
      blocks: s.blocks.filter((b) => b.clientId !== clientId),
      selectedId: s.selectedId === clientId ? null : s.selectedId,
      saveStatus: 'unsaved',
    })),

  reorderBlocks: (blocks) => set({ blocks, saveStatus: 'unsaved' }),

  selectBlock: (clientId) => set({ selectedId: clientId }),

  setSaveStatus: (saveStatus) => set({ saveStatus }),
}))
