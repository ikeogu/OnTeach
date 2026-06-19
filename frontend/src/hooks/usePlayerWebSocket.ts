/**
 * LiveKit-based replacement for the old WebSocket hook.
 *
 * The agent publishes control messages (block_started, show_media, etc.)
 * via LiveKit data channels. We subscribe here and forward them to the
 * player store exactly as before, so the rest of the UI is unchanged.
 *
 * "closePlayerWebSocket" is kept for API compatibility but just disconnects
 * the LiveKit room.
 */
import { useCallback, useEffect, useRef } from 'react'
import { DisconnectReason, Room, RoomEvent } from 'livekit-client'
import { usePlayerStore } from '../store/playerStore'

type SendFn = (msg: Record<string, unknown>) => void

// Module-level room singleton — survives navigation between loading → active.
let _room: Room | null = null

export function closePlayerWebSocket() {
  if (_room) {
    _room.disconnect()
    _room = null
  }
}

export function getPlayerRoom(): Room | null {
  return _room
}

export function usePlayerWebSocket(
  explicitLkUrl?: string,
  explicitToken?: string,
): SendFn {
  const {
    livekitUrl: storeLkUrl,
    livekitToken: storeToken,
    setPhase,
    handleServerMessage,
  } = usePlayerStore()

  const lkUrl   = explicitLkUrl ?? storeLkUrl
  const lkToken = explicitToken  ?? storeToken

  const connectedRef = useRef(false)

  const send = useCallback((msg: Record<string, unknown>) => {
    if (_room?.state === 'connected') {
      const bytes = new TextEncoder().encode(JSON.stringify(msg))
      _room.localParticipant.publishData(bytes, { reliable: true })
    }
  }, [])

  useEffect(() => {
    if (!lkUrl || !lkToken) return
    if (_room !== null || connectedRef.current) return

    const room = new Room()
    _room = room
    connectedRef.current = true

    room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload)) as Record<string, unknown>
        handleServerMessage(msg)
      } catch {
        // ignore non-JSON
      }
    })

    room.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
      connectedRef.current = false
      _room = null
      const label = reason !== undefined ? ` (code ${reason}: ${DisconnectReason[reason] ?? reason})` : ''
      setPhase('error', `Connection closed unexpectedly.${label}`)
    })

    room.connect(lkUrl, lkToken).catch((err: unknown) => {
      connectedRef.current = false
      _room = null
      const msg = err instanceof Error ? err.message : 'unknown error'
      setPhase('error', `Failed to connect: ${msg}`)
    })

    // No cleanup — room intentionally outlives the component.
    // Call closePlayerWebSocket() explicitly to disconnect.
  }, [lkUrl, lkToken, setPhase, handleServerMessage])

  return send
}
