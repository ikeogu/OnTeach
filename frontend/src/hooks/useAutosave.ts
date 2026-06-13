import { useEffect, useRef } from 'react'
import { useEditorStore } from '../store/editorStore'
import { sessionsApi } from '../api/sessions'

const DEBOUNCE_MS = 1500

export function useAutosave(sessionId: number) {
  const { blocks, saveStatus, setSaveStatus } = useEditorStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevBlocksRef = useRef(blocks)

  useEffect(() => {
    if (saveStatus !== 'unsaved') return
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        await sessionsApi.replaceBlocks(
          sessionId,
          blocks.map(({ clientId: _id, ...rest }) => rest),
        )
        setSaveStatus('saved')
        prevBlocksRef.current = blocks
      } catch {
        setSaveStatus('unsaved')
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [blocks, saveStatus, sessionId, setSaveStatus])
}
