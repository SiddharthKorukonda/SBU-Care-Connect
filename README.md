SBU Care Connect — Electron + React + Tailwind + Flask

Run backend:
  cd server
  python -m venv .venv
  source .venv/bin/activate  (Windows: .venv\Scripts\Activate.ps1)
  pip install -r requirements.txt
  cp .env.example .env   # paste your OPENAI_API_KEY
  python app.py          # http://127.0.0.1:5001

Run frontend:
  cd app
  npm install
  npm run dev            # opens Electron to http://localhost:5173

Maps: Leaflet + OpenStreetMap tiles (no key). Geocoding via Nominatim (no key).
Switch to Mapbox/Geoapify/Google later if desired.
