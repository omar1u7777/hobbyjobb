import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import ChatWindow from '../components/chat/ChatWindow.jsx';
import { messageService } from '../services/messageService.js';

// Placeholder id used in seed data until backend messages API is connected.
// When API is live, `currentUserId` (from useAuth) replaces this in runtime.
const SEED_CURRENT_USER_ID = 'u-me';

const INITIAL_CONVERSATIONS = [
  {
    id: 'c-101',
    jobId: '101',
    jobTitle: 'Gräsklippning och kantskärning',
    participant: { id: 'u-anna', name: 'Anna L.' },
    unread: 0,
    updatedAt: '2026-04-18T14:20:00.000Z',
    messages: [
      {
        id: 'm-1',
        senderId: 'u-anna',
        text: 'Hej! Kan du komma på lördag kl 10?',
        sentAt: '2026-04-18T13:20:00.000Z',
      },
      {
        id: 'm-2',
        senderId: SEED_CURRENT_USER_ID,
        text: 'Ja, det funkar bra för mig.',
        sentAt: '2026-04-18T13:24:00.000Z',
      },
    ],
  },
  {
    id: 'c-202',
    jobId: '202',
    jobTitle: 'IKEA-montering av 3 möbler',
    participant: { id: 'u-bjorn', name: 'Björn K.' },
    unread: 2,
    updatedAt: '2026-04-18T16:10:00.000Z',
    messages: [
      {
        id: 'm-3',
        senderId: 'u-bjorn',
        text: 'Toppen, då ses vi imorgon eftermiddag.',
        sentAt: '2026-04-18T15:55:00.000Z',
      },
      {
        id: 'm-4',
        senderId: 'u-bjorn',
        text: 'Ta gärna med skruvdragare om du har.',
        sentAt: '2026-04-18T16:10:00.000Z',
      },
    ],
  },
  {
    id: 'c-303',
    jobId: '303',
    jobTitle: 'Hundpromenad 2 gånger i veckan',
    participant: { id: 'u-maria', name: 'Maria S.' },
    unread: 1,
    updatedAt: '2026-04-17T19:45:00.000Z',
    messages: [
      {
        id: 'm-5',
        senderId: SEED_CURRENT_USER_ID,
        text: 'Perfekt, jag kan börja på måndag.',
        sentAt: '2026-04-17T19:35:00.000Z',
      },
      {
        id: 'm-6',
        senderId: 'u-maria',
        text: 'Toppen! Jag skickar adressen imorgon.',
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

function hydrateMockConversations(activeUserId) {
  return INITIAL_CONVERSATIONS.map((conversation) => ({
    ...conversation,
    unread: Number(conversation.unread ?? 0),
    previewText: conversation.messages[conversation.messages.length - 1]?.text ?? '',
    messages: conversation.messages.map((message) => ({
      ...message,
      senderId: message.senderId === SEED_CURRENT_USER_ID ? activeUserId : message.senderId,
    })),
  }));
}

export default function ChatPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  // Use real user id when logged in, otherwise fall back to seed id for mock data
  const currentUserId = user?.id ?? SEED_CURRENT_USER_ID;
  const [conversations, setConversations] = useState(() => hydrateMockConversations(currentUserId));
  const [apiEnabled, setApiEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const [loadedJobIds, setLoadedJobIds] = useState(() => new Set());

  useEffect(() => {
    if (apiEnabled) return;
    setConversations(hydrateMockConversations(currentUserId));
  }, [currentUserId, apiEnabled]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapConversations() {
      if (!user?.id) {
        setApiEnabled(false);
        setConversations(hydrateMockConversations(currentUserId));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setChatError('');

      try {
        const apiConversations = await messageService.getConversations();
        if (cancelled) return;

        if (apiConversations.length > 0) {
          setApiEnabled(true);
          setConversations(apiConversations);
          setLoadedJobIds(new Set());
          return;
        }

        setApiEnabled(false);
        setConversations(hydrateMockConversations(currentUserId));
      } catch (_) {
        if (cancelled) return;
        setApiEnabled(false);
        setConversations(hydrateMockConversations(currentUserId));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    bootstrapConversations();
    return () => {
      cancelled = true;
    };
  }, [user?.id, currentUserId]);

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

  const loadConversationMessages = async (conversation, force = false) => {
    if (!conversation || !apiEnabled) return;

    const normalizedJobId = String(conversation.jobId);
    if (!force && loadedJobIds.has(normalizedJobId)) return;

    try {
      const messages = await messageService.getMessages(normalizedJobId);

      setConversations((prev) =>
        prev.map((item) =>
          item.jobId === normalizedJobId
            ? {
                ...item,
                messages,
                previewText: messages[messages.length - 1]?.text ?? item.previewText,
                updatedAt: messages[messages.length - 1]?.sentAt ?? item.updatedAt,
              }
            : item
        )
      );

      setLoadedJobIds((prev) => {
        const next = new Set(prev);
        next.add(normalizedJobId);
        return next;
      });
    } catch (_) {
      setChatError('Kunde inte hamta meddelanden just nu.');
    }
  };

  useEffect(() => {
    if (!selectedConversation || !apiEnabled) return;

    void loadConversationMessages(selectedConversation);

    if (selectedConversation.unread > 0) {
      setConversations((prev) =>
        prev.map((item) =>
          item.id === selectedConversation.id
            ? {
                ...item,
                unread: 0,
              }
            : item
        )
      );

      messageService.markConversationAsRead(selectedConversation.jobId).catch(() => {});
    }
  }, [selectedConversation?.id, apiEnabled]);

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

    if (apiEnabled) {
      messageService.markConversationAsRead(conversation.jobId).catch(() => {});
      void loadConversationMessages(conversation);
    }
  };

  const handleSend = async (text) => {
    if (!selectedConversation) return;

    const now = new Date().toISOString();

    if (apiEnabled && selectedConversation.participant?.id) {
      try {
        setIsSending(true);
        setChatError('');

        const sentMessage = await messageService.sendMessage({
          jobId: selectedConversation.jobId,
          receiverId: selectedConversation.participant.id,
          content: text,
        });

        const apiMessage = {
          id: sentMessage.id,
          senderId: sentMessage.senderId ?? currentUserId,
          text: sentMessage.text || text,
          sentAt: sentMessage.sentAt || now,
        };

        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === selectedConversation.id
              ? {
                  ...conversation,
                  messages: [...conversation.messages, apiMessage],
                  previewText: apiMessage.text,
                  updatedAt: apiMessage.sentAt,
                }
              : conversation
          )
        );

        setLoadedJobIds((prev) => {
          const next = new Set(prev);
          next.add(String(selectedConversation.jobId));
          return next;
        });
        return;
      } catch (error) {
        setChatError(error.message || 'Kunde inte skicka meddelandet.');
      } finally {
        setIsSending(false);
      }
    }

    const newMessage = {
      id: `m-${Date.now()}`,
      senderId: currentUserId,
      text,
      sentAt: now,
    };

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              messages: [...conversation.messages, newMessage],
              previewText: newMessage.text,
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
          <p style={{ color: 'var(--muted)' }}>
            {apiEnabled
              ? 'Chatt kopplad till API med fallback till mock-data vid behov.'
              : 'Chatt med mock-data. API-fallback aktiv.'}
          </p>
          {chatError ? (
            <p style={{ marginTop: 8, fontSize: 13, color: 'var(--red)' }}>{chatError}</p>
          ) : null}
        </div>

        <section className="chat-layout" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
          <aside className="card" style={{ overflow: 'hidden' }}>
            <header style={{ borderBottom: '1px solid var(--border)', padding: '14px 16px' }}>
              <h2 style={{ fontSize: 16 }}>Konversationer</h2>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {isLoading && sortedConversations.length === 0 ? (
                <p style={{ padding: '12px 14px', fontSize: 13, color: 'var(--muted)' }}>Laddar konversationer...</p>
              ) : null}

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
                        {lastMessage?.text || conversation.previewText || 'Inga meddelanden'}
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
            currentUserId={currentUserId}
            onSend={handleSend}
            isSending={isSending}
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
