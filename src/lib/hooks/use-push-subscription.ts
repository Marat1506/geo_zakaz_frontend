'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/toast';
import { getApiBaseUrl } from '@/lib/api/get-api-base-url';

export function usePushSubscription() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setPushEnabled(!!sub);
    } catch (e) {
      console.error('Failed to get push subscription:', e);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast({ title: 'Not supported', description: 'Push notifications not supported in this browser.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      
      // Get VAPID public key
      const apiUrl = getApiBaseUrl();
      const res = await fetch(`${apiUrl}/notifications/vapid-public-key`);
      if (!res.ok) throw new Error('Failed to get VAPID key');
      const { publicKey } = await res.json();

      // Subscribe
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });

      // Save to backend
      const token = localStorage.getItem('accessToken');
      const saveRes = await fetch(`${apiUrl}/notifications/subscribe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(sub.toJSON()),
      });

      if (!saveRes.ok) throw new Error('Failed to save subscription');

      setPushEnabled(true);
      toast({ title: 'Notifications enabled!', description: 'You will receive updates about orders.' });
    } catch (e) {
      console.error('Push error:', e);
      toast({ title: 'Error', description: 'Could not enable notifications.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        
        // Notify backend (optional, backend should handle 410 Gone anyway)
        const apiUrl = getApiBaseUrl();
        const token = localStorage.getItem('accessToken');
        await fetch(`${apiUrl}/notifications/subscribe`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setPushEnabled(false);
      toast({ title: 'Notifications disabled', description: 'You will no longer receive push notifications.' });
    } catch (e) {
      console.error('Unsubscribe error:', e);
      toast({ title: 'Error', description: 'Could not disable notifications.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    if (pushEnabled) unsubscribe();
    else subscribe();
  };

  return { pushEnabled, loading, toggle, subscribe, unsubscribe };
}
