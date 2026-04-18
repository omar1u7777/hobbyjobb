import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatWindow from '../components/chat/ChatWindow.jsx';

const CURRENT_USER_ID = 'u-me';

const INITIAL_CONVERSATIONS = [
  {
    id: 'c-101',
    jobId: '101',
    jobTitle: 'Grassklippning och kantskarning',
    participant: { id: 'u-anna', name: 'Anna L.' },
    unread: 0,
    updatedAt: '2026-04-18T14:20:00.000Z',
    messages: [
      {
        id: 'm-1',
        senderId: 'u-anna',
        text: 'Hej! Kan du komma pa lordag kl 10?',
        sentAt: '2026-04-18T13:20:00.000Z',
      },
      {
        id: 'm-2',
        senderId: CURRENT_USER_ID,
        text: 'Ja, det funkar bra for mig.',
        sentAt: '2026-04-18T13:24:00.000Z',
      },
    ],
  },
  {
    id: 'c-202',
    jobId: '202',
    jobTitle: 'IKEA-montering av 3 mobler',
    participant: { id: 'u-bjorn', name: 'Bjorn K.' },
    unread: 2,
    updatedAt: '2026-04-18T16:10:00.000Z',
    messages: [
      {
        id: 'm-3',
        senderId: 'u-bjorn',
        text: 'Toppen, da ses vi imorgon eftermiddag.',
        sentAt: '2026-04-18T15:55:00.000Z',
      },
      {
        id: 'm-4',
        senderId: 'u-bjorn',
        text: 'Ta garna med skruvdragare om du har.',
        sentAt: '2026-04-18T16:10:00.000Z',
      },
    ],
  },
  {
    id: 'c-303',
    jobId: '303',
    jobTitle: 'Hundpromenad 2 ganger i veckan',
    participant: { id: 'u-maria', name: 'Maria S.' },
    unread: 1,
    updatedAt: '2026-04-17T19:45:00.000Z',
    messages: [
      {
        id: 'm-5',
        senderId: CURRENT_USER_ID,
        text: 'Perfekt, jag kan borja pa mandag.',
        sentAt: '2026-04-17T19:35:00.000Z',
      },
      {
        id: 'm-6',
        senderId: 'u-maria',
        text: 'Toppen! Jag skickar adress i morgon.',
        sentAt: '2026-04-17T19:45:00.000Z',
      },
    ],
  },
];

function formatLastSeen(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const sameDay = now.toDateString() === date.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
}

export default function ChatPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);

  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [conversations]
  );

  const selectedConversation = useMemo(() => {
    if (jobId) {
      const match = conversations.find((conversation) => conversation.jobId === jobId);
      if (match) return match;
    }

    return sortedConversations[0] || null;
  }, [conversations, sortedConversations, jobId]);

  const handleSelectConversation = (conversation) => {
    navigate(`/chatt/${conversation.jobId}`);

    setConversations((prev) =>
      prev.map((item) =>
        item.id === conversation.id
          ? {
              ...item,
              unread: 0,
            }
          : item
      )
    );
  };

  const handleSend = (text) => {
    if (!selectedConversation) return;

    const now = new Date().toISOString();
    const newMessage = {
      id: `m-${Date.now()}`,
      senderId: CURRENT_USER_ID,
      text,
      sentAt: now,
    };

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              messages: [...conversation.messages, newMessage],
              updatedAt: now,
            }
          : conversation
      )
    );
  };

  return (
    <main style={{ padding: '36px 0 64px' }}>
      <div className="container">
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Meddelanden</h1>
          <p style={{ color: 'var(--muted)' }}>Chatt med mock-data. API-koppling laggs till senare.</p>
        </div>

        <section className="chat-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
          <aside className="card" style={{ overflow: 'hidden' }}>
            <header style={{ borderBottom: '1px solid var(--border)', padding: '14px 16px' }}>
              <h2 style={{ fontSize: 16 }}>Konversationer</h2>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sortedConversations.map((conversation) => {
                const isSelected = selectedConversation?.id === conversation.id;
                const lastMessage = conversation.messages[conversation.messages.length - 1];

                return (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    style={{
                      border: 'none',
                      borderBottom: '1px solid var(--border-light)',
                      background: isSelected ? 'var(--blue-light)' : 'var(--white)',
                      textAlign: 'left',
                      padding: '12px 14px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 700 }}>{conversation.participant.name}</p>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{formatLastSeen(conversation.updatedAt)}</span>
                    </div>

                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, marginBottom: 4 }}>{conversation.jobTitle}</p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <p
                        style={{
                          fontSize: 12,
                          color: 'var(--ink)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '210px',
                        }}
                      >
                        {lastMessage?.text || 'Inga meddelanden'}
                      </p>

                      {conversation.unread > 0 ? (
                        <span
                          style={{
                            minWidth: 18,
                            height: 18,
                            borderRadius: 999,
                            background: 'var(--red)',
                            color: '#fff',
                            fontSize: 11,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 6px',
                          }}
                        >
                          {conversation.unread}
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <ChatWindow
            conversation={selectedConversation}
            currentUserId={CURRENT_USER_ID}
            onSend={handleSend}
          />
        </section>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .chat-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
