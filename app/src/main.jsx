import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './styles/index.css'
import Home from './pages/Home'
import Resources from './pages/Resources'
import ChatPage from './pages/ChatPage'

function Shell(){
  return (<div className="min-h-screen gradient-bg">
    <header className="sticky top-0 z-20 bg-black/70 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-white hover:text-clinicMaroon transition">SBU Care Connect</Link>
        <nav className="flex gap-4 text-sm">
          <Link to="/" className="hover:text-clinicMaroon">Home</Link>
          <Link to="/resources" className="hover:text-clinicMaroon">Find Food Resources</Link>
          <Link to="/chat" className="hover:text-clinicMaroon">Nutrition Chat</Link>
        </nav>
      </div>
    </header>
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/resources" element={<Resources/>}/>
        <Route path="/chat" element={<ChatPage/>}/>
      </Routes>
    </main>
    <footer className="border-t border-white/10 py-6 text-center text-sm text-white/70">
      © {new Date().getFullYear()} SBU Care Connect — Temporary guidance, not medical advice.
    </footer>
  </div>)
}

createRoot(document.getElementById('root')).render(<BrowserRouter><Shell/></BrowserRouter>)
