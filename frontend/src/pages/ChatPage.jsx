import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import ChatWindow from '../components/chat/ChatWindow.jsx';
import { messageService } from '../services/messageService.js';

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
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const [loadedJobIds, setLoadedJobIds] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;

    async function bootstrapConversations() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setChatError('');

      try {
        const apiConversations = await messageService.getConversations();
        if (cancelled) return;

        setConversations(apiConversations);
        setLoadedJobIds(new Set());
      } catch (error) {
        if (cancelled) return;
        setChatError('Kunde inte hämta dina konversationer. Databasen kan vara nere.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    bootstrapConversations();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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
    if (!conversation) return;

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
      setChatError('Kunde inte hämta meddelanden just nu.');
    }
  };

  useEffect(() => {
    if (!selectedConversation) return;

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
  }, [selectedConversation?.id]);

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

    messageService.markConversationAsRead(conversation.jobId).catch(() => {});
    void loadConversationMessages(conversation);
  };

  const handleSend = async (text) => {
    if (!selectedConversation || !selectedConversation.participant?.id) return;

    const now = new Date().toISOString();

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
    } catch (error) {
      setChatError(error.message || 'Kunde inte skicka meddelandet.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main style={{ padding: '40px 0 80px', background: 'var(--bg-light)', minHeight: 'calc(100vh - var(--nav-h))' }}>
      <div className="container">
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>Meddelanden</h1>
            <p style={{ color: 'var(--muted)', fontSize: 15 }}>
              Chatt kopplad till API. Håll kontakten med dina uppdragsgivare.
            </p>
          </div>
          {chatError ? (
            <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
              {chatError}
            </div>
          ) : null}
        </div>

        <section className="chat-layout" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>
          <aside style={{ 
            background: 'rgba(255, 255, 255, 0.7)', 
            backdropFilter: 'blur(20px)', 
            borderRadius: 24, 
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            height: 600,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <header style={{ 
              borderBottom: '1px solid rgba(0,0,0,0.05)', 
              padding: '20px 24px',
              background: 'rgba(255,255,255,0.5)'
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark)' }}>Konversationer</h2>
            </header>

            <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {isLoading && sortedConversations.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 14, color: 'var(--muted)' }}>Laddar konversationer...</p>
                </div>
              ) : null}

              {!isLoading && sortedConversations.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', background: 'rgba(255,255,255,0.5)', borderRadius: 16 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--dark)' }}>Inga meddelanden</h3>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.5 }}>
                    När du ansöker på ett jobb eller någon ansöker på ditt jobb kan ni chatta här.
                  </p>
                </div>
              ) : null}

              {sortedConversations.map((conversation) => {
                const isSelected = selectedConversation?.id === conversation.id;
                const lastMessage = conversation.messages[conversation.messages.length - 1];

                return (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    style={{
                      border: isSelected ? '1px solid rgba(37,99,235,0.2)' : '1px solid transparent',
                      background: isSelected ? 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(37,99,235,0.02))' : 'transparent',
                      borderRadius: 16,
                      textAlign: 'left',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 15, fontWeight: isSelected ? 700 : 600, color: 'var(--dark)' }}>{conversation.participant.name}</p>
                      <span style={{ fontSize: 11, color: isSelected ? 'var(--blue)' : 'var(--muted)', fontWeight: 500 }}>
                        {formatLastSeen(conversation.updatedAt)}
                      </span>
                    </div>

                    <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 500 }}>{conversation.jobTitle}</p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <p
                        style={{
                          fontSize: 13,
                          color: isSelected ? 'var(--ink)' : 'var(--muted)',
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
                            minWidth: 20,
                            height: 20,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, var(--red), #EF4444)',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 6px',
                            boxShadow: '0 2px 8px rgba(239,68,68,0.3)'
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
