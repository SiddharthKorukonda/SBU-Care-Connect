import React from 'react'
const REVIEWS=[
  {name:'Ayesha',text:'The pantry map helped me find a nearby spot open on Saturday.'},
  {name:'Luis',text:'Simple tips for low-sodium meals that kept my culture in mind.'},
  {name:'Mei',text:'The chat gave me easy snack swaps for my pre-diabetes.'},
  {name:'Sam',text:'Clear next steps while I waited to be seen—very helpful.'},
  {name:'Priya',text:'Loved the vegetarian-friendly ideas under $10/wk.'},
  {name:'Jon',text:'Great high-contrast UI. My grandmother could use it easily.'},
  {name:'Fatima',text:'Halal-friendly pantry suggestions were spot on.'},
  {name:'Dev',text:'It reminded me to hydrate and rest, and when to see a doctor.'},
]
export default function ReviewCarousel(){const items=[...REVIEWS,...REVIEWS];return(<div className="marquee card-glass p-4"><div className="marquee-track gap-4">{items.map((r,i)=>(<div key={i} className="min-w-[260px] max-w-[260px] p-4 rounded-lg bg-black/60 border border-white/10"><div className="font-semibold">{r.name}</div><div className="text-white/80 text-sm">{r.text}</div></div>))}</div></div>)}
