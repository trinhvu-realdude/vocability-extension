// ─── Extension User ──────────────────────────────────────────────────────────

export interface ExtUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  name?: string
  picture?: string
}

// ─── Collections ─────────────────────────────────────────────────────────────

export interface ExtCollection {
  id: string
  name: string
  color: string
  language_id: number
}

// ─── Dictionary API Types ─────────────────────────────────────────────────────

export interface DictDefinition {
  definition: string
  example?: string
  synonyms: string[]
  antonyms: string[]
}

export interface DictMeaning {
  partOfSpeech: string
  definitions: DictDefinition[]
  synonyms: string[]
  antonyms: string[]
}

export interface DictPhonetic {
  text?: string
  audio?: string
}

export interface DictEntry {
  word: string
  phonetic?: string
  phonetics: DictPhonetic[]
  meanings: DictMeaning[]
}

// ─── Messages ────────────────────────────────────────────────────────────────

export type MessageType =
  | "GET_SESSION"
  | "SIGN_IN_GOOGLE"
  | "SIGN_OUT"
  | "GET_REDIRECT_URL"
  | "FETCH_DEFINITION"
  | "GET_COLLECTIONS"
  | "SAVE_WORD"
  | "CREATE_COLLECTION"
  | "CONTEXT_MENU_WORD"

export interface SaveWordPayload {
  word: string
  phonetic?: string
  part_of_speech: string
  definitions: Array<{ definition: string; notes: string }>
  collection_id: string
}
