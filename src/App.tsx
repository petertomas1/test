import { FormEvent, useMemo, useState } from 'react';
import { decryptMessage, encryptMessage } from './crypto';

type ChatMessage = {
  id: number;
  from: 'me' | 'peer';
  encrypted: string;
  decrypted?: string;
};

export function App() {
  const [passphrase, setPassphrase] = useState('');
  const [draft, setDraft] = useState('');
  const [incoming, setIncoming] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');

  const secureReady = passphrase.trim().length >= 8;
  const sorted = useMemo(() => [...messages].sort((a, b) => a.id - b.id), [messages]);

  async function onSend(event: FormEvent) {
    event.preventDefault();
    if (!secureReady || !draft.trim()) return;
    const encrypted = await encryptMessage(draft.trim(), passphrase);
    setMessages((prev) => [...prev, { id: Date.now(), from: 'me', encrypted, decrypted: draft.trim() }]);
    setDraft('');
  }

  async function onReceive(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!secureReady || !incoming.trim()) return;
    try {
      const decrypted = await decryptMessage(incoming.trim(), passphrase);
      setMessages((prev) => [...prev, { id: Date.now(), from: 'peer', encrypted: incoming.trim(), decrypted }]);
      setIncoming('');
    } catch {
      setError('Could not decrypt message. Verify passphrase and payload.');
    }
  }

  return (
    <main className="container">
      <section className="panel">
        <h1>Signal-Style Secure Chat</h1>
        <p className="subtitle">Local-first, end-to-end encrypted message playground.</p>
        <label>
          Shared passphrase
          <input type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="At least 8 characters" />
        </label>
      </section>

      <section className="chat-grid">
        <form className="panel" onSubmit={onSend}>
          <h2>Compose</h2>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} placeholder="Type plain text..." />
          <button disabled={!secureReady || !draft.trim()}>Encrypt & Save</button>
        </form>

        <form className="panel" onSubmit={onReceive}>
          <h2>Decrypt Incoming</h2>
          <textarea value={incoming} onChange={(e) => setIncoming(e.target.value)} rows={4} placeholder="Paste encrypted base64 payload..." />
          <button disabled={!secureReady || !incoming.trim()}>Decrypt</button>
          {error && <small className="error">{error}</small>}
        </form>
      </section>

      <section className="panel history">
        <h2>Conversation</h2>
        {sorted.length === 0 && <p className="empty">No messages yet.</p>}
        {sorted.map((msg) => (
          <article key={msg.id} className={`bubble ${msg.from}`}>
            <header>{msg.from === 'me' ? 'You' : 'Peer'}</header>
            <p>{msg.decrypted}</p>
            <details>
              <summary>Encrypted payload</summary>
              <code>{msg.encrypted}</code>
            </details>
          </article>
        ))}
      </section>
    </main>
  );
}
