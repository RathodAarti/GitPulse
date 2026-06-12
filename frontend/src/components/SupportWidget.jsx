import { useState, useRef, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { XIcon, CheckIcon, AlertIcon } from './Icons'

// ── Topic categories ─────────────────────────────────────────────────────────
const TOPICS = [
  {
    id: 'login',
    label: 'Login / Password issues',
    answer: 'If you are having trouble signing in, please use the "Forgot Password?" link on the login page. It will verify your security question and allow you to set a new password.\n\nEnsure your email address is entered correctly and that Caps Lock is off. If the issue persists, please contact our support team directly.'
  },
  {
    id: 'github',
    label: 'GitHub integration / PAT setup',
    answer: 'To connect your GitHub account:\n\n1. Navigate to Settings → GitHub Integration\n2. Visit github.com/settings/tokens and generate a Personal Access Token\n3. Select the "repo" scope if you need access to private repositories\n4. Paste the token into GitPulse and click "Update Integration Token"\n\nThis increases your API rate limit from 60 to 5,000 requests per hour.'
  },
  {
    id: 'analytics',
    label: 'Analytics not loading / Sync issues',
    answer: 'Analytics data is cached for 20 minutes to prevent GitHub API rate limit exhaustion.\n\nTo refresh your data:\n1. Open the repository analytics page\n2. Wait for the "Sync Data" button to become available\n3. Click it to fetch the latest metrics\n\nIf synchronisation fails repeatedly, please verify your GitHub PAT in Settings.'
  },
  {
    id: 'repo',
    label: 'Adding or removing repositories',
    answer: 'To add a repository:\n\n1. Go to the Dashboard\n2. Paste a valid GitHub URL (e.g. https://github.com/facebook/react)\n3. Click "Initialize Monitoring"\n\nTo remove a repository, click the delete icon on the repository card.\n\nNote: Private repositories require a GitHub PAT with the "repo" scope configured in Settings.'
  },
  {
    id: 'ai',
    label: 'AI Insights feature',
    answer: 'AI Insights are available on every repository analytics page.\n\nSimply click "Generate Insights" to receive an analysis covering:\n- Repository health overview\n- Bus factor and contributor risk\n- Velocity trend analysis\n- Actionable recommendations\n\nPowered by LLaMA 3.1 via Groq. Insights can be regenerated at any time.'
  },
  {
    id: 'other',
    label: 'My issue is not listed above',
    answer: null
  }
]

const MSG = { BOT: 'bot', USER: 'user', TOPICS: 'topics' }

function BotMsg({ text }) {
  return (
    <div className="sw-msg sw-msg-bot">
      <div className="sw-avatar-bot">
        <img src="/logo.svg" alt="GitPulse Support" width={20} height={20} style={{ display: 'block' }} />
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
  const { user, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [showContact, setShowContact] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitAlert, setSubmitAlert] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [messages, showContact, aiLoading])

  const addMsg = (type, payload) =>
    setMessages(prev => [...prev, { type, payload, id: Date.now() + Math.random() }])

  const handleOpen = () => {
    setMessages([
      {
        type: MSG.BOT,
        payload: 'Hello, thank you for reaching out to GitPulse Support.\n\nHow can I assist you today? Please select a topic below.',
        id: 1
      },
      { type: MSG.TOPICS, payload: TOPICS, id: 2 }
    ])
    setShowContact(false)
    setSubmitAlert(null)
    setContactForm({
      name: user?.name || '',
      email: user?.email || '',
      subject: '',
      message: '',
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setMessages([])
    setShowContact(false)
    setSubmitAlert(null)
  }

  const handleTopicSelect = (topic) => {
    addMsg(MSG.USER, topic.label)

    if (topic.id === 'other') {
      setTimeout(() => {
        addMsg(MSG.BOT, 'Of course. Please complete the form below and a member of our support team will respond within 24 hours.')
        setShowContact(true)
      }, 350)
      return
    }

    setTimeout(() => {
      addMsg(MSG.BOT, topic.answer)

      // Silent AI enhancement
      setAiLoading(true)
      api.post('/api/ai/support-reply', { subject: topic.label, message: topic.answer })
        .then(res => {
          if (res.data?.success && res.data.reply && res.data.reply !== topic.answer) {
            addMsg(MSG.BOT, res.data.reply)
          }
        })
        .catch(() => {})
        .finally(() => setAiLoading(false))

      setTimeout(() => {
        addMsg(MSG.BOT, 'Has this resolved your query?')
        addMsg(MSG.TOPICS, [
          { id: 'resolved', label: 'Yes, this has been resolved', answer: null },
          { id: 'unresolved', label: 'No, I need further assistance', answer: null },
        ])
      }, 700)
    }, 350)
  }

  const handleResolution = (topic) => {
    addMsg(MSG.USER, topic.label)
    if (topic.id === 'resolved') {
      setTimeout(() => {
        addMsg(MSG.BOT, 'Thank you for confirming. We are glad the issue has been resolved.\n\nIf you need further assistance in the future, do not hesitate to reach out.')
      }, 300)
    } else {
      setTimeout(() => {
        addMsg(MSG.BOT, 'We apologise for the inconvenience. Please complete the form below and our support team will follow up with you directly via email.')
        setShowContact(true)
      }, 300)
    }
  }

  const handleContactChange = (e) =>
    setContactForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    const { name, email, subject, message } = contactForm
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setSubmitAlert({ type: 'error', text: 'All fields are required.' })
      return
    }
    setSubmitting(true)
    setSubmitAlert(null)
    try {
      const endpoint = isAuthenticated ? '/support' : '/support/public'
      const res = await api.post(endpoint, {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: subject.trim(),
        message: message.trim(),
      })
      if (res.data?.success) {
        setShowContact(false)
        addMsg(MSG.BOT, `Your support request has been submitted successfully.\n\nOur team will contact you at ${email} within 24 hours.\n\nAlternatively, you may reach us directly at: agrathod0701@gmail.com`)
      } else {
        setSubmitAlert({ type: 'error', text: res.data?.message || 'Submission failed. Please try again.' })
      }
    } catch (err) {
      setSubmitAlert({ type: 'error', text: err.response?.data?.message || 'Unable to connect to the server. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const isResolutionSet = (topics) =>
    topics.length === 2 && topics[0].id === 'resolved'

  return (
    <>
      <button
        className={`support-widget-fab ${open ? 'is-open' : ''}`}
        onClick={open ? handleClose : handleOpen}
        aria-label={open ? 'Close support' : 'Open support'}
        title="Help & Support"
      >
        {open
          ? <XIcon size={20} />
          : <img src="/logo.svg" alt="Support" width={24} height={24} style={{ display: 'block' }} />
        }
        {!open && <span className="support-widget-label">Support</span>}
      </button>

      {open && (
        <div className="support-widget-panel" role="dialog" aria-label="Support chat">
          {/* Header */}
          <div className="support-widget-header">
            <div className="support-widget-header-left">
              <div className="sw-header-logo">
                <img src="/logo.svg" alt="GitPulse" width={28} height={28} style={{ display: 'block' }} />
              </div>
              <div>
                <div className="support-widget-title">GitPulse Support</div>
                <div className="support-widget-status">
                  <span className="support-online-dot" />
                  Online &mdash; Response within 24 hours
                </div>
              </div>
            </div>
            <button className="support-widget-close" onClick={handleClose} aria-label="Close">
              <XIcon size={15} />
            </button>
          </div>

          {/* Chat */}
          <div className="sw-chat-body">
            {messages.map(msg => {
              if (msg.type === MSG.BOT) return <BotMsg key={msg.id} text={msg.payload} />
              if (msg.type === MSG.USER) return <UserMsg key={msg.id} text={msg.payload} />
              if (msg.type === MSG.TOPICS) {
                const isResolution = isResolutionSet(msg.payload)
                return (
                  <div key={msg.id} className="sw-topics">
                    {msg.payload.map(t => (
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
                  <div className="support-ai-typing"><span /><span /><span /></div>
                </div>
              </div>
            )}

            {showContact && (
              <div className="sw-contact-form">
                <p className="sw-contact-note">
                  Please complete the form below. All fields are required.
                </p>

                {submitAlert && (
                  <div className={`support-widget-alert support-widget-alert-${submitAlert.type}`} style={{ marginBottom: 12 }}>
                    {submitAlert.type === 'success' ? <CheckIcon size={14} /> : <AlertIcon size={14} />}
                    <span>{submitAlert.text}</span>
                  </div>
                )}

                <form onSubmit={handleContactSubmit} noValidate>
                  <div className="support-widget-row">
                    <div className="support-widget-field">
                      <label>Full Name</label>
                      <input name="name" type="text" value={contactForm.name}
                        onChange={handleContactChange} placeholder="Your full name"
                        required disabled={submitting} />
                    </div>
                    <div className="support-widget-field">
                      <label>Email Address</label>
                      <input name="email" type="email" value={contactForm.email}
                        onChange={handleContactChange} placeholder="your@email.com"
                        required disabled={submitting} />
                    </div>
                  </div>
                  <div className="support-widget-field">
                    <label>Subject</label>
                    <input name="subject" type="text" value={contactForm.subject}
                      onChange={handleContactChange} placeholder="Brief description of your issue"
                      required disabled={submitting} />
                  </div>
                  <div className="support-widget-field">
                    <label>Message</label>
                    <textarea name="message" value={contactForm.message}
                      onChange={handleContactChange}
                      placeholder="Please describe your issue in as much detail as possible."
                      rows={3} required disabled={submitting} />
                  </div>
                  <button type="submit" className="support-widget-submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Support Request'}
                  </button>
                </form>

                <p className="sw-contact-direct">
                  Direct contact: <a href="mailto:agrathod0701@gmail.com">agrathod0701@gmail.com</a>
                </p>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Footer */}
          <div className="support-widget-footer">
            GitPulse Support &middot; agrathod0701@gmail.com
          </div>
        </div>
      )}
    </>
  )
}
