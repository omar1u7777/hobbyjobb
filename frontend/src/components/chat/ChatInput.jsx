import { useState } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        borderTop: '1px solid var(--border)',
        padding: 12,
        display: 'flex',
        gap: 8,
        background: 'var(--white)',
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Skriv ett meddelande…"
        rows={2}
        disabled={disabled}
        style={{
          flex: 1,
          resize: 'none',
          border: '1.5px solid var(--border)',
          borderRadius: 8,
          padding: '10px 12px',
          fontSize: 14,
          fontFamily: 'var(--font)',
          outline: 'none',
          background: disabled ? 'var(--border-light)' : 'var(--bg)',
        }}
      />

      <button type="submit" className="btn btn-primary" disabled={disabled || !text.trim()}>
        Skicka
      </button>
    </form>
  );
}
