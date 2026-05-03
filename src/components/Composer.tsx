import { FormEvent } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onTyping: (typing: boolean) => void;
};

export function Composer({ value, onChange, onSend, onTyping }: Props) {
  function submit(event: FormEvent) {
    event.preventDefault();
    onSend();
  }

  return (
    <form className="composer panel" onSubmit={submit}>
      <textarea
        value={value}
        rows={3}
        placeholder="Write a secure message"
        onFocus={() => onTyping(true)}
        onBlur={() => onTyping(false)}
        onChange={(e) => onChange(e.target.value)}
      />
      <button disabled={!value.trim()}>Send</button>
    </form>
  );
}
