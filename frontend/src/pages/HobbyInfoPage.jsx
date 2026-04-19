import { useState } from 'react';

/* ─── FAQ data ────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    question: 'Måste jag betala skatt?',
    answer:
      'Nej, inte om du tjänar under 30 000 kr per år. Hobbyverksamhet under den gränsen är skattefri enligt Skatteverkets tumregel. Du behöver dock ändå redovisa inkomsten i din deklaration om den överstiger dina avdragsgilla kostnader.',
  },
  {
    question: 'Vad händer om jag tjänar mer än 30 000 kr?',
    answer:
      'Om du överskrider 30 000 kr/år bör du anmäla till Skatteverket. Verksamheten kan då klassas som näringsverksamhet och kräva F-skatt och momsregistrering. HobbyJobb varnar dig automatiskt när du närmar dig gränsen.',
  },
  {
    question: 'Kan jag ha hobbyverksamhet vid sidan av ett vanligt jobb?',
    answer:
      'Ja, det är fullt möjligt att ha hobbyverksamhet parallellt med en anställning. Det viktiga är att hobbyinkomsten inte överskrider 30 000 kr/år och att det inte är din huvudinkomst.',
  },
  {
    question: 'Vilka typer av jobb räknas som hobbyverksamhet?',
    answer:
      'Tillfälliga uppdrag som gräsklippning, hundpromenad, flytt, enklare hantverk, städning och liknande räknas normalt som hobbyverksamhet — så länge de utförs oregelbundet och inte i vinstsyfte som huvudsyssla.',
  },
];

/* ─── FAQ accordion item ──────────────────────────────────── */
function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div
      style={{
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '18px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--dark)',
        }}
      >
        {item.question}
        <span
          style={{
            color: 'var(--blue)',
            fontSize: 20,
            lineHeight: 1,
            marginLeft: 16,
            flexShrink: 0,
          }}
        >
          {isOpen ? '−' : '+'}
        </span>
      </button>

      {isOpen && (
        <p
          style={{
            color: 'var(--muted)',
            fontSize: 14,
            lineHeight: 1.7,
            paddingBottom: 18,
          }}
        >
          {item.answer}
        </p>
      )}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function HobbyInfoPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main style={{ padding: '42px 0 72px' }}>
      <div className="container">

        {/* ── Hero / Rubrik ──────────────────────────────── */}
        <section
          className="card card-lg"
          style={{
            padding: '30px',
            background:
              'linear-gradient(130deg, rgba(37,99,235,.10) 0%, rgba(255,255,255,1) 58%), var(--white)',
            marginBottom: 20,
          }}
        >
          <span className="badge badge-blue" style={{ marginBottom: 14 }}>
            Hobbyverksamhet i Sverige
          </span>

          <h1 style={{ fontSize: 30, lineHeight: 1.2, fontWeight: 800, marginBottom: 10 }}>
            Hobbyverksamhet — Vad gäller?
          </h1>

          <p style={{ color: 'var(--ink)', maxWidth: 780, lineHeight: 1.75, marginBottom: 18 }}>
            HobbyJobb hjälper dig att ta mindre uppdrag på ett ansvarsfullt sätt. Här hittar du
            en sammanfattning av Skatteverkets regler — men sidan ersätter inte officiell juridisk
            information.
          </p>

          <a
            className="btn btn-primary"
            href="https://www.skatteverket.se/privat/skatter/inkomst/hobbyverksamhet"
            target="_blank"
            rel="noreferrer"
          >
            Läs hos Skatteverket →
          </a>
        </section>

        {/* ── Sektion 1: Vad är hobbyverksamhet? ──────────── */}
        <section className="section" style={{ marginBottom: 20 }}>
          <div className="section-hdr">
            <h2>Vad är hobbyverksamhet?</h2>
          </div>

          <div
            className="card"
            style={{ padding: '20px 24px', borderLeft: '4px solid var(--blue)' }}
          >
            <p style={{ color: 'var(--ink)', lineHeight: 1.8, marginBottom: 12 }}>
              Hobbyverksamhet är inkomstbringande aktivitet som du bedriver{' '}
              <strong>utan vinstsyfte</strong> och som <strong>inte är din huvudsyssla</strong>.
              Typiska exempel är gräsklippning, hundpromenad, enklare hantverk eller tillfälliga
              transportuppdrag.
            </p>
            <p style={{ color: 'var(--ink)', lineHeight: 1.8, marginBottom: 12 }}>
              Enligt Skatteverkets tumregel får du tjäna upp till{' '}
              <strong>30 000 kr per år</strong> inom hobbyverksamhet utan att behöva registrera
              F-skatt eller momsregistrera dig.
            </p>
            <p style={{ color: 'var(--ink)', lineHeight: 1.8 }}>
              Du behöver <strong>ingen moms</strong> och <strong>ingen F-skatt</strong> så länge
              du håller dig under gränsen och inte driver verksamheten yrkesmässigt.
            </p>
          </div>
        </section>

        {/* ── Sektion 2: Regler ────────────────────────────── */}
        <section className="section" style={{ marginBottom: 20 }}>
          <div className="section-hdr">
            <h2>Regler att känna till</h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 14,
            }}
          >
            {/* Regel 1 */}
            <article
              className="card"
              style={{ padding: '18px 20px 20px', borderTop: '3px solid var(--blue)' }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>💰</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                Max 30 000 kr/år
              </h3>
              <p style={{ color: 'var(--ink)', fontSize: 14, lineHeight: 1.7 }}>
                Skatteverkets tumregel tillåter hobbyinkomst upp till 30 000 kr per kalenderår
                utan F-skatt. HobbyJobb spärrar automatiskt annonsering när gränsen nås.
              </p>
            </article>

            {/* Regel 2 */}
            <article
              className="card"
              style={{ padding: '18px 20px 20px', borderTop: '3px solid var(--blue)' }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>🏠</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                Inte din huvudinkomst
              </h3>
              <p style={{ color: 'var(--ink)', fontSize: 14, lineHeight: 1.7 }}>
                Hobbyverksamhet får inte vara din primära inkomstkälla. Om det blir varaktigt
                och tydligt vinstdrivande kan Skatteverket klassa det som näringsverksamhet.
              </p>
            </article>

            {/* Regel 3 */}
            <article
              className="card"
              style={{ padding: '18px 20px 20px', borderTop: '3px solid var(--blue)' }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>🔧</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                Ingen dyr yrkesmässig utrustning
              </h3>
              <p style={{ color: 'var(--ink)', fontSize: 14, lineHeight: 1.7 }}>
                Verksamheten ska inte kräva stor professionell utrustningsinvestering.
                Tillfälliga uppdrag med normalt hushållsmaterial är okej.
              </p>
            </article>
          </div>
        </section>

        {/* ── Sektion 3: FAQ ───────────────────────────────── */}
        <section className="section" style={{ marginBottom: 20 }}>
          <div className="section-hdr">
            <h2>Vanliga frågor</h2>
          </div>

          <div
            className="card"
            style={{ padding: '4px 24px 8px', maxWidth: 720 }}
          >
            {FAQ_ITEMS.map((item, index) => (
              <FaqItem
                key={item.question}
                item={item}
                isOpen={index === openFaq}
                onToggle={() =>
                  setOpenFaq((curr) => (curr === index ? null : index))
                }
              />
            ))}
          </div>
        </section>

        {/* ── Sektion 4: Länk till Skatteverket ───────────── */}
        <section
          className="card"
          style={{
            padding: '24px 28px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
              Officiell information från Skatteverket
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
              Regler kan ändras — läs alltid senaste informationen direkt hos Skatteverket
              och tolka dem utifrån din individuella situation.
            </p>
          </div>
          <a
            className="btn btn-primary"
            href="https://www.skatteverket.se/privat/skatter/inkomst/hobbyverksamhet"
            target="_blank"
            rel="noreferrer"
            style={{ flexShrink: 0 }}
          >
            Gå till Skatteverket →
          </a>
        </section>

        <p style={{ marginTop: 16, color: 'var(--muted)', fontSize: 12 }}>
          Senast uppdaterad: april 2026. Informationen är generell och utgör inte
          individuell skatterådgivning.
        </p>
      </div>
    </main>
  );
}
