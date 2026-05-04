import { Contact } from '../types/chat';

type Props = {
  me: string;
  contacts: Contact[];
  active: string;
  onSelect: (id: string) => void;
};

export function Sidebar({ me, contacts, active, onSelect }: Props) {
  return (
    <aside className="sidebar panel">
      <h2>{me}</h2>
      {contacts.map((c) => (
        <button key={c.id} className={`contact ${active === c.id ? 'active' : ''}`} onClick={() => onSelect(c.id)}>
          <span>{c.name}</span>
          <small>{c.status}</small>
        </button>
      ))}
    </aside>
  );
}
