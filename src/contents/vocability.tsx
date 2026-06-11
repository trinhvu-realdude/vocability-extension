import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useEffect, useRef, useState } from "react"

import WordPanel from "~src/components/WordPanel"
import MiniTooltip from "~src/components/MiniTooltip"
import Toast from "~src/components/Toast"


// ─── Plasmo content script config ────────────────────────────────────────────

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// ─── Animation & global styles (injected into shadow DOM) ────────────────────

const STYLES = `
  @keyframes voc-slide-in {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
  @keyframes voc-fade-up {
    from { opacity: 0; transform: translate(-50%, 4px); }
    to   { opacity: 1; transform: translate(-50%, 0);   }
  }
  @keyframes voc-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes voc-pop-in {
    0%   { opacity: 0; transform: scale(0.85); }
    100% { opacity: 1; transform: scale(1); }
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: "Courier New", Courier, monospace;
    -webkit-font-smoothing: antialiased;
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: rgba(0,0,0,0.02); }
  ::-webkit-scrollbar-thumb { background: rgba(221,87,70,0.4); border-radius: 999px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(221,87,70,0.7); }
`

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = STYLES
  return style
}

function VocabilityApp() {
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    word: string
  }>({ visible: false, x: 0, y: 0, word: "" })

  const [panelWord, setPanelWord] = useState<string | null>(null)
  const capturedWordRef = useRef("")
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const handleToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    // ── Text selection → show mini tooltip ───────────────────────────────────
    const onMouseUp = (e: MouseEvent) => {
      // Brief delay so the selection is finalised
      setTimeout(() => {
        const sel = window.getSelection()
        const text = sel?.toString().trim() ?? ""
        const wordCount = text.split(/\s+/).filter(Boolean).length

        if (text && wordCount >= 1 && wordCount <= 5) {
          capturedWordRef.current = text
          try {
            const range = sel!.getRangeAt(0)
            const rect = range.getBoundingClientRect()
            setTooltip({
              visible: true,
              x: rect.left + rect.width / 2,
              y: rect.bottom,
              word: text
            })
          } catch {
            setTooltip((t) => ({ ...t, visible: false }))
          }
        } else {
          setTooltip((t) => ({ ...t, visible: false }))
        }
      }, 10)
    }

    // ── Selection cleared → hide tooltip ─────────────────────────────────────
    const onSelectionChange = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed) {
        setTooltip((t) => ({ ...t, visible: false }))
      }
    }

    // ── Context menu word from background ────────────────────────────────────
    const onMessage = (msg: any) => {
      if (msg?.type === "CONTEXT_MENU_WORD" && msg.word) {
        setTooltip((t) => ({ ...t, visible: false }))
        setPanelWord(msg.word.trim())
      }
    }

    document.addEventListener("mouseup", onMouseUp)
    document.addEventListener("selectionchange", onSelectionChange)
    chrome.runtime.onMessage.addListener(onMessage)

    return () => {
      document.removeEventListener("mouseup", onMouseUp)
      document.removeEventListener("selectionchange", onSelectionChange)
      chrome.runtime.onMessage.removeListener(onMessage)
    }
  }, [])

  const openPanel = (word: string) => {
    setPanelWord(word)
    setTooltip((t) => ({ ...t, visible: false }))
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      overflow: "visible",
      zIndex: 2147483647,
      pointerEvents: "none"
    }}>
      {tooltip.visible && (
        <MiniTooltip
          x={tooltip.x}
          y={tooltip.y}
          word={tooltip.word}
          visible={tooltip.visible}
          onDefine={() => openPanel(tooltip.word)}
        />
      )}
      {panelWord && (
        <WordPanel
          word={panelWord}
          onClose={() => setPanelWord(null)}
          onToast={handleToast}
        />
      )}
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  )
}

export default VocabilityApp
