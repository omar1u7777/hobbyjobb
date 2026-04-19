import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ChatInput from './ChatInput.jsx';
import MessageBubble from './MessageBubble.jsx';

export default function ChatWindow({ conversation, currentUserId, onSend, isSending = false }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages?.length]);

  if (!conversation) {
    return (
      <section className="card" style={{ minHeight: 460, padding: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Ingen konversation vald</h2>
        <p style={{ color: 'var(--muted)' }}>Välj en konversation i listan för att öppna chatten.</p>
      </section>
    );
  }

  return (
    <section className="card" style={{ minHeight: 460, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div>
          <h2 style={{ fontSize: 16, marginBottom: 2 }}>{conversation.participant.name}</h2>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>{conversation.jobTitle}</p>
        </div>

        <Link to={`/jobs/${conversation.jobId}`} className="btn btn-outline btn-sm">
          Visa jobb
        </Link>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {conversation.messages.map((message) => (
          <MessageBubble key={message.id} message={message} isOwn={message.senderId === currentUserId} />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={onSend} disabled={isSending} />
    </section>
  );
}
