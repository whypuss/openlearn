import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
        {/* Warm background blobs */}
        <div className="absolute top-0 right-0 warm-blob-1" style={{top: '-100px', right: '-100px'}} />
        <div className="absolute bottom-0 left-0 warm-blob-2" style={{bottom: '-80px', left: '-80px'}} />

        <div className="relative z-10 max-w-3xl mx-auto text-center animate-slide-up">

          {/* Badge */}
          <div className="badge mb-8">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            100% Open Source — MIT License
          </div>

          {/* Illustration */}
          <div className="mb-8 flex justify-center">
            <svg width="280" height="200" viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Books stack */}
              <rect x="20" y="130" width="80" height="14" rx="3" fill="#F97316" opacity="0.9"/>
              <rect x="20" y="116" width="80" height="14" rx="3" fill="#FB923C" opacity="0.85"/>
              <rect x="20" y="102" width="80" height="14" rx="3" fill="#FDBA74" opacity="0.8"/>
              {/* Brain / lightbulb */}
              <ellipse cx="180" cy="100" rx="55" ry="55" fill="#FFF5EB"/>
              <ellipse cx="180" cy="100" rx="40" ry="40" fill="#FED7AA"/>
              <ellipse cx="180" cy="100" rx="28" ry="28" fill="#F97316" opacity="0.15"/>
              <text x="180" y="108" textAnchor="middle" fontSize="36">🧠</text>
              {/* Cards flying */}
              <rect x="100" y="40" width="60" height="42" rx="6" fill="white" stroke="#E8DDD3" strokeWidth="1.5"/>
              <rect x="105" y="48" width="50" height="6" rx="2" fill="#F97316" opacity="0.5"/>
              <rect x="105" y="58" width="40" height="4" rx="2" fill="#E8DDD3"/>
              <rect x="105" y="66" width="45" height="4" rx="2" fill="#E8DDD3"/>
              <rect x="140" y="55" width="60" height="42" rx="6" fill="white" stroke="#E8DDD3" strokeWidth="1.5" transform="rotate(8 140 55)"/>
              <rect x="145" y="63" width="50" height="6" rx="2" fill="#FBBF24" opacity="0.5"/>
              <rect x="145" y="73" width="40" height="4" rx="2" fill="#E8DDD3"/>
              <rect x="145" y="81" width="45" height="4" rx="2" fill="#E8DDD3"/>
              <rect x="118" y="68" width="60" height="42" rx="6" fill="white" stroke="#E8DDD3" strokeWidth="1.5" transform="rotate(-5 118 68)"/>
              <rect x="123" y="76" width="50" height="6" rx="2" fill="#22C55E" opacity="0.5"/>
              <rect x="123" y="86" width="40" height="4" rx="2" fill="#E8DDD3"/>
              <rect x="123" y="94" width="45" height="4" rx="2" fill="#E8DDD3"/>
              {/* Sparkles */}
              <circle cx="230" cy="60" r="4" fill="#F97316" opacity="0.6"/>
              <circle cx="240" cy="80" r="3" fill="#FBBF24" opacity="0.5"/>
              <circle cx="225" cy="90" r="2.5" fill="#F97316" opacity="0.4"/>
              <circle cx="50" cy="80" r="3" fill="#F97316" opacity="0.5"/>
              <circle cx="40" cy="60" r="2" fill="#FBBF24" opacity="0.4"/>
              {/* Stars */}
              <path d="M250 120 L252 126 L258 126 L253 130 L255 136 L250 132 L245 136 L247 130 L242 126 L248 126 Z" fill="#FBBF24" opacity="0.7"/>
              <path d="M30 140 L31.5 144.5 L36.5 144.5 L32.5 147.5 L34 152 L30 149 L26 152 L27.5 147.5 L23.5 144.5 L28.5 144.5 Z" fill="#F97316" opacity="0.5"/>
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl font-bold mb-5 leading-tight text-[#3D2C1E]">
            OpenLearn
          </h1>

          <p className="text-lg sm:text-xl text-[#A89585] mb-3 leading-relaxed font-medium">
            From source to mastery, open forever.
          </p>
          <p className="text-base text-[#D6C5B5] mb-12 max-w-xl mx-auto leading-relaxed">
            Your AI knowledge workspace. Upload anything — PDF, YouTube, web, text.
            AI generates flashcards. SM-2 drives retention. All in your browser.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/decks"
              className="px-8 py-4 bg-[#F97316] hover:bg-[#FB923C] rounded-xl font-semibold text-base text-white transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Start Learning — Free
            </Link>
            <Link
              href="/import"
              className="px-8 py-4 bg-white hover:bg-[#FFF5EB] border-2 border-[#E8DDD3] hover:border-[#F97316] rounded-xl font-semibold text-base text-[#3D2C1E] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import PDF
            </Link>
            <Link
              href="/settings"
              className="px-8 py-4 bg-white hover:bg-[#FFF5EB] border-2 border-[#E8DDD3] hover:border-[#F97316] rounded-xl font-semibold text-base text-[#3D2C1E] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configure AI
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section className="px-6 py-20 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger">

          {/* Card 1 - Ingestion */}
          <div className="card-flat p-6 animate-slide-up">
            {/* Illustration */}
            <div className="mb-4 rounded-xl overflow-hidden" style={{background: '#FFF5EB', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width="160" height="100" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Document */}
                <rect x="20" y="15" width="50" height="65" rx="5" fill="white" stroke="#E8DDD3" strokeWidth="1.5"/>
                <rect x="28" y="28" width="34" height="4" rx="2" fill="#E8DDD3"/>
                <rect x="28" y="36" width="28" height="4" rx="2" fill="#E8DDD3"/>
                <rect x="28" y="44" width="32" height="4" rx="2" fill="#E8DDD3"/>
                <rect x="28" y="52" width="20" height="4" rx="2" fill="#FED7AA"/>
                {/* PDF badge */}
                <rect x="20" y="10" width="28" height="12" rx="3" fill="#F97316"/>
                <text x="34" y="19" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">PDF</text>
                {/* YouTube icon */}
                <rect x="95" y="25" width="45" height="32" rx="5" fill="#FF0000" opacity="0.1"/>
                <path d="M117.5 34L108 42.5L117.5 51V34Z" fill="#FF0000"/>
                {/* Web globe */}
                <circle cx="117" cy="70" r="18" fill="#FFF0E6" stroke="#E8DDD3" strokeWidth="1.5"/>
                <ellipse cx="117" cy="70" rx="7" ry="18" fill="none" stroke="#E8DDD3" strokeWidth="1"/>
                <line x1="99" y1="70" x2="135" y2="70" stroke="#E8DDD3" strokeWidth="1"/>
                <line x1="99" y1="62" x2="135" y2="62" stroke="#E8DDD3" strokeWidth="1"/>
                <line x1="99" y1="78" x2="135" y2="78" stroke="#E8DDD3" strokeWidth="1"/>
              </svg>
            </div>
            <h3 className="font-semibold text-base mb-2 text-[#3D2C1E]">Multi-format Ingestion</h3>
            <p className="text-sm text-[#A89585] leading-relaxed mb-4">
              PDF, YouTube, web pages, plain text — one click to extract knowledge from any source.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["PDF", "YouTube", "Web", "Text"].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-lg bg-[#FFF5EB] text-[#A89585] text-xs font-medium border border-[#E8DDD3]">{t}</span>
              ))}
            </div>
          </div>

          {/* Card 2 - AI */}
          <div className="card-flat p-6 animate-slide-up">
            <div className="mb-4 rounded-xl overflow-hidden" style={{background: '#FFF5EB', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width="160" height="100" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Sparkle/star */}
                <path d="M80 20 L84 35 L99 35 L87 45 L91 60 L80 50 L69 60 L73 45 L61 35 L76 35 Z" fill="#FBBF24" opacity="0.8"/>
                {/* Robot/brain */}
                <ellipse cx="80" cy="72" rx="40" ry="25" fill="white" stroke="#E8DDD3" strokeWidth="1.5"/>
                <circle cx="65" cy="68" r="5" fill="#F97316"/>
                <circle cx="80" cy="68" r="5" fill="#F97316"/>
                <circle cx="95" cy="68" r="5" fill="#F97316"/>
                <path d="M65 80 Q80 88 95 80" stroke="#F97316" strokeWidth="2" fill="none" strokeLinecap="round"/>
                {/* Sparkles */}
                <circle cx="45" cy="40" r="3" fill="#FBBF24"/>
                <circle cx="118" cy="35" r="2.5" fill="#F97316" opacity="0.7"/>
                <circle cx="30" cy="65" r="2" fill="#FBBF24" opacity="0.6"/>
                <circle cx="130" cy="60" r="2" fill="#F97316" opacity="0.5"/>
              </svg>
            </div>
            <h3 className="font-semibold text-base mb-2 text-[#3D2C1E]">AI Flashcard Generation</h3>
            <p className="text-sm text-[#A89585] leading-relaxed mb-4">
              Paste text, hit generate. AI creates optimized questions from your content instantly.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["GPT-4o", "Claude", "Ollama", "Groq"].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-lg bg-[#FFF5EB] text-[#A89585] text-xs font-medium border border-[#E8DDD3]">{t}</span>
              ))}
            </div>
          </div>

          {/* Card 3 - SM-2 */}
          <div className="card-flat p-6 animate-slide-up">
            <div className="mb-4 rounded-xl overflow-hidden" style={{background: '#FFF5EB', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width="160" height="100" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Calendar/schedule */}
                <rect x="30" y="25" width="100" height="75" rx="8" fill="white" stroke="#E8DDD3" strokeWidth="1.5"/>
                <rect x="30" y="25" width="100" height="20" rx="8" fill="#F97316"/>
                <rect x="30" y="37" width="100" height="8" fill="#F97316"/>
                <text x="80" y="38" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">SM-2</text>
                {/* Day dots */}
                {[15,30,45,60,75,90].map((x,i) => (
                  <circle key={i} cx={x} cy="65" r="6" fill={i < 3 ? '#F97316' : '#E8DDD3'}/>
                ))}
                <text x="80" y="88" textAnchor="middle" fontSize="9" fill="#A89585">Review Schedule</text>
              </svg>
            </div>
            <h3 className="font-semibold text-base mb-2 text-[#3D2C1E]">SM-2 Spaced Repetition</h3>
            <p className="text-sm text-[#A89585] leading-relaxed mb-4">
              The classic proven scheduling algorithm. Never forget what you learn.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["SM-2", "Again", "Hard", "Good", "Easy"].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-lg bg-[#FFF5EB] text-[#A89585] text-xs font-medium border border-[#E8DDD3]">{t}</span>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="px-6 py-16 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2 text-[#3D2C1E]">How it works</h2>
          <p className="text-sm text-[#A89585]">Three steps to long-term retention</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {[
            {
              step: "01",
              title: "Add your source",
              desc: "Upload a PDF, paste a YouTube link, or type any text you want to learn from.",
              accent: "#F97316",
              bg: "#FFF5EB",
            },
            {
              step: "02",
              title: "Generate cards",
              desc: "AI analyzes your content and auto-generates high-quality flashcards with hints.",
              accent: "#FBBF24",
              bg: "#FEF9C3",
            },
            {
              step: "03",
              title: "Review daily",
              desc: "SM-2 schedules each card at the optimal moment. Flip, rate, remember forever.",
              accent: "#22C55E",
              bg: "#DCFCE7",
            },
          ].map(({ step, title, desc, accent, bg }) => (
            <div key={step} className="text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-black text-lg shadow-sm"
                style={{ background: accent }}
              >
                {step}
              </div>
              <h3 className="font-semibold text-base mb-2 text-[#3D2C1E]">{title}</h3>
              <p className="text-sm text-[#A89585] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t-2 border-[#E8DDD3] px-6 py-8 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#A89585]">
            <div className="w-5 h-5 rounded-md bg-[#F97316] flex items-center justify-center text-[10px] font-bold text-white">OL</div>
            OpenLearn — Open Source AI Knowledge Workspace
          </div>
          <div className="flex items-center gap-4 text-xs text-[#D6C5B5]">
            <span>MIT License</span>
            <span>·</span>
            <a href="https://github.com/yourusername/openlearn" className="hover:text-[#A89585] transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
