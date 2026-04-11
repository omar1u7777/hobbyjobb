// git commit: "feat(landing): build full LandingPage with hero, categories, how-it-works, FAQ, and CTA"

import { useState } from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { icon: '🌿', label: 'Hem & Trädgård',    count: 342 },
  { icon: '🐶', label: 'Djur & Husdjur',     count: 128 },
  { icon: '🚛', label: 'Flytt & Transport',  count: 89  },
  { icon: '🔧', label: 'Handyman',           count: 215 },
  { icon: '💻', label: 'IT & Teknik',        count: 74  },
  { icon: '🧹', label: 'Städning',           count: 284 },
  { icon: '🛍️', label: 'Ärenden',            count: 153 },
  { icon: '🎨', label: 'Kreativt',           count: 61  },
  { icon: '📚', label: 'Undervisning',       count: 47  },
  { icon: '🏋️', label: 'Träning & Hälsa',   count: 38  },
];

const STEPS = [
  { icon: '🔍', title: 'Hitta ett jobb',       desc: 'Sök bland hundratals lokala hobbyuppdrag nära dig. Filtrera på kategori, avstånd och pris.' },
  { icon: '📨', title: 'Skicka en ansökan',    desc: 'Presentera dig själv och varför du passar. Beställaren väljer den bästa kandidaten.' },
  { icon: '✅', title: 'Slutför & betala',     desc: 'Gör jobbet, beställaren bekräftar klart — och betalningen frigörs automatiskt via Stripe.' },
];

const FAQS = [
  { q: 'Vad är hobbyverksamhet?',          a: 'Hobbyverksamhet är inkomst från aktiviteter du gör utan vinstsyfte och inte som huvudsyssla. Skatteverkets tumregel är max 30 000 kr/år.' },
  { q: 'Behöver jag deklarera intäkterna?', a: 'Ja — inkomster över avdragen kostnad ska deklareras. HobbyJobb hjälper dig hålla koll, men skatteansvar är alltid ditt eget.' },
  { q: 'Kostar det något att använda HobbyJobb?', a: 'Att hitta och ansöka på jobb är helt gratis. Vi tar en 8% provision när ett uppdrag slutförs via plattformen.' },
  { q: 'Hur fungerar betalningen?',         a: 'Bestellaren betalar via Stripe. Pengarna hålls i escrow tills uppdraget bekräftas klart, då frigörs 92% till dig automatiskt.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--dark) 0%, #1e3a8a 100%)',
        color: '#fff',
        padding: '80px 0 72px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative circles */}
        <div style={{ position:'absolute', top:-80, right:-80, width:400, height:400, borderRadius:'50%', background:'rgba(37,99,235,.15)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-60, left:-60, width:280, height:280, borderRadius:'50%', background:'rgba(96,165,250,.10)', pointerEvents:'none' }} />

        <div className="container" style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:720, margin:'0 auto', padding: '0 24px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.1)', borderRadius:20, padding:'6px 16px', fontSize:13, fontWeight:600, marginBottom:24, backdropFilter:'blur(6px)' }}>
            🔵 Juridiskt trygg hobbyplattform
          </div>

          <h1 style={{ fontSize:'clamp(32px,5vw,54px)', fontWeight:900, lineHeight:1.15, marginBottom:20, letterSpacing:'-0.02em' }}>
            Lokala smajobb — <br />
            <span style={{ color:'#60A5FA' }}>utan krångel</span>
          </h1>

          <p style={{ fontSize: 18, color:'#CBD5E1', lineHeight:1.7, marginBottom:36, maxWidth:520, margin:'0 auto 36px' }}>
            HobbyJobb kopplar ihop folk som behöver hjälp med dem som vill tjäna lite extra på hobbyn. Vi håller koll på inkomstgränsen åt dig.
          </p>

          {/* Search bar */}
          <div style={{ display:'flex', gap:12, maxWidth:560, margin:'0 auto 28px', flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:220, display:'flex', alignItems:'center', background:'#fff', borderRadius:8, padding:'0 16px', gap:10 }}>
              <span>🔍</span>
              <input
                placeholder="Sök jobb – t.ex. gräsklippning..."
                style={{ border:'none', outline:'none', background:'transparent', fontSize:15, color:'var(--dark)', padding:'13px 0', width:'100%' }}
              />
            </div>
            <Link to="/jobs" className="btn btn-primary btn-lg">Sök jobb</Link>
          </div>

          <p style={{ fontSize:13, color:'#94A3B8' }}>
            Över <strong style={{ color:'#fff' }}>1 200</strong> aktiva jobb · Helt gratis att ansöka
          </p>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <section style={{ padding:'64px 0', background:'var(--white)' }} id="kategorier">
        <div className="container">
          <h2 style={{ textAlign:'center', fontSize:28, fontWeight:800, marginBottom:8 }}>Bläddra efter kategori</h2>
          <p style={{ textAlign:'center', color:'var(--muted)', marginBottom:40 }}>Från gräsklippning till IT-stöd — allt på ett ställe.</p>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14 }}>
            {CATEGORIES.map(c => (
              <Link
                key={c.label}
                to={`/jobs?category=${encodeURIComponent(c.label)}`}
                style={{
                  background:'var(--bg)',
                  border:'1px solid var(--border)',
                  borderRadius:12,
                  padding:'20px 16px',
                  textAlign:'center',
                  textDecoration:'none',
                  color:'var(--dark)',
                  transition:'all .15s',
                  display:'block',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--blue)'; e.currentTarget.style.background='var(--blue-light)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg)'; e.currentTarget.style.transform='none'; }}
              >
                <div style={{ fontSize:32, marginBottom:8 }}>{c.icon}</div>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{c.label}</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>{c.count} jobb</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section style={{ padding:'64px 0', background:'var(--bg)' }} id="hur">
        <div className="container">
          <h2 style={{ textAlign:'center', fontSize:28, fontWeight:800, marginBottom:8 }}>Hur det fungerar</h2>
          <p style={{ textAlign:'center', color:'var(--muted)', marginBottom:48 }}>Tre enkla steg — från sökning till betalning.</p>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:28, maxWidth:900, margin:'0 auto' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ background:'var(--white)', borderRadius:14, border:'1px solid var(--border)', padding:28, position:'relative' }}>
                <div style={{ position:'absolute', top:20, right:20, fontSize:13, fontWeight:800, color:'var(--blue-soft)' }}>{String(i+1).padStart(2,'0')}</div>
                <div style={{ fontSize:36, marginBottom:16 }}>{s.icon}</div>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:8 }}>{s.title}</h3>
                <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOBBY INCOME METER ───────────────────────────────── */}
      <section style={{ padding:'64px 0', background:'var(--dark)', color:'#fff' }} id="hobbyinfo">
        <div className="container" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center', maxWidth:960, margin:'0 auto' }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--blue-soft)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>
              Juridiskt skyddad plattform
            </div>
            <h2 style={{ fontSize:32, fontWeight:900, lineHeight:1.2, marginBottom:16 }}>Vi håller koll på <span style={{ color:'#60A5FA' }}>inkomstgränsen</span> åt dig</h2>
            <p style={{ color:'#94A3B8', lineHeight:1.7, marginBottom:24 }}>
              Hobbyverksamhet får ge max 30 000 kr/år utan F-skatt. Vår inkomstmätare varnar dig automatiskt — och stoppar annonsering om gränsen nås.
            </p>
            <Link to="/hobbyinfo" className="btn btn-outline" style={{ color:'#fff', borderColor:'rgba(255,255,255,.3)' }}>
              Läs mer om hobbyreglerna →
            </Link>
          </div>

          <div style={{ background:'rgba(255,255,255,.05)', borderRadius:16, padding:28, border:'1px solid rgba(255,255,255,.1)' }}>
            <p style={{ fontSize:13, color:'#94A3B8', marginBottom:8 }}>Exempelanvändare · Innevarande år</p>
            <div style={{ fontSize:34, fontWeight:900, marginBottom:4 }}>18 450 kr</div>
            <p style={{ fontSize:13, color:'#64748B', marginBottom:18 }}>av max 30 000 kr</p>
            <div style={{ background:'rgba(255,255,255,.1)', height:12, borderRadius:6, overflow:'hidden', marginBottom:8 }}>
              <div style={{ width:'61.5%', height:'100%', background:'linear-gradient(90deg,var(--blue),#60A5FA)', borderRadius:6 }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#64748B' }}>
              <span>0 kr</span>
              <span style={{ color:'#F59E0B', fontWeight:700 }}>⚠️ 25 000 kr varning</span>
              <span>30 000 kr</span>
            </div>
          </div>
        </div>

        <style>{`@media(max-width:700px){.landing-split{grid-template-columns:1fr!important}}`}</style>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section style={{ padding:'64px 0', background:'var(--white)' }} id="faq">
        <div className="container" style={{ maxWidth:720, margin:'0 auto' }}>
          <h2 style={{ textAlign:'center', fontSize:28, fontWeight:800, marginBottom:8 }}>Vanliga frågor</h2>
          <p style={{ textAlign:'center', color:'var(--muted)', marginBottom:40 }}>Allt du behöver veta om HobbyJobb och hobbyverksamhet.</p>

          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {FAQS.map((f, i) => (
              <div key={i} style={{ borderBottom:'1px solid var(--border-light)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width:'100%', textAlign:'left', padding:'18px 0',
                    background:'none', border:'none', cursor:'pointer',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    fontSize:15, fontWeight:600, color:'var(--dark)',
                  }}
                >
                  {f.q}
                  <span style={{ color:'var(--blue)', fontSize:20, lineHeight:1, marginLeft:16, flexShrink:0 }}>
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                {openFaq === i && (
                  <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.7, paddingBottom:18 }}>{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ padding:'64px 0', background:'var(--blue)' }}>
        <div className="container" style={{ textAlign:'center', maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontSize:32, fontWeight:900, color:'#fff', marginBottom:16 }}>Redo att komma igång?</h2>
          <p style={{ color:'rgba(255,255,255,.8)', marginBottom:32, fontSize:16 }}>Skapa ett gratis konto och hitta ditt första uppdrag idag.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background:'#fff', color:'var(--blue)', fontWeight:700 }}>
              Skapa konto gratis
            </Link>
            <Link to="/jobs" className="btn btn-lg btn-outline" style={{ borderColor:'rgba(255,255,255,.4)', color:'#fff' }}>
              Bläddra jobb
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
