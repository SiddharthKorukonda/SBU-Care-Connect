import React, {useEffect, useRef, useState} from 'react'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5001'
export default function ChatPage(){
  const [messages,setMessages]=useState([{role:'assistant',content:"Hello! I'm your nutrition and food access specialist. I'm here to help you with culturally conscious nutrition guidance, food resource connections, and personalized dietary recommendations. How can I assist you today?"}])
  const [input,setInput]=useState(''); const [busy,setBusy]=useState(false); const s=useRef(null)
  useEffect(()=>{s.current?.scrollIntoView({behavior:'smooth',block:'end'})},[messages,busy])
  const send=async()=>{if(!input.trim())return;const next=[...messages,{role:'user',content:input.trim()}];setMessages(next);setInput('');setBusy(true);try{const r=await fetch(`${API_BASE}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:next})});const d=await r.json();setMessages([...next,{role:'assistant',content:d.answer||'Sorry—there was a problem.'}])}catch{setMessages([...next,{role:'assistant',content:'Network error.'}])}finally{setBusy(false)}}
  const onKey=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}
  return (<div className="space-y-4"><div><h1 className="text-3xl font-bold">Nutrition Chat</h1><p className="text-white/80">Culturally conscious nutrition guidance</p></div>
    <div className="card-glass p-4 h-[60vh] overflow-y-auto">{messages.map((m,i)=>(<div key={i} className={`mb-3 ${m.role==='user'?'text-right':'text-left'}`}><div className={`inline-block px-3 py-2 rounded-xl ${m.role==='user'?'bg-clinicMaroon':'bg-black/60 border border-white/10'}`}>{m.content}</div></div>))}{busy&&<div className="text-sm text-white/70">Assistant is thinking…</div>}<div ref={s}/></div>
    <div className="flex gap-2"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey} placeholder="Tell me your dietary needs, restrictions, budget, and what foods you have on hand…" className="flex-1 min-h-[64px] px-3 py-2 rounded-xl bg-black/60 border border-white/20"></textarea><button onClick={send} disabled={busy} className="px-4 py-2 rounded-xl bg-clinicNavy hover:opacity-90 disabled:opacity-50">Send</button></div>
    <div className="text-xs text-white/60">General guidance only; not a substitute for clinical care. For emergencies, call 911.</div></div>)
}
