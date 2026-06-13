import { useCallback, useEffect } from 'react'
import { usePlayerStore } from '../store/playerStore'

type SendFn = (msg: Record<string, unknown>) => void

// Module-level singleton — survives the SessionLoading → ActiveSession navigation.
// A new WebSocket is only created when the old one is gone (null / CLOSED).
let _ws: WebSocket | null = null
let _hbInterval: ReturnType<typeof setInterval> | null = null

export function closePlayerWebSocket() {
  if (_hbInterval) { clearInterval(_hbInterval); _hbInterval = null }
  if (_ws) { _ws.close(1000); _ws = null }
}

export function usePlayerWebSocket(
  explicitWsUrl?: string,
  explicitToken?: string,
): SendFn {
  const { wsUrl: storeWsUrl, studentToken: storeToken, setPhase, handleServerMessage } =
    usePlayerStore()

  const wsUrl = explicitWsUrl ?? storeWsUrl
  const studentToken = explicitToken ?? storeToken

  const send = useCallback((msg: Record<string, unknown>) => {
    if (_ws?.readyState === WebSocket.OPEN) {
      _ws.send(JSON.stringify(msg))
    }
  }, [])

  useEffect(() => {
    if (!wsUrl || !studentToken) return

    // Reuse the existing connection if it's still alive
    if (_ws && (_ws.readyState === WebSocket.OPEN || _ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    const url = `${wsUrl}?token=${encodeURIComponent(studentToken)}`
    const ws = new WebSocket(url)
    _ws = ws

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data) as Record<string, unknown>
        handleServerMessage(msg)
      } catch {
        // non-JSON frame — ignore
      }
    }

    ws.onerror = () => {
      setPhase('error', 'Connection error. Please refresh and try again.')
      _ws = null
    }

    ws.onclose = (evt) => {
      if (evt.code !== 1000) {
        setPhase('error', 'Connection closed unexpectedly.')
      }
      _ws = null
    }

    _hbInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'heartbeat' }))
      }
    }, 25_000)

    // No cleanup closure — the socket intentionally outlives this component.
    // Call closePlayerWebSocket() explicitly to tear it down.
  }, [wsUrl, studentToken, setPhase, handleServerMessage])

  return send
}
