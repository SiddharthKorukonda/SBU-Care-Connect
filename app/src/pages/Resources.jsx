import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
const DefaultIcon = L.icon({ iconUrl, iconRetinaUrl, shadowUrl, iconSize:[25,41], iconAnchor:[12,41]})
L.Marker.prototype.options.icon = DefaultIcon
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5001'
function haversine(a,b,c,d){const R=6371;const dLat=(c-a)*Math.PI/180;const dLon=(d-b)*Math.PI/180;const s=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2;return 2*R*Math.atan2(Math.sqrt(s),Math.sqrt(1-s))}
export default function Resources(){
  const [providers,setProviders]=useState([])
  const [zip,setZip]=useState('11794')
  const [radius,setRadius]=useState(10)
  const [center,setCenter]=useState({lat:40.9135,lon:-73.1231})
  const [status,setStatus]=useState('')
  useEffect(()=>{fetch(`${API_BASE}/api/providers`).then(r=>r.json()).then(setProviders).catch(()=>{})},[])
  const results=useMemo(()=>providers.map(p=>({...p,distance:haversine(center.lat,center.lon,p.lat,p.lon)})).filter(p=>p.distance<=radius).sort((a,b)=>a.distance-b.distance),[providers,center,radius])
  const search=async(e)=>{e&&e.preventDefault();setStatus('Searching...');try{const r=await fetch(`${API_BASE}/api/geocode?query=${encodeURIComponent(zip)}`);const d=await r.json();if(d.found){setCenter({lat:d.lat,lon:d.lon});setStatus(`Found: ${d.display_name}`)}else setStatus('No results.')}catch{setStatus('Error contacting geocoder.')}}
  useEffect(()=>{search()},[])
  const pos=[center.lat,center.lon]
  return (<div className="space-y-6">
    <div><h1 className="text-3xl font-bold">Finding Food Resources</h1><p className="text-white/80">Locate nearby food banks and pantries in your community.</p></div>
    <div className="grid md:grid-cols-2 gap-4 items-start">
      <form onSubmit={search} className="card-glass p-4 space-y-3">
        <label className="block"><span className="text-sm text-white/70">ZIP code or address</span><input value={zip} onChange={e=>setZip(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-black/60 border border-white/20" placeholder="11794"/></label>
        <label className="block"><span className="text-sm text-white/70">Radius (km)</span><input type="range" min="1" max="50" value={radius} onChange={e=>setRadius(Number(e.target.value))} className="w-full"/><div className="text-sm text-white/70">{radius} km</div></label>
        <button className="px-4 py-2 rounded-lg bg-clinicMaroon hover:opacity-90">Search</button>
        <div className="text-sm text-white/70">{status}</div>
      </form>
      <div className="card-glass p-1">
        <MapContainer center={pos} zoom={11} style={{height:'420px',width:'100%'}}>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
          <Marker position={pos}><Popup>Search Center</Popup></Marker>
          <Circle center={pos} radius={radius*1000} pathOptions={{color:'#6b000d'}}/>
          {results.map((p,i)=>(<Marker key={i} position={[p.lat,p.lon]}><Popup><div className="space-y-1"><div className="font-semibold">{p.name}</div><div className="text-sm">{p.address}</div><div className="text-sm">Hours: {p.hours}</div><div className="text-sm">Phone: {p.phone}</div><div className="text-sm">~{p.distance.toFixed(1)} km away</div><div className="text-xs text-white/70">{p.notes}</div></div></Popup></Marker>))}
        </MapContainer>
      </div>
    </div>
    <div className="card-glass p-4">
      <h2 className="text-xl font-semibold mb-2">Results ({results.length})</h2>
      <ul className="space-y-3">{results.map((p,i)=>(<li key={i} className="p-3 rounded-lg bg-black/40 border border-white/10"><div className="flex items-center justify-between"><div><div className="font-semibold">{p.name}</div><div className="text-sm">{p.address}</div></div><div className="text-sm text-white/80">{p.distance.toFixed(1)} km</div></div><div className="text-sm text-white/70">Hours: {p.hours} • Phone: {p.phone}</div><div className="text-xs text-white/60">{p.notes}</div></li>))}</ul>
    </div>
  </div>)
}
