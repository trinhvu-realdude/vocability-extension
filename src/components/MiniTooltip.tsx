import { C } from "~src/utilities"
import vocabilityLogo from "data-base64:~assets/vocability.svg"


interface TooltipProps {
    x: number
    y: number
    word: string
    visible: boolean
    onDefine: () => void
}

function MiniTooltip({ x, y, word, visible, onDefine }: TooltipProps) {
    return (
        <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
                position: "fixed",
                left: x,
                top: y + 8,
                transform: visible ? "translate(-50%, 0) scale(1)" : "translate(-50%, -6px) scale(0.96)",
                zIndex: 2147483647,
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? "auto" : "none",
                transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}>
            {word && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            onDefine()
                        }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 12px",
                            background: "linear-gradient(135deg, #ffffff, #fcfcfc)",
                            border: `1px solid ${C.borderLight}`,
                            borderRadius: 20,
                            color: C.text,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(221,87,70,0.15)",
                            whiteSpace: "nowrap",
                            letterSpacing: "0.2px",
                            transition: "all 0.15s"
                        }}>
                        <img
                            src={vocabilityLogo}
                            alt="Vocability Logo"
                            style={{
                                width: 24,
                                height: 24,
                                display: "block"
                            }}
                        />
                        Define &quot;{word.length > 20 ? word.slice(0, 20) + "…" : word}&quot;
                    </button>
                </>
            )}
        </div>
    )
}

export default MiniTooltip

