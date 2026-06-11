import { C } from "~src/utilities";

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
    return (
        <div style={{
            position: "fixed",
            top: 32,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2147483647,
            pointerEvents: "none",
            display: "flex",
            justifyContent: "center",
        }}>
            <div style={{
                padding: "12px 20px",
                background: ok ? "rgba(16, 185, 129, 0.85)" : "rgba(239, 68, 68, 0.85)",
                border: `1px solid ${ok ? "rgba(52, 211, 153, 0.4)" : "rgba(248, 113, 113, 0.4)"}`,
                borderRadius: 12,
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 600,
                whiteSpace: "nowrap",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                animation: "voc-pop-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                backdropFilter: "blur(12px)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textShadow: "0 1px 2px rgba(0,0,0,0.15)"
            }}>
                <span style={{ fontSize: 16 }}>{ok ? "✅" : "❌"}</span>
                {msg}
            </div>
        </div>
    )
}

export default Toast