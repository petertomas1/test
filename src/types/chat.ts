export type PresenceState = 'online' | 'offline';

export type ChatMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  cipher_text: string;
  created_at: string;
  plain_text?: string;
  status?: 'sent' | 'delivered' | 'read';
};

export type Contact = {
  id: string;
  name: string;
  status: PresenceState;
  unread: number;
};
