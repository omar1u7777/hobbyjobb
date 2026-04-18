import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const RULES = [
  {
    title: 'Hobbyinkomst upp till 30 000 kr/ar',
    description:
      'Plattformen ar byggd for hobbyverksamhet. Du far en varning nar du narmar dig gransen och annonsering stoppas vid uppnadd grans.',
    badge: 'Skatt',
  },
  {
    title: 'Momsregistrering vid hog omsattning',
    description:
      'Om verksamheten blir storre kan momsregistrering behovas. HobbyJobb visar tidiga varningar innan du nar kritiska nivaer.',
    badge: 'Moms',
  },
  {
    title: 'Ingen yrkesmassig verksamhet',
    description:
      'Tjansten ar inte till for foretagsdrift. Langsiktig och vinstdriven verksamhet ska bedrivas med korrekt foretagsform.',
    badge: 'Ansvar',
  },
  {
    title: 'Du ansvarar for dina uppgifter',
    description:
      'Som anvandare ansvarar du for att deklarera korrekt och folja Skatteverkets aktuella regler for din situation.',
    badge: 'Deklaration',
  },
];

const FAQ_ITEMS = [
  {
    question: 'Maste jag starta foretag for att anvanda HobbyJobb?',
    answer:
      'Nej, plattformen ar avsedd for hobbyverksamhet. Om din verksamhet blir varaktig och tydligt vinstdriven bor du utreda foretagsform och F-skatt.',
  },
  {
    question: 'Vad hander om jag nar inkomstgransen?',
    answer:
      'Systemet varnar i god tid. Nar gransen ar passerad kan du inte lagga upp nya jobb forran nasta period eller tills reglerna uppfylls igen.',
  },
  {
    question: 'Skoter HobbyJobb min deklaration?',
    answer:
      'Nej. Vi visar oversikt och varningar, men du ansvarar alltid sjalv for deklaration, kvitton och korrekt skattehantering.',
  },
  {
    question: 'Var hittar jag officiell information?',
    answer:
      'Las alltid senaste informationen direkt hos Skatteverket. Regler kan andras over tid och ska tolkas utifran din individuella situation.',
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <article
      style={{
        border: '1px solid var(--border)',
        borderRadius: 10,
        background: 'var(--white)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          border: 'none',
          textAlign: 'left',
          background: 'transparent',
          padding: '16px 18px',
          fontSize: 15,
          fontWeight: 700,
          color: 'var(--dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>{item.question}</span>
        <span style={{ color: 'var(--muted)', fontSize: 18 }}>{isOpen ? '-' : '+'}</span>
      </button>

      {isOpen && (
        <div
          style={{
            padding: '0 18px 16px',
            color: 'var(--ink)',
            fontSize: 14,
            lineHeight: 1.7,
            borderTop: '1px solid var(--border-light)',
          }}
        >
          {item.answer}
        </div>
      )}
    </article>
  );
}

export default function HobbyInfoPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <main style={{ padding: '42px 0 72px' }}>
      <div className="container">
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
            Regler, ansvar och tryggare hobbyjobb
          </h1>

          <p style={{ color: 'var(--ink)', maxWidth: 780, lineHeight: 1.75, marginBottom: 18 }}>
            HobbyJobb hjalper dig att ta mindre uppdrag pa ett ansvarsfullt satt. Sidan sammanfattar
            reglerna pa en enkel niva, men ersatter inte officiell juridisk information.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a
              className="btn btn-primary"
              href="https://www.skatteverket.se"
              target="_blank"
              rel="noreferrer"
            >
              Las hos Skatteverket
            </a>
            <Link to="/profil" className="btn btn-outline">
              Se min inkomstoversikt
            </Link>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 14,
            marginBottom: 20,
          }}
          className="hobby-rules-grid"
        >
          {RULES.map((rule) => (
            <article
              key={rule.title}
              className="card"
              style={{
                padding: '18px 18px 20px',
                borderLeft: '4px solid var(--blue)',
              }}
            >
              <span className="badge badge-blue" style={{ marginBottom: 8 }}>
                {rule.badge}
              </span>
              <h2 style={{ fontSize: 18, marginBottom: 8, lineHeight: 1.35 }}>{rule.title}</h2>
              <p style={{ color: 'var(--ink)', lineHeight: 1.7, fontSize: 14 }}>{rule.description}</p>
            </article>
          ))}
        </section>

        <section className="section" style={{ marginBottom: 18 }}>
          <div className="section-hdr">
            <h3>Snabb checklista innan du publicerar jobb</h3>
          </div>

          <ul style={{ display: 'grid', gap: 10 }}>
            <li style={listItemStyle}>Jag har last och forstatt hobbyreglerna.</li>
            <li style={listItemStyle}>Jag har kontroll pa min totala inkomst for aret.</li>
            <li style={listItemStyle}>Jag erbjuder tillfalliga uppdrag, inte foretagsverksamhet.</li>
            <li style={listItemStyle}>Jag sparar underlag for korrekt deklaration.</li>
          </ul>
        </section>

        <section className="section">
          <div className="section-hdr">
            <h3>Vanliga fragor</h3>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {FAQ_ITEMS.map((item, index) => (
              <FaqItem
                key={item.question}
                item={item}
                isOpen={index === openIndex}
                onToggle={() => setOpenIndex((curr) => (curr === index ? -1 : index))}
              />
            ))}
          </div>
        </section>

        <p style={{ marginTop: 16, color: 'var(--muted)', fontSize: 12 }}>
          Senast uppdaterad: april {currentYear}. Informationen ar generell och inte individuell
          skatteradgivning.
        </p>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hobby-rules-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

const listItemStyle = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '10px 12px',
  color: 'var(--ink)',
  fontSize: 14,
};
