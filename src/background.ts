import { createClient } from "@supabase/supabase-js"

// ─── Supabase config ─────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.PLASMO_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY!
const DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en/"

// ─── Chrome storage adapter ───────────────────────────────────────────────────
// MV3 service workers have no localStorage — we use chrome.storage.local.
// @supabase/supabase-js v2 supports async storage adapters.

const chromeStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const result = await chrome.storage.local.get(key)
    return (result[key] as string) ?? null
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await chrome.storage.local.set({ [key]: value })
  },
  removeItem: async (key: string): Promise<void> => {
    await chrome.storage.local.remove(key)
  }
}

// ─── Supabase client ──────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: chromeStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// ─── Context menu setup ───────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  // Remove all existing menus first to avoid duplicates on reload
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "vocability-define",
      title: "Define with Vocability",
      contexts: ["selection"]
    })
  })
})

// Context menu click → forward selected word to content script
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (
    info.menuItemId === "vocability-define" &&
    tab?.id != null &&
    info.selectionText
  ) {
    chrome.tabs.sendMessage(tab.id, {
      type: "CONTEXT_MENU_WORD",
      word: info.selectionText.trim()
    })
  }
})

// ─── Message handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((err: any) =>
      sendResponse({ error: err?.message ?? "An unknown error occurred" })
    )
  return true // keep the message channel open for async response
})

async function handleMessage(msg: { type: string; [key: string]: any }) {
  switch (msg.type) {
    // ── Auth ──────────────────────────────────────────────────────────────────

    case "GET_SESSION": {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) return null
      const meta = session.user.user_metadata ?? {}
      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          full_name: meta.full_name ?? meta.name ?? "",
          avatar_url: meta.avatar_url ?? meta.picture ?? ""
        }
      }
    }

    case "GET_REDIRECT_URL": {
      // Returns the OAuth redirect URL so the popup can show it to the user
      // (needs to be whitelisted in Supabase Auth settings)
      return { url: chrome.identity.getRedirectURL() }
    }

    case "SIGN_IN_GOOGLE": {
      const redirectUrl = chrome.identity.getRedirectURL()

      // Ask the Supabase client to build the OAuth URL (handles PKCE internally)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true // We'll open the flow ourselves
        }
      })

      if (error || !data?.url) {
        throw error ?? new Error("Failed to build OAuth URL")
      }

      // Open the Google OAuth consent screen via Chrome's identity API
      const responseUrl: string = await new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow(
          { url: data.url, interactive: true },
          (callbackUrl) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message))
            } else if (callbackUrl) {
              resolve(callbackUrl)
            } else {
              reject(new Error("Authentication was cancelled"))
            }
          }
        )
      })

      const callbackUrl = new URL(responseUrl)

      // PKCE flow: exchange authorization code → session
      const code = callbackUrl.searchParams.get("code")
      if (code) {
        const { data: sd, error: se } =
          await supabase.auth.exchangeCodeForSession(code)
        if (se) throw se
        const u = sd.session?.user
        const um = u?.user_metadata ?? {}
        return {
          user: {
            id: u?.id,
            email: u?.email,
            full_name: um.full_name ?? um.name ?? "",
            avatar_url: um.avatar_url ?? um.picture ?? ""
          }
        }
      }

      // Implicit flow fallback: tokens arrive in the URL fragment
      const params = new URLSearchParams(callbackUrl.hash.substring(1))
      const accessToken = params.get("access_token")
      const refreshToken = params.get("refresh_token")
      if (accessToken && refreshToken) {
        const { data: sd, error: se } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })
        if (se) throw se
        const u = sd.session?.user
        const um = u?.user_metadata ?? {}
        return {
          user: {
            id: u?.id,
            email: u?.email,
            full_name: um.full_name ?? um.name ?? "",
            avatar_url: um.avatar_url ?? um.picture ?? ""
          }
        }
      }

      throw new Error("Authentication failed: no tokens received")
    }

    case "SIGN_OUT": {
      await supabase.auth.signOut()
      return { success: true }
    }

    // ── Dictionary API ────────────────────────────────────────────────────────

    case "FETCH_DEFINITION": {
      const word = (msg.word as string).toLowerCase().trim()
      const res = await fetch(`${DICTIONARY_API}${encodeURIComponent(word)}`)
      if (res.status === 404) return { notFound: true }
      if (!res.ok) throw new Error(`Dictionary API error: ${res.status}`)
      const data = await res.json()
      return { data }
    }

    // ── Supabase CRUD ─────────────────────────────────────────────────────────

    case "GET_COLLECTIONS": {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) return { error: "not_authenticated" }

      const { data, error } = await supabase
        .from("collections")
        .select("id, name, color, language_id")
        .eq("user_id", session.user.id)
        .eq("language_id", 1) // For now we only support English — can expand later
        .order("created_at", { ascending: false })

      if (error) throw error
      return { data: data ?? [] }
    }

    case "CREATE_COLLECTION": {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) return { error: "not_authenticated" }

      const { data, error } = await supabase
        .from("collections")
        .insert({
          name: (msg.name as string) ?? "Reading List",
          color: (msg.color as string) ?? "#4F46E5",
          language_id: (msg.language_id as number) ?? 1,
          user_id: session.user.id
        })
        .select("id, name, color, language_id")
        .single()

      if (error) throw error
      return { data }
    }

    case "SAVE_WORD": {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) return { error: "not_authenticated" }

      const { word, phonetic, part_of_speech, definitions, collection_id } =
        msg as {
          word: string
          phonetic?: string
          part_of_speech: string
          definitions: Array<{ definition: string; notes: string }>
          collection_id: string
        }

      // Insert the word
      const { data: wordRow, error: wordError } = await supabase
        .from("words")
        .insert({
          word: word.toLowerCase().trim(),
          phonetic: phonetic ?? null,
          part_of_speech: part_of_speech ?? "",
          is_favorite: false,
          user_id: session.user.id,
          collection_id
        })
        .select("id")
        .single()

      if (wordError) throw wordError

      // Insert definitions
      if (definitions?.length) {
        const defRows = definitions.map((d, i) => ({
          word_id: wordRow.id,
          definition: d.definition,
          notes: d.notes ?? "",
          sort_order: i
        }))
        const { error: defError } = await supabase
          .from("definitions")
          .insert(defRows)
        if (defError) throw defError
      }

      return { success: true, wordId: wordRow.id }
    }

    default:
      return { error: `Unknown message type: ${msg.type}` }
  }
}
