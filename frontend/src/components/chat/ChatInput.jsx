import { useState } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '16px 20px',
        display: 'flex',
        gap: 12,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        alignItems: 'flex-end',
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Skriv ett meddelande..."
        rows={Math.min(Math.max(text.split('\n').length, 1), 4)}
        disabled={disabled}
        style={{
          flex: 1,
          resize: 'none',
          border: isFocused ? '1px solid var(--blue)' : '1px solid var(--border)',
          borderRadius: 20,
          padding: '12px 16px',
          fontSize: 14,
          fontFamily: 'var(--font)',
          outline: 'none',
          background: disabled ? 'var(--bg)' : '#fff',
          boxShadow: isFocused ? '0 0 0 3px rgba(37,99,235,0.1)' : 'inset 0 2px 4px rgba(0,0,0,0.02)',
          transition: 'all 0.2s ease',
          lineHeight: 1.5,
          maxHeight: 120,
        }}
      />

      <button 
        type="submit" 
        disabled={disabled || !text.trim()}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: 'none',
          background: disabled || !text.trim() ? 'var(--border)' : 'linear-gradient(135deg, var(--blue), #60A5FA)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled || !text.trim() ? 'not-allowed' : 'pointer',
          boxShadow: disabled || !text.trim() ? 'none' : '0 4px 10px rgba(37,99,235,0.3)',
          transition: 'all 0.2s ease',
          transform: (disabled || !text.trim()) ? 'scale(0.95)' : 'scale(1)',
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </form>
  );
}
