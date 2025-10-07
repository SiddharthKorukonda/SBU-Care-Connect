import React from 'react'
const QA=[
  {q:'Is this medical advice?',a:'No. This is temporary, general nutrition guidance and resource navigation. Always follow clinician advice.'},
  {q:'How are tips reviewed?',a:'We follow clinic-approved patterns (hydration, gentle foods, cultural accommodations) and avoid diagnostics.'},
  {q:'Do I need to sign up?',a:'No. You can search resources and chat without an account.'},
  {q:'Is my data stored?',a:'Your email is stored only if you subscribe. Chat history is not persisted in this demo.'},
]
export default function FAQ(){return(<div className="grid md:grid-cols-2 gap-3">{QA.map((x,i)=>(<details key={i} className="card-glass p-4"><summary className="cursor-pointer font-semibold">{x.q}</summary><p className="mt-2 text-white/80">{x.a}</p></details>))}</div>)}
