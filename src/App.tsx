import { useEffect, useMemo, useRef, useState } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { Composer } from './components/Composer';
import { Sidebar } from './components/Sidebar';
import { decryptMessage, encryptMessage } from './crypto';
import { useNotifications } from './hooks/useNotifications';
import { ChatMessage, Contact } from './types/chat';

const BACKEND = 'ws://127.0.0.1:8000/ws';
const ROOM_ID = 'global';

export function App() {
  const [me, setMe] = useState(`user-${Math.floor(Math.random() * 1000)}`);
  const [secret, setSecret] = useState('supersecurepass');
  const [draft, setDraft] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const { enabled, request, notify } = useNotifications();

  useEffect(() => {
    const ws = new WebSocket(`${BACKEND}/${me}`);
    wsRef.current = ws;
    ws.onopen = () => ws.send(JSON.stringify({ type: 'history', room_id: ROOM_ID }));
    ws.onmessage = async (event) => {
      const packet = JSON.parse(event.data);
      if (packet.type === 'presence') {
        setContacts((prev) => {
          const filtered = prev.filter((c) => c.id !== packet.user_id);
          return [...filtered, { id: packet.user_id, name: packet.user_id, status: packet.status, unread: 0 }];
        });
      }
      if (packet.type === 'history') {
        const decrypted = await Promise.all(packet.messages.map(async (m: ChatMessage) => ({ ...m, plain_text: await decryptMessage(m.cipher_text, secret).catch(() => 'Unable to decrypt') })));
        setMessages(decrypted);
      }
      if (packet.type === 'message') {
        const plain = await decryptMessage(packet.cipher_text, secret).catch(() => 'Unable to decrypt');
        const msg = { ...packet, plain_text: plain } as ChatMessage;
        setMessages((prev) => [...prev, msg]);
        if (packet.sender_id !== me) notify(`New message from ${packet.sender_id}`, plain);
      }
      if (packet.type === 'typing' && packet.is_typing) {
        setTypingUsers((prev) => Array.from(new Set([...prev, packet.sender_id])));
      }
      if (packet.type === 'typing' && !packet.is_typing) {
        setTypingUsers((prev) => prev.filter((u) => u !== packet.sender_id));
      }
    };
    return () => ws.close();
  }, [me, notify, secret]);

  async function sendMessage() {
    if (!draft.trim() || !wsRef.current) return;
    const cipher_text = await encryptMessage(draft.trim(), secret);
    wsRef.current.send(JSON.stringify({ type: 'message', room_id: ROOM_ID, sender_id: me, cipher_text }));
    setDraft('');
    wsRef.current.send(JSON.stringify({ type: 'typing', room_id: ROOM_ID, sender_id: me, is_typing: false }));
  }

  function sendTyping(typing: boolean) {
    wsRef.current?.send(JSON.stringify({ type: 'typing', room_id: ROOM_ID, sender_id: me, is_typing: typing }));
  }

  const activeContacts = useMemo(() => contacts.filter((c) => c.id !== me), [contacts, me]);

  return (
    <main className="app-shell">
      <section className="panel topbar">
        <h1>WhatsApp-like Secure Chat</h1>
        <div className="row">
          <input value={me} onChange={(e) => setMe(e.target.value)} />
          <input value={secret} type="password" onChange={(e) => setSecret(e.target.value)} />
          <button onClick={request}>{enabled ? 'Notifications enabled' : 'Enable notifications'}</button>
        </div>
      </section>
      <section className="layout">
        <Sidebar me={me} contacts={activeContacts} active={activeContacts[0]?.id ?? ''} onSelect={() => undefined} />
        <div>
          <ChatWindow activeName={activeContacts[0]?.id ?? 'Global Room'} messages={messages} typingUsers={typingUsers} />
          <Composer value={draft} onChange={setDraft} onSend={sendMessage} onTyping={sendTyping} />
        </div>
      </section>
    </main>
  );
}
