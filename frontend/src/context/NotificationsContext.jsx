import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiClient, ticketsAPI, conversationsAPI, notificationsAPI } from '@/api';
import { dashboardAPI } from '@/api';
import useAuthStore from '@/store/authStore';
import { isStaffRole } from '@/utils/permissions';

const NotificationsContext = createContext(null);
const POLL_INTERVAL_MS = 15000;
const STORAGE_PREFIX = 'notif';

const buildStorageKey = (user) => {
  const role = user?.role?.name || user?.role || 'unknown';
  return `${STORAGE_PREFIX}:${user?.id || 'guest'}:${String(role).toLowerCase()}`;
};

const safeDate = (value) => {
  const parsed = value ? new Date(value).getTime() : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

export function NotificationsProvider({ children }) {
  const user = useAuthStore((state) => state.user);
  const isStaff = isStaffRole(user);
  const storageKey = useMemo(() => buildStorageKey(user), [user]);
  const [notifications, setNotifications] = useState([]);
  const [lastSeen, setLastSeen] = useState({
    tickets: 0,
    conversations: 0,
    messages: 0,
    attachments: 0,
    sla: 0,
    logs: 0,
  });
  const [notifiedIds, setNotifiedIds] = useState(new Set());
  const [initialized, setInitialized] = useState(false);
  const latestRef = useRef({
    tickets: 0,
    conversations: 0,
    messages: 0,
    attachments: 0,
    sla: 0,
    logs: 0,
  });
  const lastSeenRef = useRef(lastSeen);
  const notifiedIdsRef = useRef(notifiedIds);
  const notificationsRef = useRef(notifications);

  useEffect(() => {
    lastSeenRef.current = lastSeen;
  }, [lastSeen]);

  useEffect(() => {
    notifiedIdsRef.current = notifiedIds;
  }, [notifiedIds]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    const storedLastSeen = localStorage.getItem(`${storageKey}:lastSeen`);
    const storedNotified = localStorage.getItem(`${storageKey}:notifiedIds`);
    if (storedLastSeen) {
      try {
        const parsed = JSON.parse(storedLastSeen);
        setLastSeen(parsed);
        lastSeenRef.current = parsed;
      } catch {
        // ignore
      }
    }
    if (storedNotified) {
      try {
        const parsed = JSON.parse(storedNotified);
        setNotifiedIds(new Set(parsed));
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(`${storageKey}:lastSeen`, JSON.stringify(lastSeen));
    localStorage.setItem(`${storageKey}:notifiedIds`, JSON.stringify(Array.from(notifiedIds)));
  }, [storageKey, lastSeen, notifiedIds]);

  const computeNotifications = async () => {
    const nextNotifications = [];
    const nextNotifiedIds = new Set([
      ...Array.from(notifiedIdsRef.current || []),
      ...((notificationsRef.current || []).map((n) => n.id)),
    ]);

    const ticketsParams = isStaff ? { per_page: 5, assigned_to: user?.id } : { per_page: 5 };
    const conversationsParams = { per_page: 5 };

    const [ticketsData, conversationsData, slaData, logsData] = await Promise.all([
      ticketsAPI.getTickets(ticketsParams),
      conversationsAPI.getConversations(conversationsParams),
      ticketsAPI.getSlaBreaches(),
      notificationsAPI.getLogs({ status: 'failed', per_page: 5 }),
    ]);

    const tickets = ticketsData?.items || [];
    const conversations = conversationsData?.items || [];
    const slaCount =
      (slaData?.first_response_breaches?.length || 0) + (slaData?.resolution_breaches?.length || 0);
    const logs = logsData?.items || [];

    const latestTickets = Math.max(...tickets.map((t) => safeDate(t.created_at)), 0);
    const latestConversations = Math.max(...conversations.map((c) => safeDate(c.updated_at)), 0);
    const latestLogs = Math.max(...logs.map((l) => safeDate(l.created_at)), 0);
    const latestMessageFromList = Math.max(
      ...conversations.map((c) => safeDate(c.last_message?.created_at)),
      0
    );

    latestRef.current = {
      tickets: latestTickets,
      conversations: latestConversations,
      messages: latestMessageFromList,
      attachments: latestMessageFromList,
      sla: slaCount,
      logs: latestLogs,
    };

    if (!initialized) {
      const initLastSeen = {
        tickets: latestTickets,
        conversations: latestConversations,
        messages: latestMessageFromList,
        attachments: latestMessageFromList,
        sla: slaCount,
        logs: latestLogs,
      };
      setLastSeen(initLastSeen);
      lastSeenRef.current = initLastSeen;
      setInitialized(true);
      return;
    }

    tickets.forEach((ticket) => {
      const createdAt = safeDate(ticket.created_at);
      if (createdAt <= lastSeenRef.current.tickets) return;
      const id = `ticket:new:${ticket.id}`;
      if (nextNotifiedIds.has(id)) return;
      nextNotifiedIds.add(id);
      nextNotifications.push({
        id,
        type: 'ticket',
        title: `New ticket #${ticket.id.slice(0, 8)}`,
        time: ticket.created_at,
        subtitle: ticket.room?.number ? `Room ${ticket.room.number}` : ticket.department?.name || null,
        href: isStaff ? `/staff/tickets/${ticket.id}` : `/admin/tickets/${ticket.id}`,
      });
    });

    conversations.forEach((conversation) => {
      const updatedAt = safeDate(conversation.updated_at);
      if (updatedAt <= lastSeenRef.current.conversations) return;
      const id = `conversation:new:${conversation.id}`;
      if (nextNotifiedIds.has(id)) return;
      nextNotifiedIds.add(id);
      nextNotifications.push({
        id,
        type: 'conversation',
        title: `New message in ${conversation.participant?.name || 'conversation'}`,
        time: conversation.updated_at,
        subtitle: conversation.room?.room_number ? `Room ${conversation.room.room_number}` : null,
        href: isStaff ? `/staff/conversations/${conversation.id}` : `/admin/conversations/${conversation.id}`,
      });
    });

    if (slaCount > lastSeenRef.current.sla) {
      const id = `sla:breach:${slaCount}`;
      if (!nextNotifiedIds.has(id)) {
        nextNotifiedIds.add(id);
        nextNotifications.push({
          id,
          type: 'sla',
          title: 'SLA breaches increased',
          time: new Date().toISOString(),
          subtitle: `${slaCount} total breaches`,
          href: isStaff ? '/staff/queue' : '/admin/settings',
        });
      }
    }

    logs.forEach((log) => {
      const createdAt = safeDate(log.created_at);
      if (createdAt <= lastSeenRef.current.logs) return;
      const id = `log:failed:${log.id}`;
      if (nextNotifiedIds.has(id)) return;
      nextNotifiedIds.add(id);
      nextNotifications.push({
        id,
        type: 'notification',
        title: `Delivery failed (${log.message_type || 'notification'})`,
        time: log.created_at,
        subtitle: log.channel_type || null,
        href: '/admin/notifications-logs',
      });
    });

    const candidates = conversations
      .filter((conversation) => safeDate(conversation.updated_at) > lastSeenRef.current.messages)
      .sort((a, b) => safeDate(b.updated_at) - safeDate(a.updated_at))
      .slice(0, 3);

    let newestMessageSeen = lastSeenRef.current.messages;
    let newestAttachmentSeen = lastSeenRef.current.attachments;

    const fetchLatestMessage = async (conversationId) => {
      const first = await apiClient.get(`/conversations/${conversationId}/messages`, {
        params: { per_page: 1, page: 1 },
      });
      const firstPayload = first.data?.data || first.data || {};
      const pagination = firstPayload.pagination;
      const firstItems = firstPayload.items || firstPayload.data || [];
      if (!pagination || pagination.last_page <= 1) {
        return firstItems[firstItems.length - 1] || null;
      }
      const last = await apiClient.get(`/conversations/${conversationId}/messages`, {
        params: { per_page: 1, page: pagination.last_page },
      });
      const lastPayload = last.data?.data || last.data || {};
      const lastItems = lastPayload.items || lastPayload.data || [];
      return lastItems[lastItems.length - 1] || null;
    };

    for (const conversation of candidates) {
      const message = await fetchLatestMessage(conversation.id);
      if (!message) continue;

      const messageTime = safeDate(message.created_at);
      if (messageTime > newestMessageSeen) newestMessageSeen = messageTime;

      const senderType = message.sender_type || message.role;
      const isStaffMessage = senderType === 'staff' || senderType === 'agent' || senderType === 'system';
      if (!isStaffMessage && messageTime > lastSeenRef.current.messages) {
        const id = `message:new:${conversation.id}:${message.id}`;
        if (!nextNotifiedIds.has(id)) {
          nextNotifiedIds.add(id);
          nextNotifications.push({
            id,
            type: 'message',
            title: `${senderType || 'user'}: ${(message.body || message.content || '').slice(0, 40)}`,
            time: message.created_at,
            subtitle: conversation.participant?.name || null,
            href: isStaff
              ? `/staff/conversations/${conversation.id}`
              : `/admin/conversations/${conversation.id}`,
          });
        }
      }

      const attachments = Array.isArray(message.attachments) ? message.attachments : [];
      if (attachments.length > 0 && messageTime > lastSeenRef.current.attachments) {
        if (messageTime > newestAttachmentSeen) newestAttachmentSeen = messageTime;
        attachments.forEach((attachment) => {
          const id = `attachment:new:${attachment.id}`;
          if (nextNotifiedIds.has(id)) return;
          nextNotifiedIds.add(id);
          nextNotifications.push({
            id,
            type: 'attachment',
            title: `New attachment (${attachment.mime_type || attachment.type || 'file'})`,
            time: message.created_at,
            subtitle: conversation.participant?.name || `Conversation ${conversation.id.slice(0, 8)}`,
            href: isStaff
              ? `/staff/conversations/${conversation.id}`
              : `/admin/attachments`,
          });
        });
      }
    }

    if (nextNotifications.length > 0) {
      setNotifications((prev) => [...nextNotifications, ...prev].slice(0, 20));
      setNotifiedIds(nextNotifiedIds);
    } else {
      setNotifiedIds(nextNotifiedIds);
    }

    const updatedLastSeen = {
      tickets: latestTickets,
      conversations: latestConversations,
      messages: Math.max(latestMessageFromList, newestMessageSeen),
      attachments: Math.max(latestMessageFromList, newestAttachmentSeen),
      sla: slaCount,
      logs: latestLogs,
    };
    setLastSeen(updatedLastSeen);
    lastSeenRef.current = updatedLastSeen;
  };

  useEffect(() => {
    if (!user) return;
    let intervalId = null;

    const startPolling = () => {
      if (intervalId || document.visibilityState !== 'visible') return;
      computeNotifications();
      intervalId = setInterval(() => {
        computeNotifications();
      }, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user?.id,
    user?.role,
    isStaff,
    lastSeen.tickets,
    lastSeen.conversations,
    lastSeen.messages,
    lastSeen.attachments,
    lastSeen.sla,
    lastSeen.logs,
  ]);

  const markAllRead = () => {
    setNotifications([]);
    setLastSeen({
      tickets: latestRef.current.tickets,
      conversations: latestRef.current.conversations,
      messages: latestRef.current.messages,
      attachments: latestRef.current.attachments,
      sla: latestRef.current.sla,
      logs: latestRef.current.logs,
    });
    setNotifiedIds(new Set(notifiedIdsRef.current));
  };

  const markRead = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const counts = useMemo(() => {
    const ticketCount = notifications.filter((n) => n.type === 'ticket').length;
    const conversationCount = notifications.filter((n) => n.type === 'conversation' || n.type === 'message').length;
    const slaCount = notifications.filter((n) => n.type === 'sla').length;
    const logCount = notifications.filter((n) => n.type === 'notification').length;
    const attachmentCount = notifications.filter((n) => n.type === 'attachment').length;
    return {
      total: notifications.length,
      tickets: ticketCount,
      conversations: conversationCount,
      attachments: attachmentCount,
      sla: slaCount,
      logs: logCount,
    };
  }, [notifications]);

  const value = useMemo(
    () => ({
      notifications,
      counts,
      markAllRead,
      markRead,
    }),
    [notifications, counts]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}
