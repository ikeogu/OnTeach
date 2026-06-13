import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { nanoid } from 'nanoid'
import { sessionsApi, type BlockType } from '../../../api/sessions'
import { useEditorStore } from '../../../store/editorStore'
import { useAutosave } from '../../../hooks/useAutosave'
import BlockCard from './BlockCard'
import BlockSettings from './BlockSettings'

const PALETTE_ITEMS: { type: BlockType; label: string; description: string; icon: React.ReactNode }[] = [
  { type: 'spoken_text', label: 'Spoken Text', description: 'Narrate content directly to your students.', icon: <AvatarSm /> },
  { type: 'media_insert', label: 'Media Insert', description: 'Display images, charts, or brief clips.', icon: <MediaSm /> },
  { type: 'pause', label: 'Timed Pause', description: 'Insert a deliberate silence.', icon: <PauseSm /> },
  { type: 'action_button', label: 'Action Button', description: 'Add interactive prompts or links.', icon: <LinkSm /> },
]

export default function ScriptEditor() {
  const { id } = useParams<{ id: string }>()
  const sessionId = Number(id)
  const navigate = useNavigate()

  const { blocks, selectedId, saveStatus, setBlocks, addBlock, reorderBlocks } = useEditorStore()

  useAutosave(sessionId)

  // Load session and blocks
  const { data: session } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionsApi.get(sessionId),
    enabled: !!sessionId,
  })

  const { data: serverBlocks } = useQuery({
    queryKey: ['blocks', sessionId],
    queryFn: () => sessionsApi.getBlocks(sessionId),
    enabled: !!sessionId,
  })

  useEffect(() => {
    if (serverBlocks) {
      setBlocks(
        serverBlocks.map((b) => ({
          clientId: nanoid(),
          type: b.type,
          payload: b.payload,
          bookmark_label: b.bookmark_label,
        })),
      )
    }
  }, [serverBlocks, setBlocks])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.clientId === active.id)
      const newIndex = blocks.findIndex((b) => b.clientId === over.id)
      reorderBlocks(arrayMove(blocks, oldIndex, newIndex))
    }
  }

  const wordCount = blocks
    .filter((b) => b.type === 'spoken_text')
    .reduce((sum, b) => {
      const text = (b.payload as any).text ?? ''
      return sum + text.trim().split(/\s+/).filter(Boolean).length
    }, 0)

  const estimatedMinutes = Math.round((wordCount / 130) * 100) / 100
  const estDisplay = `${Math.floor(estimatedMinutes)}:${String(Math.round((estimatedMinutes % 1) * 60)).padStart(2, '0')}`

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left sidebar — palette */}
      <aside className="w-52 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Script Blocks</p>
        </div>
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          {PALETTE_ITEMS.map((item) => (
            <button
              key={item.type}
              onClick={() => addBlock(item.type)}
              className="w-full text-left flex items-start gap-2.5 p-2.5 rounded-xl border border-gray-200 hover:border-primary/50 hover:bg-primary-light transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center shrink-0 text-gray-400 group-hover:text-primary transition-colors">
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700 group-hover:text-primary">{item.label}</p>
                <p className="text-xs text-gray-400 leading-snug mt-0.5">{item.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="border-t border-gray-100 p-3 space-y-0.5">
          <NavItem icon={<DashSm />} label="Dashboard" onClick={() => navigate('/dashboard')} />
          <NavItem icon={<EditSm />} label="Editor" active />
          <NavItem icon={<MediaSm />} label="Media Library" onClick={() => {}} />
        </div>
      </aside>

      {/* Center — canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-13 border-b border-gray-200 flex items-center px-5 gap-3 shrink-0">
          <button onClick={() => navigate('/dashboard')} className="font-bold text-primary text-base hover:opacity-80">
            Onteach
          </button>
          <span className="text-gray-300">·</span>
          <span className="text-sm font-medium text-gray-700 truncate">{session?.name ?? '…'}</span>

          <div className="ml-auto flex items-center gap-3">
            <SaveIndicator status={saveStatus} />
            <button
              onClick={() => navigate(`/dashboard/sessions/${sessionId}/avatar-voice`)}
              className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              Continue →
            </button>
          </div>
        </header>

        {/* Canvas header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          <div>
            <p className="text-sm font-semibold text-gray-800">Script</p>
            <p className="text-xs text-gray-400">Compose your content script block by block.</p>
          </div>
          <div className="text-xs text-gray-400 space-x-3">
            <span>Words: <strong className="text-gray-600">{wordCount}</strong></span>
            <span>Est. Time: <strong className="text-gray-600">{estDisplay}</strong></span>
          </div>
        </div>

        {/* Block list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map((b) => b.clientId)} strategy={verticalListSortingStrategy}>
              {blocks.map((block, i) => (
                <BlockCard
                  key={block.clientId}
                  block={block}
                  index={i}
                  isSelected={selectedId === block.clientId}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add block button */}
          <button
            onClick={() => addBlock('spoken_text')}
            className="w-full border-2 border-dashed border-gray-200 hover:border-primary/40 text-gray-400 hover:text-primary rounded-xl py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" d="M8 3v10M3 8h10" />
            </svg>
            Add New Block
          </button>
        </div>
      </div>

      {/* Right sidebar — settings */}
      <aside className="w-60 border-l border-gray-200 bg-white flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Block Settings</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <BlockSettings />
        </div>

        {/* Script Assistant */}
        <div className="m-3 p-3 bg-primary-light rounded-xl border border-primary/20">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-primary text-sm">✦</span>
            <p className="text-xs font-bold text-primary">Script Assistant</p>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Try making the introduction more punchy to improve student retention.
          </p>
          <button className="text-xs font-semibold text-primary mt-2 hover:underline">
            Apply Suggestion
          </button>
        </div>
      </aside>
    </div>
  )
}

function SaveIndicator({ status }: { status: 'saved' | 'saving' | 'unsaved' }) {
  if (status === 'saving') return <span className="text-xs text-gray-400">Saving…</span>
  if (status === 'unsaved') return <span className="text-xs text-yellow-500">Unsaved</span>
  return (
    <span className="flex items-center gap-1 text-xs text-green-500">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
      </svg>
      Saved
    </span>
  )
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs transition-colors ${
        active ? 'bg-primary-light text-primary font-semibold' : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      {icon} {label}
    </button>
  )
}

function AvatarSm() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}><circle cx="8" cy="5.5" r="2.5"/><path strokeLinecap="round" d="M3 13c0-2.8 2.2-5 5-5s5 2.2 5 5"/></svg> }
function MediaSm() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}><rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/><circle cx="5" cy="7" r="1"/><path strokeLinecap="round" d="M1.5 11 5 7.5l2.5 2.5 2-2 3.5 3"/></svg> }
function PauseSm() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}><circle cx="8" cy="8" r="6"/><path strokeLinecap="round" d="M6.5 5.5v5M9.5 5.5v5"/></svg> }
function LinkSm() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1"/><path strokeLinecap="round" d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1"/></svg> }
function DashSm() { return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={1.5}><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg> }
function EditSm() { return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 2.5l2 2-7 7H2.5v-2l7-7Z"/></svg> }
