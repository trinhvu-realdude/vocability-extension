import { useEffect, useState } from "react"
import "./popup.css"
import type { ExtUser } from "~src/types"

import vocabilityLogo from "data-base64:~assets/vocability.svg"

// ─── Popup component ──────────────────────────────────────────────────────────

function IndexPopup() {
  const [user, setUser] = useState<ExtUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [redirectUrl, setRedirectUrl] = useState("")

  // Load current session + the redirect URL on mount
  useEffect(() => {
    Promise.all([
      chrome.runtime.sendMessage({ type: "GET_SESSION" }),
      chrome.runtime.sendMessage({ type: "GET_REDIRECT_URL" })
    ]).then(([session, urlRes]) => {
      setUser(session?.user ?? null)
      setRedirectUrl(urlRes?.url ?? "")
      setLoading(false)
    })
  }, [])

  const handleSignIn = async () => {
    setSigningIn(true)
    setError(null)
    try {
      const result = await chrome.runtime.sendMessage({ type: "SIGN_IN_GOOGLE" })
      if (result?.user) {
        setUser(result.user)
      } else if (result?.error) {
        setError(result.error)
      }
    } catch (err: any) {
      setError(err?.message ?? "Sign-in failed. Please try again.")
    } finally {
      setSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    await chrome.runtime.sendMessage({ type: "SIGN_OUT" })
    setUser(null)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="popup">
      {/* Logo */}
      <div className="logo-row">
        <div className="logo-icon">
          <img src={vocabilityLogo} alt="Vocability Logo" style={{ width: "24px", height: "24px" }} />
        </div>
        <div className="logo-text-wrap">
          <div className="logo-text">
            <span className="logo-voc">Voc</span>
            <span className="logo-ability">ability</span>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Loading state */}
      {loading && (
        <div className="loading-center">
          <span className="spinner" />
        </div>
      )}

      {/* ── Not signed in ──────────────────────────────────────────────────── */}
      {!loading && !user && (
        <>
          {error && <div className="error-box">⚠️ {error}</div>}

          <button
            className="btn-google"
            onClick={handleSignIn}
            disabled={signingIn}>
            {signingIn ? (
              <span className="spinner" />
            ) : (
              <svg className="google-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            <span>{signingIn ? "Signing in…" : "Continue with Google"}</span>
          </button>

          {/* <div className="features">
            <div className="feature">
              <div className="feature-dot" />
              Select any word on a page — a tooltip appears instantly
            </div>
            <div className="feature">
              <div className="feature-dot" />
              Right-click and select <strong style={{ color: "#94a3b8" }}>Define with Vocability</strong>
            </div>
            <div className="feature">
              <div className="feature-dot" />
              Get definitions from the Free Dictionary API
            </div>
            <div className="feature">
              <div className="feature-dot" />
              Save words to any of your Vocability collections
            </div>
          </div> */}

          {/* OAuth redirect URL info */}
          {/* {redirectUrl && (
            <div className="redirect-box">
              <div className="redirect-title">
                <span>⚙️</span> Setup Required
              </div>
              <div className="redirect-desc">
                Add this URL to your Supabase project →{" "}
                <strong style={{ color: "#e2e8f0" }}>Authentication → URL Configuration → Redirect URLs</strong>:
              </div>
              <code className="redirect-url">{redirectUrl}</code>
            </div>
          )} */}
        </>
      )}

      {/* ── Signed in ──────────────────────────────────────────────────────── */}
      {!loading && user && (
        <>
          {/* User card */}
          <div className="user-card">
            {user.avatar_url ? (
              <img className="avatar" src={user.avatar_url} alt={user.full_name ?? user.email} />
            ) : (
              <div className="avatar-placeholder">
                {(user.full_name ?? user.email ?? "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="user-info">
              <div className="user-name">
                {user.full_name ?? user.email?.split("@")[0] ?? "User"}
              </div>
              <div className="user-email">{user.email}</div>
            </div>
            <div className="status-dot" title="Signed in" />
          </div>

          {/* How to use */}
          <div className="section-label">How to use</div>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-text">
                <strong>Select</strong> any word or phrase (up to 5 words) on any webpage — a tooltip will appear above your selection.
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-text">
                Alternatively, <strong>right-click</strong> selected text and choose <strong>"Define with Vocability"</strong>.
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-text">
                Review the definition, pick a <strong>collection</strong>, and hit <strong>Add word</strong>!
              </div>
            </div>
          </div>

          <div className="divider" />

          {/* Actions */}
          <div className="actions">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="btn-primary">
              <span>🚀</span> Open Vocability
            </a>
            <button className="btn-ghost" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default IndexPopup
