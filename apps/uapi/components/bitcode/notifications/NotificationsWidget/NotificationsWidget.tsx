/**
 * Notifications chrome menu — bell trigger + activity queue panel.
 * Presentation (panel, enter/exit, dismiss) is owned by ChromeMenu.
 */

"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@bitcode/supabase/ssr/client';
import {
  buildBitcodeActivityRecordFromNotification,
  getBitcodeActivityScopeLabel,
} from '@/components/bitcode/activity/BitcodeActivityModel/bitcode-activity-model';
import {
  ChromeMenu,
  ChromeMenuEmpty,
  ChromeMenuHeader,
  chromeMenuHeaderActionClass,
} from '@/components/bitcode/menus/ChromeMenu/ChromeMenu';
import '@/styles/notifications-widget.css';
import {
  formatNotificationTimestamp,
  getNotificationPresentation,
} from '@/components/bitcode/notifications/NotificationPresentation/notification-presentation';

type Notification = {
  id: string;
  user_id: string;
  type: string;
  title?: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
};

export function NotificationsWidget() {
  const supabase = createClient();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const normalize = useCallback((rows: any[]): Notification[] => {
    return rows.map((row) => ({
      ...row,
      read: row.read ?? row.is_read ?? false,
    }));
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/auxillaries/notifications');
      if (res.ok) {
        const raw: any[] = await res.json();
        setNotifications(normalize(raw));
      }
    } catch (err) {
      console.error('[notifications] fetch failed', err);
    }
  }, [normalize]);

  useEffect(() => {
    let channel: any;
    (async () => {
      await fetchNotifications();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const notificationsChannel =
        typeof supabase.channel === 'function' ? supabase.channel('notifications') : null;

      if (!notificationsChannel || typeof notificationsChannel.on !== 'function') {
        return;
      }

      notificationsChannel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const { eventType, new: newRow, old: oldRow } = payload as any;
          setNotifications((prev) => {
            if (eventType === 'INSERT' && newRow) return [normalize([newRow])[0], ...prev];
            if (eventType === 'UPDATE' && newRow) return prev.map((n) => (n.id === newRow.id ? normalize([newRow])[0] : n));
            if (eventType === 'DELETE' && oldRow) return prev.filter((n) => n.id !== oldRow.id);
            return prev;
          });
        },
      );

      if (typeof notificationsChannel.subscribe === 'function') {
        notificationsChannel.subscribe();
      }

      channel = notificationsChannel;
    })();

    return () => {
      if (channel && typeof supabase.removeChannel === 'function') supabase.removeChannel(channel);
    };
  }, [supabase, fetchNotifications, normalize]);

  const unread = notifications.filter((n) => !n.read).length;

  const [arrival, setArrival] = useState(false);
  const prevUnreadRef = useRef(0);
  useEffect(() => {
    const prevUnread = prevUnreadRef.current;
    if (unread > prevUnread) {
      setArrival(true);
      setTimeout(() => setArrival(false), 1200);
    }
    prevUnreadRef.current = unread;
  }, [unread]);

  const toggleRead = async (id: string, read: boolean) => {
    try {
      await fetch(`/api/auxillaries/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read }),
      });
    } catch (err) {
      console.error('[notifications] toggle read failed', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/auxillaries/notifications/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('[notifications] delete failed', err);
    }
  };

  const markAllRead = async () => {
    await Promise.all(
      notifications
        .filter((n) => !n.read)
        .map((n) =>
          fetch(`/api/auxillaries/notifications/${n.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ read: true }),
          }),
        ),
    );
  };

  const trigger = (
    <button
      type="button"
      className={['notifications-bell', unread > 0 ? 'has-unread' : '', arrival ? 'new-arrival' : ''].filter(Boolean).join(' ')}
      data-testid="notifications-toggle"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls="notifications-dropdown"
      aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
    >
      <div className="bell-icon-container">
        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="bell-icon">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unread > 0 && [0, 1].map((i) => <span key={i} className="orbital-bell-ring" style={{ '--ring-index': i } as any} />)}
        {arrival && [...Array(6)].map((_, i) => (
          <span key={i} className="bell-quantum-particle" style={{ '--particle-index': i, '--particle-angle': `${i * 60}deg` } as any} />
        ))}
      </div>

      {unread > 0 && (
        <div className="notification-counter notification-counter-pulse">
          <span>{unread}</span>
          <span className="counter-glow" />
        </div>
      )}
    </button>
  );

  return (
    <div className="notifications-widget-container" data-state={open ? 'open' : 'closed'}>
      <ChromeMenu
        trigger={trigger}
        size="wide"
        open={open}
        onOpenChange={setOpen}
        contentId="notifications-dropdown"
        contentLabel="Notifications"
        preventOpenAutoFocus
      >
        <ChromeMenuHeader
          title="Notifications"
          description="Personal activity queue for proof closure, repository activity, and review prompts"
          action={
            notifications.length > 0 ? (
              <button
                type="button"
                className={chromeMenuHeaderActionClass}
                onClick={markAllRead}
              >
                Mark all read
              </button>
            ) : null
          }
        />

        {notifications.length === 0 ? (
          <ChromeMenuEmpty
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" fill="none" className="h-10 w-10 text-emerald-400/70">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            }
          >
            All caught up! No notifications yet.
          </ChromeMenuEmpty>
        ) : (
          <div className="notifications-list">
            {notifications.map((n) => {
              const activity = buildBitcodeActivityRecordFromNotification(n);
              const presentation = getNotificationPresentation(n.type, n.title);

              return (
                <div key={n.id} className={`notification-item ${n.read ? '' : 'notification-unread'}`}>
                  <div className="notification-content">
                    <div className="notification-meta">
                      <span
                        className={`notification-type-pill notification-type-${presentation.tone}`}
                      >
                        {presentation.label}
                      </span>
                      <div className="notification-time">
                        {formatNotificationTimestamp(activity.timestamp)}
                      </div>
                    </div>
                    <div className="notification-title">{presentation.title}</div>
                    <div className="notification-message">{activity.summary}</div>
                    <div className="mt-2 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
                      {getBitcodeActivityScopeLabel(activity.scope)} activity
                    </div>
                  </div>
                  {!n.read ? <div className="unread-indicator" aria-hidden="true" /> : null}
                  <div className="notification-actions">
                    <button
                      type="button"
                      onClick={() => toggleRead(n.id, !n.read)}
                      className="notification-action-button"
                    >
                      {n.read ? 'Unread' : 'Read'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNotification(n.id)}
                      className="notification-action-button notification-action-danger"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ChromeMenu>
    </div>
  );
}
