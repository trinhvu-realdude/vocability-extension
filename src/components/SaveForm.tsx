import React from "react"
import Spinner from "./Spinner"
import type { ExtCollection } from "~src/types"
import { C, POS_OPTIONS, s } from "~src/utilities"

export interface SaveFormProps {
    selectedPos: string
    setSelectedPos: (v: string) => void
    defText: string
    setDefText: (v: string) => void
    notes: string
    setNotes: (v: string) => void
    collections: ExtCollection[]
    collectionId: string
    setCollectionId: (v: string) => void
    showNewColl: boolean
    setShowNewColl: (v: boolean) => void
    newCollName: string
    setNewCollName: (v: string) => void
    isSaving: boolean
    handleSave: () => void
    defRef: React.RefObject<HTMLTextAreaElement>
}

export default function SaveForm({
    selectedPos,
    setSelectedPos,
    defText,
    setDefText,
    notes,
    setNotes,
    collections,
    collectionId,
    setCollectionId,
    showNewColl,
    setShowNewColl,
    newCollName,
    setNewCollName,
    isSaving,
    handleSave,
    defRef
}: SaveFormProps) {
    const myCollections = collections.filter((c) => c.myRole === 'owner' || !c.myRole)
    const sharedCollections = collections.filter((c) => c.myRole === 'editor')

    return (
        <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                <span>✨</span> Add word
            </div>

            {/* Collection */}
            <div style={{ marginBottom: 14 }}>
                <div style={s.label}>Collection</div>

                {!showNewColl && collections.length > 0 ? (
                    <div style={{ display: "flex", gap: 8 }}>
                        <select
                            value={collectionId}
                            onChange={(e) => setCollectionId(e.target.value)}
                            style={{
                                ...s.input,
                                flex: 1,
                                appearance: "none",
                                cursor: "pointer",
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236c757d' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 10px center",
                                paddingRight: 28
                            }}>
                            {myCollections.length > 0 && (
                                <optgroup label="My Collections">
                                    {myCollections.map((c) => (
                                        <option key={c.id} value={c.id} style={{ background: "#ffffff" }}>
                                            {c.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            {sharedCollections.length > 0 && (
                                <optgroup label="Shared with Me">
                                    {sharedCollections.map((c) => (
                                        <option key={c.id} value={c.id} style={{ background: "#ffffff" }}>
                                            {c.name} (Editor)
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                        <button
                            onClick={() => setShowNewColl(true)}
                            style={{
                                padding: "8px 10px",
                                borderRadius: 8,
                                border: `1px solid ${C.borderLight}`,
                                background: C.bgCard,
                                color: C.textMuted,
                                cursor: "pointer",
                                fontSize: 18,
                                transition: "all 0.15s",
                                flexShrink: 0,
                            }}
                            title="Create new collection">
                            +
                        </button>
                    </div>
                ) : (
                    <div>
                        <input
                            type="text"
                            value={newCollName}
                            onChange={(e) => setNewCollName(e.target.value)}
                            placeholder={collections.length === 0 ? "Collection name (e.g. Reading List)" : "New collection name…"}
                            style={s.input}
                            autoFocus
                        />
                        {collections.length > 0 && (
                            <button
                                onClick={() => setShowNewColl(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: C.textMuted,
                                    fontSize: 13,
                                    cursor: "pointer",
                                    marginTop: 4,
                                    padding: 0
                                }}>
                                ← Use existing collection
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Part of speech */}
            <div style={{ marginBottom: 14 }}>
                <div style={s.label}>Part of Speech</div>
                <select
                    value={selectedPos}
                    onChange={(e) => setSelectedPos(e.target.value)}
                    style={{
                        ...s.input,
                        appearance: "none",
                        cursor: "pointer",
                        paddingRight: 28,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236c757d' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 10px center"
                    }}>
                    {POS_OPTIONS.map((p) => (
                        <option key={p} value={p} style={{ background: "#ffffff" }}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Definition */}
            <div style={{ marginBottom: 12 }}>
                <div style={s.label}>Definition</div>
                <textarea
                    ref={defRef}
                    value={defText}
                    onChange={(e) => setDefText(e.target.value)}
                    placeholder="Enter the definition…"
                    rows={3}
                    style={{
                        ...s.input,
                        minHeight: 72,
                        fontFamily: "inherit"
                    }}
                />
            </div>

            {/* Example */}
            <div style={{ marginBottom: 14 }}>
                <div style={s.label}>Example</div>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    style={{
                        ...s.input,
                        minHeight: 52,
                        fontFamily: "inherit"
                    }}
                />
            </div>

            {/* Save button */}
            <div style={{ marginTop: 20, marginBottom: 10 }}>
                <button
                    disabled={isSaving || (!defText.trim())}
                    onClick={handleSave}
                    style={{
                        width: "100%",
                        padding: "11px 16px",
                        background:
                            isSaving || !defText.trim()
                                ? "rgba(221, 87, 70, 0.3)"
                                : `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                        border: "none",
                        borderRadius: 10,
                        color: C.white,
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: isSaving || !defText.trim() ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "all 0.2s",
                        boxShadow: isSaving || !defText.trim() ? "none" : `0 4px 16px ${C.primaryGlow}`,
                        letterSpacing: "0.2px"
                    }}>
                    {isSaving ? (
                        <>
                            <Spinner size={16} color="white" />
                            Saving…
                        </>
                    ) : (
                        <>
                            <span>✨</span> Add word
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
