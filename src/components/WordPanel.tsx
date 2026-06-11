import { useEffect, useRef, useState } from "react"
import Spinner from "./Spinner"
import type { DictEntry, DictMeaning, ExtCollection } from "~src/types"
import { C, panelStyle, partColor, s } from "~src/utilities"
import vocabilityLogo from "data-base64:~assets/vocability.svg"
import Toast from "./Toast"
import SaveForm from "./SaveForm"


type PanelView = "loading" | "not_authenticated" | "ready" | "not_found" | "saving"

interface WordPanelProps {
    word: string
    onClose: () => void
    onToast?: (msg: string, ok: boolean) => void
}

function getPhonetic(entry: DictEntry): string {
    if (entry.phonetic) return entry.phonetic
    for (const p of entry.phonetics ?? []) {
        if (p.text) return p.text
    }
    return ""
}

function WordPanel({ word, onClose, onToast }: WordPanelProps) {
    const [view, setView] = useState<PanelView>("loading")
    const [entry, setEntry] = useState<DictEntry | null>(null)
    const [activeMeaning, setActiveMeaning] = useState(0)
    const [selectedPos, setSelectedPos] = useState("")
    const [defText, setDefText] = useState("")
    const [notes, setNotes] = useState("")
    const [collections, setCollections] = useState<ExtCollection[]>([])
    const [collectionId, setCollectionId] = useState("")
    const [newCollName, setNewCollName] = useState("")
    const [showNewColl, setShowNewColl] = useState(false)
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
    const [isHover, setIsHover] = useState(false)

    const defRef = useRef<HTMLTextAreaElement>(null)

    const showToast = (msg: string, ok: boolean) => {
        if (onToast) {
            onToast(msg, ok)
        } else {
            setToast({ msg, ok })
            setTimeout(() => setToast(null), 3000)
        }
    }

    // On every word change → reset and initialise
    useEffect(() => {
        let cancelled = false
        setView("loading")
        setEntry(null)
        setNotes("")
        setDefText("")
        setActiveMeaning(0)
        setShowNewColl(false)
        setNewCollName("")

        async function init() {
            // 1. Check auth
            const session = await chrome.runtime.sendMessage({ type: "GET_SESSION" })
            if (cancelled) return
            if (!session?.user) {
                setView("not_authenticated")
                return
            }

            // 2. Fetch definition + collections in parallel
            const [defRes, collRes] = await Promise.all([
                chrome.runtime.sendMessage({ type: "FETCH_DEFINITION", word }),
                chrome.runtime.sendMessage({ type: "GET_COLLECTIONS" })
            ])
            if (cancelled) return

            // Collections
            const colls: ExtCollection[] = collRes?.data ?? []
            setCollections(colls)
            if (colls.length === 0) setShowNewColl(true)

            // Definition
            if (defRes?.notFound || !defRes?.data?.[0]) {
                setView("not_found")
                setSelectedPos("part of speech")
                setDefText("")
            } else {
                const e: DictEntry = defRes.data[0]
                setEntry(e)
                const firstMeaning = e.meanings?.[0]
                setSelectedPos(firstMeaning?.partOfSpeech ?? "part of speech")
                setDefText(firstMeaning?.definitions?.[0]?.definition ?? "")
                setView("ready")
            }
        }

        init()
        return () => { cancelled = true }
    }, [word])

    // When meaning tab changes, update defaults
    const handleMeaningClick = (idx: number, meaning: DictMeaning) => {
        setActiveMeaning(idx)
        setSelectedPos(meaning.partOfSpeech)
        setDefText(meaning.definitions?.[0]?.definition ?? "")
    }

    const handleSave = async () => {
        setView("saving")

        try {
            let targetCollectionId = collectionId

            // Create new collection if requested
            if (showNewColl && newCollName.trim()) {
                const res = await chrome.runtime.sendMessage({
                    type: "CREATE_COLLECTION",
                    name: newCollName.trim(),
                    color: "#4F46E5",
                    language_id: 1
                })
                if (res?.error) throw new Error(res.error)
                targetCollectionId = res.data.id
                setCollections((prev) => [res.data, ...prev])
                setCollectionId(res.data.id)
            } else if (!targetCollectionId && collections.length === 0) {
                // Auto-create a Reading List
                const res = await chrome.runtime.sendMessage({
                    type: "CREATE_COLLECTION",
                    name: "Reading List",
                    color: "#4F46E5",
                    language_id: 1
                })
                if (res?.error) throw new Error(res.error)
                targetCollectionId = res.data.id
                setCollections([res.data])
                setCollectionId(res.data.id)
            } else if (!targetCollectionId) {
                throw new Error("Please select a collection")
            }

            const saveRes = await chrome.runtime.sendMessage({
                type: "SAVE_WORD",
                word,
                phonetic: entry ? getPhonetic(entry) : undefined,
                part_of_speech: selectedPos !== "part of speech" ? selectedPos : undefined,
                definitions: [{ definition: defText, notes }],
                collection_id: targetCollectionId
            })

            if (saveRes?.success) {
                showToast("Word has been added successfully!", true)
                onClose()
            } else {
                throw new Error(saveRes?.error ?? "Failed to save word")
            }
        } catch (err: any) {
            showToast(err?.message ?? "Failed to save", false)
            setView("ready")
        }
    }

    return (
        <div
            style={panelStyle}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}>
            {/* ── Header ── */}
            <div style={{
                padding: "18px 20px 14px",
                borderBottom: `1px solid ${C.borderLight}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
                position: "sticky",
                top: 0,
                background: C.bg,
                zIndex: 1
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <img
                        src={vocabilityLogo}
                        alt="Vocability Logo"
                        style={{
                            width: 24,
                            height: 24,
                            display: "block"
                        }}
                    />
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
                            {word}
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    onMouseEnter={() => setIsHover(true)}
                    onMouseLeave={() => setIsHover(false)}
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: "10px",
                        border: `1px solid ${C.borderLight}`,
                        background: C.bgCard,
                        color: C.textMuted,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        flexShrink: 0,
                        transform: isHover ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "all 0.5s ease"
                    }}>
                    ✕
                </button>
            </div>

            {/* ── Body ── */}
            <div style={{ flex: 1, padding: "18px 20px", overflowY: "auto" }}>

                {/* Loading */}
                {view === "loading" && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingTop: 40 }}>
                        <Spinner size={32} />
                        <div style={{ color: C.textMuted, fontSize: 15 }}>Looking up &quot;{word}&quot;…</div>
                    </div>
                )}

                {/* Not authenticated */}
                {view === "not_authenticated" && (
                    <div style={{ textAlign: "center", paddingTop: 40 }}>
                        <div style={{ fontSize: 38, marginBottom: 16 }}>🔐</div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                            Sign in to continue
                        </div>
                        <div style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.6 }}>
                            Open the Vocability extension popup and sign in with Google to start saving words.
                        </div>
                    </div>
                )}

                {/* Definition not found */}
                {(view === "not_found" || (view === "saving" && !entry)) && (
                    <>
                        <div style={{
                            padding: "10px 14px",
                            background: "rgba(251,191,36,0.08)",
                            border: "1px solid rgba(251,191,36,0.2)",
                            borderRadius: 10,
                            fontSize: 14.5,
                            color: C.warning,
                            marginBottom: 20,
                            lineHeight: 1.5
                        }}>
                            ⚠️ No definition found for &quot;{word}&quot; in the dictionary. You can still save it with a custom definition.
                        </div>
                        <SaveForm
                            selectedPos={selectedPos} setSelectedPos={setSelectedPos}
                            defText={defText} setDefText={setDefText}
                            notes={notes} setNotes={setNotes}
                            collections={collections} collectionId={collectionId} setCollectionId={setCollectionId}
                            showNewColl={showNewColl} setShowNewColl={setShowNewColl}
                            newCollName={newCollName} setNewCollName={setNewCollName}
                            isSaving={view === "saving"} handleSave={handleSave} defRef={defRef}
                        />
                    </>
                )}

                {/* Ready with API data */}
                {(view === "ready" || view === "saving") && entry && (
                    <>
                        {/* Phonetic */}
                        {getPhonetic(entry) && (
                            <div style={{ color: C.textMuted, fontSize: 15, marginBottom: 16 }}>
                                {getPhonetic(entry)}
                            </div>
                        )}

                        {/* Meaning tabs */}
                        {entry.meanings.length > 1 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                                {entry.meanings.map((m, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleMeaningClick(i, m)}
                                        style={{
                                            padding: "4px 10px",
                                            borderRadius: 999,
                                            border: `1px solid ${i === activeMeaning ? partColor(m.partOfSpeech) : C.borderLight}`,
                                            background: i === activeMeaning ? `${partColor(m.partOfSpeech)}22` : "transparent",
                                            color: i === activeMeaning ? partColor(m.partOfSpeech) : C.textMuted,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            transition: "all 0.15s",
                                            fontStyle: "italic"
                                        }}>
                                        {m.partOfSpeech.toLocaleLowerCase()}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Definitions list */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={s.label}>Definitions</div>
                            {entry.meanings[activeMeaning]?.definitions.slice(0, 4).map((def, i) => (
                                <div
                                    key={i}
                                    onClick={() => setDefText(def.definition)}
                                    style={{
                                        padding: "8px 10px",
                                        marginBottom: 6,
                                        borderRadius: 8,
                                        background: defText === def.definition ? `${C.primary}18` : C.bgCard,
                                        border: `1px solid ${defText === def.definition ? C.border : C.borderLight}`,
                                        cursor: "pointer",
                                        transition: "all 0.15s"
                                    }}>
                                    <div style={{ fontSize: 14.5, color: C.text, lineHeight: 1.5 }}>
                                        <span style={{ color: C.textFaint, marginRight: 6, fontWeight: 600 }}>{i + 1}.</span>
                                        {def.definition}
                                    </div>
                                    {def.example && (
                                        <div style={{ fontSize: 13.5, color: C.textMuted, fontStyle: "italic", marginTop: 4, lineHeight: 1.4 }}>
                                            &quot;{def.example}&quot;
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Separator */}
                        <div style={{ height: 1, background: C.borderLight, margin: "0 0 20px" }} />

                        <SaveForm
                            selectedPos={selectedPos} setSelectedPos={setSelectedPos}
                            defText={defText} setDefText={setDefText}
                            notes={notes} setNotes={setNotes}
                            collections={collections} collectionId={collectionId} setCollectionId={setCollectionId}
                            showNewColl={showNewColl} setShowNewColl={setShowNewColl}
                            newCollName={newCollName} setNewCollName={setNewCollName}
                            isSaving={view === "saving"} handleSave={handleSave} defRef={defRef}
                        />
                    </>
                )}
            </div>

            {/* Toast */}
            {toast && <Toast msg={toast.msg} ok={toast.ok} />}
        </div>
    )

}

export default WordPanel