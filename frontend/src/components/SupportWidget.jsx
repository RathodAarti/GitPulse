import { useState, useRef, useEffect } from 'react'
import api from '../services/api'
import { XIcon, MaximizeIcon, MinimizeIcon } from './Icons'

// ── Topic categories ─────────────────────────────────────────────────────────
const TOPICS = [
  {
    id: 'login',
    label: 'Login / Password issues',
  },
  {
    id: 'github',
    label: 'GitHub integration / PAT setup',
  },
  {
    id: 'analytics',
    label: 'Analytics not loading / Sync issues',
  },
  {
    id: 'repo',
    label: 'Adding or removing repositories',
  },
  {
    id: 'ai',
    label: 'AI Insights feature',
  },
  {
    id: 'other',
    label: 'My issue is not listed above',
  },
]

const MSG = { BOT: 'bot', USER: 'user', TOPICS: 'topics' }

function BotMsg({ text }) {
  return (
    <div className="sw-msg sw-msg-bot">
      <div className="sw-avatar-bot">
        <img src="/logo.svg" alt="GitPulse AI" width={20} height={20} style={{ display: 'block' }} />
      </div>
      <div className="sw-bubble sw-bubble-bot">
        {text.split('\n').map((line, i) =>
          line.trim() ? <p key={i}>{line}</p> : <br key={i} />
        )}
      </div>
    </div>
  )
}

function UserMsg({ text }) {
  return (
    <div className="sw-msg sw-msg-user">
      <div className="sw-bubble sw-bubble-user">{text}</div>
    </div>
  )
}

export default function SupportWidget() {
  const [open, setOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
    return () => clearTimeout(timer)
  }, [messages, aiLoading])

  const addMsg = (type, payload) =>
    setMessages(prev => [...prev, { type, payload, id: Date.now() + Math.random() }])

  const handleOpen = () => {
    setMessages([
      {
        type: MSG.BOT,
        payload: 'Hello, I am GitPulse AI Assistant. How can I help you today? Please select a topic below or type your question directly.',
        id: 1,
      },
      { type: MSG.TOPICS, payload: TOPICS, id: 2 },
    ])
    setInputValue('')
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setMessages([])
    setIsFullScreen(false)
  }

  const getAiResponse = async (userQuery) => {
    setAiLoading(true)
    try {
      const res = await api.post('/ai/support-reply', {
        subject: userQuery,
        message: userQuery,
      })
      if (res.data?.success && res.data.reply) {
        addMsg(MSG.BOT, res.data.reply)
      } else {
        addMsg(MSG.BOT, 'I was unable to generate a response. Please try again or contact support directly.')
      }
    } catch (err) {
      addMsg(
        MSG.BOT,
        'Sorry, I am temporarily unavailable. Please try again later.'
      )
    } finally {
      setAiLoading(false)
    }
  }

  const handleTopicSelect = async (topic) => {
    addMsg(MSG.USER, topic.label)
    await getAiResponse(topic.label)
    setTimeout(() => {
      addMsg(MSG.TOPICS, [
        { id: 'resolved', label: 'Yes, this has been resolved' },
        { id: 'unresolved', label: 'No, I need further assistance' },
      ])
    }, 300)
  }

  const handleResolution = async (topic) => {
    addMsg(MSG.USER, topic.label)
    if (topic.id === 'resolved') {
      setTimeout(() => {
        addMsg(
          MSG.BOT,
          'Great! I am glad I could help. If you have any more questions, feel free to reach out anytime. If you have further queries, please contact us at: agrathod0701@gmail.com'
        )
      }, 300)
    } else {
      setTimeout(() => {
        addMsg(
          MSG.BOT,
          'I apologize. Please contact us directly for further assistance: agrathod0701@gmail.com'
        )
      }, 300)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userText = inputValue.trim()
    addMsg(MSG.USER, userText)
    setInputValue('')
    await getAiResponse(userText)
  }

  const isResolutionSet = (topics) =>
    topics.length === 2 && topics[0].id === 'resolved'

  return (
    <>
      <button
        className={`support-widget-fab ${open ? 'is-open' : ''}`}
        onClick={open ? handleClose : handleOpen}
        aria-label={open ? 'Close support' : 'Open support'}
        title="AI Help & Support"
      >
        {open ? (
          <XIcon size={20} />
        ) : (
          <img
            src="/logo.svg"
            alt="Support"
            width={24}
            height={24}
            style={{ display: 'block' }}
          />
        )}
        {!open && <span className="support-widget-label">Support</span>}
      </button>

      {open && (
        <div
          className={`support-widget-panel ${isFullScreen ? 'sw-fullscreen' : ''}`}
          role="dialog"
          aria-label="AI Support chat"
        >
          {/* Header */}
          <div className="support-widget-header">
            <div className="support-widget-header-left">
              <div className="sw-header-logo">
                <img
                  src="/logo.svg"
                  alt="GitPulse"
                  width={28}
                  height={28}
                  style={{ display: 'block' }}
                />
              </div>
              <div>
                <div className="support-widget-title">GitPulse AI Assistant</div>
                <div className="support-widget-status">
                  <span className="support-online-dot" />
                  Online & AI-powered
                </div>
              </div>
            </div>
            <div className="sw-header-actions">
              <button
                className="sw-fullscreen-btn"
                onClick={() => setIsFullScreen(!isFullScreen)}
                aria-label={isFullScreen ? 'Minimize chat' : 'Full screen chat'}
              >
                {isFullScreen ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
              </button>
              <button
                className="support-widget-close"
                onClick={handleClose}
                aria-label="Close"
              >
                <XIcon size={15} />
              </button>
            </div>
          </div>

          {/* Chat */}
          <div className="sw-chat-body" aria-live="polite" aria-label="Chat messages">
            {messages.map((msg) => {
              if (msg.type === MSG.BOT) return <BotMsg key={msg.id} text={msg.payload} />
              if (msg.type === MSG.USER) return <UserMsg key={msg.id} text={msg.payload} />
              if (msg.type === MSG.TOPICS) {
                const isResolution = isResolutionSet(msg.payload)
                return (
                  <div key={msg.id} className="sw-topics">
                    {msg.payload.map((t) => (
                      <button
                        key={t.id}
                        className={`sw-topic-btn ${isResolution ? (t.id === 'resolved' ? 'sw-topic-success' : 'sw-topic-neutral') : ''}`}
                        onClick={() => isResolution ? handleResolution(t) : handleTopicSelect(t)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )
              }
              return null
            })}

            {aiLoading && (
              <div className="sw-msg sw-msg-bot">
                <div className="sw-avatar-bot">
                  <img src="/logo.svg" alt="" width={20} height={20} style={{ display: 'block' }} />
                </div>
                <div className="sw-bubble sw-bubble-bot">
                  <div className="support-ai-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Footer Input */}
          <div className="sw-input-area">
            <form onSubmit={handleSubmit} className="sw-input-form">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={aiLoading}
                className="sw-input"
              />
              <button
                type="submit"
                className="sw-send-btn"
                disabled={aiLoading || !inputValue.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
