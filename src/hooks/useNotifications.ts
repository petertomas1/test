import { useCallback, useEffect, useState } from 'react';

export function useNotifications() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(typeof Notification !== 'undefined' && Notification.permission === 'granted');
  }, []);

  const request = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setEnabled(permission === 'granted');
  }, []);

  const notify = useCallback((title: string, body: string) => {
    if (enabled) {
      new Notification(title, { body });
    }
  }, [enabled]);

  return { enabled, request, notify };
}
