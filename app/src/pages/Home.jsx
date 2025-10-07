import React from 'react'
import ReviewCarousel from '../shared/ReviewCarousel'
import FAQ from '../shared/FAQ'
import EmailSignup from '../shared/EmailSignup'
import hero1 from '../assets/hero1.png'
import hero2 from '../assets/hero2.png'
import hero3 from '../assets/hero3.png'

export default function Home(){
  return (<div className="space-y-12">
    <section className="grid md:grid-cols-2 gap-6 items-center">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Temporary relief and food access, <span className="text-clinicMaroon">approved</span> by clinicians.
        </h1>
        <p className="text-white/80">Use this site to find pantry resources, get culturally conscious nutrition tips, and take the next best step while you wait.</p>
        <div className="flex gap-3">
          <a href="/resources" className="px-5 py-3 rounded-xl bg-clinicNavy hover:bg-clinicMaroon transition shadow-neon">Find food resources</a>
          <a href="/chat" className="px-5 py-3 rounded-xl border border-white/20 hover:border-clinicMaroon transition">Nutrition chat</a>
        </div>
        <ul className="text-sm text-white/70 list-disc pl-5 space-y-2">
          <li>Large fonts • High contrast • Simple flows</li>
          <li>Not a replacement for medical care</li>
          <li>Respects culture and dietary restrictions</li>
        </ul>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <img src={hero1} alt="" className="rounded-xl card-glass object-cover aspect-[4/3]" />
        <img src={hero2} alt="" className="rounded-xl card-glass object-cover aspect-[4/3]" />
        <img src={hero3} alt="" className="rounded-xl card-glass object-cover aspect-[4/3]" />
      </div>
    </section>
    <section className="grid md:grid-cols-3 gap-4">
      {['Immediate guidance','Food access made simple','Clinician-reviewed tips'].map((t,i)=>(
        <div key={i} className="card-glass p-5">
          <h3 className="text-xl font-semibold mb-2">{t}</h3>
          <p className="text-white/80">{i===0?'Actionable steps now.':i===1?'ZIP + radius search with map.':'Avoids diagnostic claims; safe patterns only.'}</p>
        </div>
      ))}
    </section>
    <section className="space-y-3">
      <div className="flex items-center gap-3"><div className="text-3xl">⭐️⭐️⭐️⭐️☆</div><div className="text-white/80">4.6 / 5 from patient satisfaction samples</div></div>
      <ReviewCarousel/>
    </section>
    <section><h2 className="text-2xl font-bold mb-3">FAQ</h2><FAQ/></section>
    <section className="card-glass p-6"><EmailSignup/></section>
  </div>)
}
