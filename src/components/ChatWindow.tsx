import { ChatMessage } from '../types/chat';
import { formatTime } from '../utils/time';

type Props = {
  activeName: string;
  messages: ChatMessage[];
  typingUsers: string[];
};

export function ChatWindow({ activeName, messages, typingUsers }: Props) {
  return (
    <section className="chat panel">
      <header><h2>{activeName}</h2></header>
      <div className="messages">
        {messages.map((m) => (
          <article key={m.id} className={`msg ${m.sender_id === activeName ? 'peer' : 'me'}`}>
            <p>{m.plain_text ?? 'Encrypted message'}</p>
            <small>{formatTime(m.created_at)}</small>
          </article>
        ))}
      </div>
      {typingUsers.length > 0 && <p className="typing">{typingUsers.join(', ')} typing…</p>}
    </section>
  );
}
