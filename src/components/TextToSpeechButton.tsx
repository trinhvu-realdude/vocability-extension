import { useState } from "react"
import { handleTextToSpeech } from "~src/utilities"


function TextToSpeechButton({ word }: { word: string }) {
    const [isSpeaking, setIsSpeaking] = useState(false)

    const handleSpeak = async () => {
        setIsSpeaking(true)

        try {
            await handleTextToSpeech(word)
        } finally {
            setTimeout(() => setIsSpeaking(false), 1200)
        }
    }
    return <button
        onClick={handleSpeak}
        style={{
            width: 30,
            height: 30,
            background: isSpeaking
                ? "linear-gradient(135deg, #DD5746, #ff8a65)"
                : "#ffffff",
            border: `1px solid ${isSpeaking ? "#DD5746" : "rgba(0,0,0,0.08)"}`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isSpeaking ? "#fff" : "#DD5746",
            borderRadius: "50%",
            margin: "0 4px",
            boxShadow: isSpeaking
                ? "0 0 0 2px rgba(221,87,70,0.15)"
                : "0 1px 2px rgba(0,0,0,0.08)",
            transform: isSpeaking
                ? "rotate(2deg)"
                : "scale(1)",
            transition: "all 0.2s ease",
            fontSize: "12px"
        }}
        title="Listen to pronunciation"
    >
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
    </button>;
}

export default TextToSpeechButton