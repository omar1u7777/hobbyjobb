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
      <section style={{ 
        minHeight: 560, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
        padding: 40,
        textAlign: 'center'
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--blue-light), #E0E7FF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          boxShadow: '0 8px 16px rgba(37,99,235,0.1)'
        }}>
          <span style={{ fontSize: 32 }}>💬</span>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--dark)' }}>Välj en konversation</h2>
        <p style={{ color: 'var(--muted)', maxWidth: 300, lineHeight: 1.6 }}>
          Klicka på en konversation i listan till vänster för att läsa meddelanden och svara.
        </p>
      </section>
    );
  }

  return (
    <section style={{ 
      height: 600, 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(20px)',
      borderRadius: 24,
      border: '1px solid rgba(255,255,255,0.8)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
    }}>
      <header
        style={{
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          background: 'rgba(255,255,255,0.9)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--blue), #60A5FA)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 16,
            boxShadow: '0 4px 10px rgba(37,99,235,0.2)',
          }}>
            {conversation.participant.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2, color: 'var(--dark)' }}>{conversation.participant.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{conversation.jobTitle}</p>
          </div>
        </div>

        <Link to={`/jobs/${conversation.jobId}`} className="btn btn-outline btn-sm" style={{ 
          borderRadius: 20, 
          padding: '6px 16px',
          fontSize: 13,
          fontWeight: 600,
        }}>
          Visa uppdrag
        </Link>
      </header>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '24px 24px', 
        background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.4))', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 16 
      }}>
        {conversation.messages.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Inga meddelanden än. Skriv ett hej!</p>
          </div>
        ) : (
          conversation.messages.map((message) => (
            <MessageBubble key={message.id} message={message} isOwn={message.senderId === currentUserId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={onSend} disabled={isSending} />
    </section>
  );
}
