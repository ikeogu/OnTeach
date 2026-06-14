import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DraftBlock, SpokenTextPayload, MediaInsertPayload, ActionButtonPayload, PausePayload } from '../../../api/sessions'
import { sessionsApi } from '../../../api/sessions'
import { useEditorStore } from '../../../store/editorStore'

interface Props {
  block: DraftBlock
  index: number
  isSelected: boolean
}

const BLOCK_LABELS: Record<string, string> = {
  spoken_text: 'Spoken Text',
  media_insert: 'Media Insert',
  action_button: 'Action Button',
  pause: 'Timed Pause',
}

const BLOCK_ICONS: Record<string, React.ReactNode> = {
  spoken_text: <AvatarIcon />,
  media_insert: <MediaIcon />,
  action_button: <LinkIcon />,
  pause: <PauseIcon />,
}

export default function BlockCard({ block, index, isSelected }: Props) {
  const { selectBlock, deleteBlock, addBlock } = useEditorStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.clientId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-3 group`}
      onClick={() => selectBlock(block.clientId)}
    >
      {/* Avatar icon column */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-1 ${
        isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
      }`}>
        {BLOCK_ICONS[block.type]}
      </div>

      {/* Card */}
      <div className={`flex-1 border-2 rounded-xl overflow-hidden transition-colors ${
        isSelected ? 'border-primary' : 'border-gray-200 hover:border-gray-300'
      }`}>
        {/* Card header */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400"
              onClick={(e) => e.stopPropagation()}
            >
              <DragIcon />
            </button>
            <span className="text-xs font-semibold text-gray-600">{BLOCK_LABELS[block.type]}</span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); const b = { ...block }; addBlock(b.type, index) }}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Duplicate"
            >
              <CopyIcon />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteBlock(block.clientId) }}
              className="p-1 text-gray-400 hover:text-red-500"
              title="Delete"
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        {/* Card body */}
        <div className="p-3">
          {block.type === 'spoken_text' && (
            <SpokenTextBody block={block} payload={block.payload as SpokenTextPayload} />
          )}
          {block.type === 'media_insert' && (
            <MediaInsertBody block={block} payload={block.payload as MediaInsertPayload} />
          )}
          {block.type === 'action_button' && (
            <ActionButtonBody block={block} payload={block.payload as ActionButtonPayload} />
          )}
          {block.type === 'pause' && (
            <PauseBody block={block} payload={block.payload as PausePayload} />
          )}

          {/* Quick-insert row */}
          {block.type === 'spoken_text' && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <QuickInsert label="Insert Media" icon={<MediaIcon />} onClick={() => addBlock('media_insert', index)} />
              <QuickInsert label="Insert Link Button" icon={<LinkIcon />} onClick={() => addBlock('action_button', index)} />
              <QuickInsert label="Insert Bookmark" icon={<BookmarkIcon />} onClick={() => {
                useEditorStore.getState().updateBlock(block.clientId, { bookmark_label: 'Section' })
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SpokenTextBody({ block, payload }: { block: DraftBlock; payload: SpokenTextPayload }) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  return (
    <textarea
      value={payload.text}
      onChange={(e) => updateBlock(block.clientId, { payload: { ...payload, text: e.target.value } })}
      onClick={(e) => e.stopPropagation()}
      placeholder="Type what the avatar will say…"
      rows={3}
      className="w-full text-sm text-gray-700 resize-none outline-none bg-transparent placeholder-gray-300 leading-relaxed"
    />
  )
}

function MediaInsertBody({ block, payload }: { block: DraftBlock; payload: MediaInsertPayload }) {
  const updateBlock = useEditorStore((s) => s.updateBlock)
  const { id } = useParams<{ id: string }>()
  const sessionId = Number(id)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !sessionId) return
    setUploading(true)
    try {
      const { url } = await sessionsApi.uploadMedia(sessionId, file)
      updateBlock(block.clientId, { payload: { ...payload, url } })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <span className="text-xs font-semibold text-gray-400 uppercase shrink-0">
          {payload.media_type?.toUpperCase() ?? 'IMAGE'}
        </span>
        <input
          value={payload.url}
          onChange={(e) => updateBlock(block.clientId, { payload: { ...payload, url: e.target.value } })}
          onClick={(e) => e.stopPropagation()}
          placeholder="Paste URL…"
          className="flex-1 text-sm text-gray-600 bg-transparent outline-none min-w-0"
        />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}
          disabled={uploading}
          className="shrink-0 flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          )}
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {payload.url && (
        <div className="rounded-lg overflow-hidden border border-gray-200 max-h-32">
          <img src={payload.url} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Display duration</span>
          <span className="text-xs text-primary font-medium">{payload.display_duration}s</span>
        </div>
        <input
          type="range" min={5} max={60} value={payload.display_duration}
          onChange={(e) => updateBlock(block.clientId, { payload: { ...payload, display_duration: +e.target.value } })}
          onClick={(e) => e.stopPropagation()}
          className="w-full accent-primary"
        />
      </div>
    </div>
  )
}

function ActionButtonBody({ block, payload }: { block: DraftBlock; payload: ActionButtonPayload }) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  return (
    <div className="space-y-2">
      <input
        value={payload.label}
        onChange={(e) => updateBlock(block.clientId, { payload: { ...payload, label: e.target.value } })}
        onClick={(e) => e.stopPropagation()}
        placeholder="Button label…"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <input
        value={payload.target}
        onChange={(e) => updateBlock(block.clientId, { payload: { ...payload, target: e.target.value } })}
        onClick={(e) => e.stopPropagation()}
        placeholder="https://…"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </div>
  )
}

function PauseBody({ block, payload }: { block: DraftBlock; payload: PausePayload }) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">Silence duration</span>
        <span className="text-xs text-primary font-medium">{payload.duration_seconds}s</span>
      </div>
      <input
        type="range" min={1} max={10} value={payload.duration_seconds}
        onChange={(e) => updateBlock(block.clientId, { payload: { duration_seconds: +e.target.value } })}
        onClick={(e) => e.stopPropagation()}
        className="w-full accent-primary"
      />
    </div>
  )
}

function QuickInsert({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary border border-gray-200 hover:border-primary/40 rounded-lg px-2.5 py-1.5 transition-colors"
    >
      <span className="w-3.5 h-3.5">{icon}</span>
      {label}
    </button>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────
function DragIcon() {
  return <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="currentColor"><circle cx="4.5" cy="3" r="1"/><circle cx="4.5" cy="7" r="1"/><circle cx="4.5" cy="11" r="1"/><circle cx="9.5" cy="3" r="1"/><circle cx="9.5" cy="7" r="1"/><circle cx="9.5" cy="11" r="1"/></svg>
}
function AvatarIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}><circle cx="8" cy="5.5" r="2.5"/><path strokeLinecap="round" d="M3 13c0-2.8 2.2-5 5-5s5 2.2 5 5"/></svg>
}
function MediaIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}><rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/><circle cx="5" cy="7" r="1"/><path strokeLinecap="round" strokeLinejoin="round" d="M1.5 11 5 7.5l2.5 2.5 2-2 3.5 3"/></svg>
}
function LinkIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5l-1 1"/><path strokeLinecap="round" d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5l1-1"/></svg>
}
function PauseIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.5}><circle cx="8" cy="8" r="6"/><path strokeLinecap="round" d="M6.5 5.5v5M9.5 5.5v5"/></svg>
}
function CopyIcon() {
  return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={1.5}><rect x="4" y="4" width="8" height="8" rx="1"/><path strokeLinecap="round" d="M10 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1"/></svg>
}
function TrashIcon() {
  return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" d="M2 4h10M5 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M11 4l-.8 7.2a1 1 0 0 1-1 .8H4.8a1 1 0 0 1-1-.8L3 4"/></svg>
}
function BookmarkIcon() {
  return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 2h8a1 1 0 0 1 1 1v9l-5-3-5 3V3a1 1 0 0 1 1-1Z"/></svg>
}
