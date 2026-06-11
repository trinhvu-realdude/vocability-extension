export const C = {
    bg: "rgba(252, 252, 252, 0.97)",
    bgCard: "#ffffff",
    bgInput: "#f8f9fa",
    border: "rgba(221, 87, 70, 0.2)",
    borderLight: "rgba(0,0,0,0.06)",
    primary: "#DD5746",
    primaryDark: "#c44133",
    primaryGlow: "rgba(221, 87, 70, 0.25)",
    text: "#212529",
    textMuted: "#6c757d",
    textFaint: "#adb5bd",
    success: "#20c997",
    error: "#dc3545",
    warning: "#fd7e14",
    white: "#ffffff"
}

export const PART_COLORS: Record<string, string> = {
    noun: "#60a5fa",          // blue
    verb: "#34d399",          // green
    adjective: "#f472b6",     // pink
    adverb: "#fb923c",        // orange
    pronoun: "#a78bfa",       // purple
    preposition: "#facc15",   // yellow
    conjunction: "#f87171",   // red
    interjection: "#22d3ee",  // cyan
    exclamation: "#22d3ee",   // cyan
    idiom: "#8b5cf6",         // violet
    "phrasal verb": "#10b981",// emerald
    determiner: "#eab308",    // amber
    article: "#fde047",       // light yellow
    collocation: "#14b8a6",   // teal
    expression: "#ec4899",    // rose
}

export const POS_OPTIONS = [
    "part of speech", "noun", "adjective", "verb", "adverb", "idiom",
    "phrasal verb", "preposition", "pronoun", "determiner",
    "conjunction", "interjection", "article", "collocation",
    "expression"
]

export const s = {
    label: {
        fontSize: 12,
        fontWeight: 600,
        textTransform: "uppercase" as const,
        letterSpacing: "0.7px",
        color: C.textFaint,
        marginBottom: 6
    },
    input: {
        width: "100%",
        padding: "8px 10px",
        background: C.bgInput,
        border: `1px solid ${C.borderLight}`,
        borderRadius: 8,
        color: C.text,
        fontSize: 15,
        outline: "none",
        transition: "border-color 0.2s",
        resize: "vertical" as const,
        lineHeight: 1.5
    },
    badge: (color: string) => ({
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: `${color}22`,
        color: color,
        border: `1px solid ${color}44`
    })
}

export const partColor = (pos: string) =>
    PART_COLORS[pos?.toLowerCase()] ?? C.primary

export const panelStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    right: 0,
    width: 400,
    height: "100vh",
    background: C.bg,
    borderLeft: `1px solid ${C.border}`,
    boxShadow: "-8px 0 40px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
    zIndex: 2147483646,
    animation: "voc-slide-in 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
    backdropFilter: "blur(20px)",
    overflowY: "auto",
    pointerEvents: "auto"
}