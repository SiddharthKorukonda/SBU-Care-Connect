import os, json, requests
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

# Load the .env file that sits NEXT TO this file
load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

MODEL = os.getenv("MODEL", "gpt-4o-mini")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Friendly root so hitting / doesn't 404
@app.get("/")
def root():
    return {"ok": True, "message": "SBU Care Connect API. Try /api/providers or /api/chat."}, 200

# ---- Data files -------------------------------------------------------------
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
PROVIDERS_JSON = DATA_DIR / "providers.json"
SUBSCRIBERS_JSON = DATA_DIR / "subscribers.json"

if not SUBSCRIBERS_JSON.exists():
    SUBSCRIBERS_JSON.write_text("[]")

if not PROVIDERS_JSON.exists():
    PROVIDERS_JSON.write_text(json.dumps([
        {"name":"Stony Brook Nutrition Assistance","address":"100 Nicolls Rd, Stony Brook, NY 11794","lat":40.9135,"lon":-73.1231,"hours":"Mon–Fri 9:00–17:00","phone":"(631) 632-6000","notes":"Campus-affiliated resource hub."},
        {"name":"Long Island Cares – The Harry Chapin Food Bank","address":"10 Davids Dr, Hauppauge, NY 11788","lat":40.8344,"lon":-73.2148,"hours":"Mon–Fri 9:00–16:00","phone":"(631) 582-3663","notes":"Call ahead for distribution schedule."},
        {"name":"Island Harvest Food Bank","address":"126 Spagnoli Rd, Melville, NY 11747","lat":40.7762,"lon":-73.4142,"hours":"Mon–Fri 9:00–17:00","phone":"(631) 873-4775","notes":"Mobile pantry locations vary—check site."},
        {"name":"St. Gerard Majella Outreach Pantry","address":"300 Terryville Rd, Port Jefferson Station, NY 11776","lat":40.9177,"lon":-73.0502,"hours":"Tue–Thu 10:00–14:00","phone":"(631) 473-2900","notes":"Bring ID if available; assistance regardless."},
        {"name":"St. James R.C. Church Outreach","address":"429 NY-25A, Setauket- East Setauket, NY 11733","lat":40.9365,"lon":-73.1063,"hours":"Mon–Fri 10:00–15:00","phone":"(631) 941-4141","notes":"Food pantry and referrals."},
        {"name":"St. Paul’s Lutheran Church Pantry","address":"390 Patchogue Rd, Port Jefferson Station, NY 11776","lat":40.9120,"lon":-73.0582,"hours":"Sat 10:00–12:00","phone":"(631) 473-2236","notes":"Saturday distribution."},
        {"name":"St. Anselm’s Episcopal Church Pantry","address":"4 Buckingham Rd, Shoreham, NY 11786","lat":40.9445,"lon":-72.8874,"hours":"2nd & 4th Sat 10:00–12:00","phone":"(631) 744-7730","notes":"Check schedule before visiting."},
        {"name":"Light of Christ Pantry","address":"30 Chestnut St, Port Jefferson Station, NY 11776","lat":40.9150,"lon":-73.0462,"hours":"Wed 10:00–12:00","phone":"(631) 473-0165","notes":"Local community pantry."}
    ], indent=2))

# ---- API: providers & geocode ----------------------------------------------
@app.get("/api/providers")
def providers():
    return jsonify(json.loads(PROVIDERS_JSON.read_text()))

@app.get("/api/geocode")
def geocode():
    q = (request.args.get("query") or "").strip()
    if not q:
        return jsonify({"error":"missing query"}), 400
    try:
        r = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": q, "format": "json", "limit": 1, "addressdetails": 1},
            headers={"User-Agent":"sbu-care-connect/1.0"},
            timeout=10,
        )
        r.raise_for_status()
        arr = r.json()
        if not arr:
            return jsonify({"found": False}), 404
        item = arr[0]
        return jsonify({"found": True, "lat": float(item["lat"]), "lon": float(item["lon"]), "display_name": item.get("display_name","")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---- LLM (lazy client so server still starts if key missing) ----------------
SYSTEM_PROMPT = (
    "You are a culturally conscious nutrition and food access assistant for a university free clinic. "
    "Provide practical, low-cost diet guidance, recipe ideas, and pantry strategies. "
    "Respect dietary restrictions (vegetarian, religious, allergies) and culture. "
    "If the user describes symptoms or asks for medical advice, include a brief disclaimer that this is not a "
    "substitute for professional evaluation and suggest seeing a clinician. Provide clear, supportive guidance.\n\n"
    "FORMAT RULES (IMPORTANT):\n"
    "• Reply in Markdown.\n"
    "• Use section headers with '###' (e.g., '### General Guidelines', '### Meal Ideas', '### Pantry Strategies').\n"
    "• When listing multiple points, use bulleted lists ('- ') or numbered lists ('1.', '2.', ...).\n"
    "• Begin each bullet with a short **bold** label (e.g., '**Focus on Whole Foods:**') followed by a concise explanation.\n"
    "• Keep paragraphs short (1–3 sentences). Avoid a single giant block of text.\n"
)

def ask_llm(user_text: str) -> str:
    key = os.getenv("OPENAI_API_KEY")  # read at call time
    if not key:
        raise RuntimeError("OPENAI_API_KEY is not set in server/.env")
    client = OpenAI(api_key=key)
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_text}
        ],
        temperature=0.3,
    )
    return resp.choices[0].message.content.strip()

@app.post("/api/chat")
def chat():
    data = request.get_json(force=True, silent=True) or {}
    msgs = data.get("messages", [])
    text = ""
    for m in reversed(msgs):
        if m.get("role") == "user":
            text = m.get("content","")
            break
    if not text:
        text = data.get("question","")
    if not text:
        return jsonify({"error":"missing input"}), 400
    try:
        answer = ask_llm(text)
        return jsonify({"answer": answer})
    except Exception as e:
        # If key missing or OpenAI errors, return a helpful JSON error but keep server alive
        return jsonify({"error": str(e)}), 500

# ---- Subscribe --------------------------------------------------------------
@app.post("/api/subscribe")
def subscribe():
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if "@" not in email:
        return jsonify({"ok": False, "error": "invalid email"}), 400
    subs = json.loads(SUBSCRIBERS_JSON.read_text())
    if email not in subs:
        subs.append(email)
        SUBSCRIBERS_JSON.write_text(json.dumps(subs, indent=2))
    return jsonify({"ok": True})

if __name__ == "__main__":
    # If 5001 is busy, change to 5050 here and in the frontend env if needed
    app.run(host="127.0.0.1", port=5001, debug=True)
