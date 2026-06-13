import { useEditorStore } from '../../../store/editorStore'
import type { SpokenTextPayload } from '../../../api/sessions'

export default function BlockSettings() {
  const { blocks, selectedId, updateBlock } = useEditorStore()
  const block = blocks.find((b) => b.clientId === selectedId)

  if (!block) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <p className="text-xs text-gray-400 text-center">Select a block to edit its settings</p>
      </div>
    )
  }

  if (block.type === 'spoken_text') {
    const payload = block.payload as SpokenTextPayload

    return (
      <div className="p-4 space-y-5">
        {/* Reading speed */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">Reading Speed</span>
            <span className="text-xs font-bold text-primary">{payload.reading_speed.toFixed(1)}x</span>
          </div>
          <input
            type="range" min={0.5} max={1.5} step={0.1}
            value={payload.reading_speed}
            onChange={(e) => updateBlock(block.clientId, { payload: { ...payload, reading_speed: +e.target.value } })}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>SLOW</span><span>NORMAL</span><span>FAST</span>
          </div>
        </div>

        {/* Voice emphasis */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">Voice Emphasis</label>
          <select
            value={payload.voice_emphasis}
            onChange={(e) => updateBlock(block.clientId, { payload: { ...payload, voice_emphasis: e.target.value as SpokenTextPayload['voice_emphasis'] } })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white"
          >
            <option value="neutral">Neutral / Informative</option>
            <option value="warm">Warm / Encouraging</option>
            <option value="energetic">Energetic / Engaging</option>
          </select>
        </div>

        {/* Auto-pause */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-700">Auto-Pause After</p>
            <p className="text-xs text-gray-400 mt-0.5">Add brief silence post-block</p>
          </div>
          <button
            onClick={() => updateBlock(block.clientId, { payload: { ...payload, auto_pause_after: !payload.auto_pause_after } })}
            className={`w-10 h-5.5 rounded-full transition-colors shrink-0 relative mt-0.5 ${
              payload.auto_pause_after ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              payload.auto_pause_after ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {/* Bookmark */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Section Bookmark</label>
          <input
            value={block.bookmark_label ?? ''}
            onChange={(e) => updateBlock(block.clientId, { bookmark_label: e.target.value || null })}
            placeholder="e.g. Introduction"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <p className="text-xs text-gray-400 mt-1">Students can skip to this section.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <p className="text-xs text-gray-400">No additional settings for this block type.</p>
    </div>
  )
}
