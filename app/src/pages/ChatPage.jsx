import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5001'

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm your nutrition and food access specialist. I'm here to help you with culturally conscious nutrition guidance, food resource connections, and personalized dietary recommendations. How can I assist you today?",
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)      // network busy
  const [typing, setTyping] = useState(false)  // typewriter in progress
  const abortTyping = useRef(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy, typing])

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  // Word-by-word typewriter (keeps whitespace and newlines intact)
  const typeOut = async (baseMessages, fullText, speedMs = 22) => {
    setTyping(true)
    abortTyping.current = false
    // start with an empty assistant bubble
    setMessages([...baseMessages, { role: 'assistant', content: '' }])

    // split into tokens that include whitespace so formatting remains natural
    const tokens = fullText.split(/(\s+)/)

    let acc = ''
    for (let i = 0; i < tokens.length; i++) {
      if (abortTyping.current) { acc = fullText; break }
      acc += tokens[i]
      setMessages(prev => {
        const copy = [...prev]
        const last = copy.length - 1
        copy[last] = { ...copy[last], content: acc }
        return copy
      })
      // small delay for the typing effect
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r => setTimeout(r, speedMs))
    }

    // ensure we end with the full text
    setMessages(prev => {
      const copy = [...prev]
      const last = copy.length - 1
      copy[last] = { ...copy[last], content: fullText }
      return copy
    })
    setTyping(false)
  }

  const send = async () => {
    const text = input.trim()
    if (!text || busy || typing) return

    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setBusy(true)

    try {
      const r = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })

      const raw = await r.text()
      let data
      try {
        data = JSON.parse(raw)
      } catch {
        throw new Error(`Non-JSON from server (status ${r.status}): ${raw.slice(0, 200)}`)
      }

      if (!r.ok) {
        const errMsg = data?.error || `HTTP ${r.status}`
        await typeOut(next, `**Sorry — there was a problem.**\n\n- ${errMsg}\n- Please try again in a moment.`, 14)
      } else {
        const answer = data?.answer || 'Sorry—there was a problem.'
        // Type the answer word-by-word
        await typeOut(next, answer, 20)
      }
    } catch (e) {
      console.error(e)
      await typeOut(
        next,
        '**Network error.**\n\n- Check that the backend is running at `VITE_API_BASE`.\n- Then try again.',
        14
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <h1 className="text-3xl font-bold">Nutrition Chat</h1>
          <p className="text-white/80">Culturally conscious nutrition guidance</p>
        </div>
        {(busy || typing) && (
          <button
            onClick={() => { abortTyping.current = true }}
            className="ml-auto px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/40 text-xs"
            title="Finish message instantly"
          >
            Skip typing
          </button>
        )}
      </div>

      <div className="card-glass p-4 h-[60vh] overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div
              className={`inline-block max-w-[720px] px-4 py-3 rounded-xl text-left ${
                m.role === 'user'
                  ? 'bg-clinicMaroon'
                  : 'bg-black/60 border border-white/10'
              }`}
            >
              {m.role === 'assistant' ? (
                <div className="markdown-body">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: (props) => <h1 className="text-2xl font-extrabold mt-3 mb-2" {...props} />,
                      h2: (props) => <h2 className="text-xl font-extrabold mt-3 mb-2" {...props} />,
                      h3: (props) => <h3 className="text-lg font-extrabold mt-3 mb-2" {...props} />,
                      p:  (props) => <p className="my-2 leading-relaxed text-white/90" {...props} />,
                      ul: (props) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                      ol: (props) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
                      li: (props) => <li className="my-0.5" {...props} />,
                      strong: (props) => <strong className="font-semibold text-base sm:text-lg" {...props} />,
                      em: (props) => <em className="italic" {...props} />,
                      a:  (props) => <a className="underline text-blue-300" target="_blank" {...props} />,
                      hr: (props) => <hr className="border-0 border-t border-white/20 my-3" {...props} />,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{m.content}</div>
              )}
            </div>
          </div>
        ))}
        {(busy || typing) && <div className="text-sm text-white/70">Assistant is thinking…</div>}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Tell me your dietary needs, restrictions, budget, and what foods you have on hand…"
          className="flex-1 min-h-[72px] px-3 py-2 rounded-xl bg-black/60 border border-white/20"
        />
        <button
          onClick={send}
          disabled={busy || typing}
          className="px-4 py-2 rounded-xl bg-clinicNavy hover:opacity-90 disabled:opacity-50"
        >
          Send
        </button>
      </div>

      <div className="text-xs text-white/60">
        General guidance only; not a substitute for clinical care. For emergencies, call 911.
      </div>
    </div>
  )
}
