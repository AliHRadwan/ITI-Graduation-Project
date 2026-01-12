import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ticketsAPI, dashboardAPI, conversationsAPI, notificationsAPI } from '@/api';
import { Badge, Button, Card } from '@/components/ui';
import {
  TicketIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const priorityLabels = {
  low: 'Low',
  med: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const STALE_HOURS = 24;

export default function StaffActionCenter() {
  const navigate = useNavigate();
  const [showRatings, setShowRatings] = useState(false);

  const { data: metrics } = useQuery({
    queryKey: ['staff-metrics-strip'],
    queryFn: dashboardAPI.getMetrics,
  });

  const { data: urgentHighData } = useQuery({
    queryKey: ['urgent-high'],
    queryFn: async () => {
      const [urgent, high] = await Promise.all([
        ticketsAPI.getTickets({ priority: 'urgent', per_page: 3 }),
        ticketsAPI.getTickets({ priority: 'high', per_page: 3 }),
      ]);
      const combined = [...(urgent.items || []), ...(high.items || [])];
      return combined.sort((a, b) => {
        const aDate = new Date(a.updated_at || a.created_at || 0).getTime();
        const bDate = new Date(b.updated_at || b.created_at || 0).getTime();
        return bDate - aDate;
      });
    },
  });

  const { data: staleTicketsData } = useQuery({
    queryKey: ['stale-tickets'],
    queryFn: async () => {
      const [doing, newTickets] = await Promise.all([
        ticketsAPI.getTickets({ status: 'doing', per_page: 10 }),
        ticketsAPI.getTickets({ status: 'new', per_page: 10 }),
      ]);
      const combined = [...(doing.items || []), ...(newTickets.items || [])];
      const cutoff = Date.now() - STALE_HOURS * 60 * 60 * 1000;
      return combined
        .filter((ticket) => {
          const updated = new Date(ticket.updated_at || ticket.created_at || 0).getTime();
          return updated < cutoff;
        })
        .sort((a, b) => {
          const aDate = new Date(a.updated_at || a.created_at || 0).getTime();
          const bDate = new Date(b.updated_at || b.created_at || 0).getTime();
          return bDate - aDate;
        })
        .slice(0, 5);
    },
  });

  const { data: handoffConversationsData } = useQuery({
    queryKey: ['handoff-conversations'],
    queryFn: () => conversationsAPI.getConversations({ status: 'HANDOFF', per_page: 5 }),
    refetchInterval: 15000,
  });

  const { data: openConversationsData } = useQuery({
    queryKey: ['open-conversations'],
    queryFn: () => conversationsAPI.getConversations({ status: 'OPEN', per_page: 5 }),
    refetchInterval: 15000,
  });

  const { data: notificationIssuesData } = useQuery({
    queryKey: ['notification-issues'],
    queryFn: () => notificationsAPI.getLogs({ status: 'failed', per_page: 5 }),
    refetchInterval: 20000,
  });

  const { data: ticketFeedbackData, isLoading: isFeedbackLoading } = useQuery({
    queryKey: ['ticket-feedback'],
    queryFn: async () => {
      const list = await ticketsAPI.getTickets({ status: 'done', per_page: 5 });
      const tickets = (list.items || []).slice(0, 3);
      const ratings = await Promise.all(
        tickets.map(async (ticket) => {
          const rating = await ticketsAPI.getTicketRating(ticket.id);
          return { ticket, rating };
        })
      );
      return ratings;
    },
    enabled: showRatings,
  });

  const urgentHighTickets = urgentHighData || [];
  const staleTickets = staleTicketsData || [];
  const handoffConversations = handoffConversationsData?.items || [];
  const openConversations = openConversationsData?.items || [];
  const notificationIssues = notificationIssuesData?.items || [];
  const feedbackItems = ticketFeedbackData || [];

  const kpiCards = useMemo(
    () => [
      { label: 'Open Tickets', value: metrics?.openTickets ?? 0 },
      { label: 'Overdue Tickets', value: metrics?.overdue ?? 0 },
      { label: 'Avg Rating', value: metrics?.avgRating ?? 0 },
      { label: 'Active Conversations', value: metrics?.activeConversations ?? 0 },
    ],
    [metrics]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Action Center</h1>
        <p className="text-gray-600">Alerts, insights, and quick follow-ups.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
              Urgent/High Queue
            </div>
            <Badge variant="warning" size="sm">{urgentHighTickets.length}</Badge>
          </div>
          {urgentHighTickets.length === 0 ? (
            <div className="text-sm text-gray-500">No urgent/high tickets</div>
          ) : (
            <div className="space-y-2 text-sm">
              {urgentHighTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => navigate(`/staff/tickets/${ticket.id}`)}
                  className="w-full text-left rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="font-medium text-gray-900">#{ticket.id.slice(0, 8)}</div>
                  <div className="text-xs text-gray-500">
                    {ticket.room?.number ? `Room ${ticket.room.number}` : 'Room N/A'} ·{' '}
                    {priorityLabels[ticket.priority] || ticket.priority}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <TicketIcon className="h-4 w-4 text-red-500" />
              Stale Tickets ({STALE_HOURS}h+)
            </div>
            <Badge variant="danger" size="sm">{staleTickets.length}</Badge>
          </div>
          {staleTickets.length === 0 ? (
            <div className="text-sm text-gray-500">No stale tickets</div>
          ) : (
            <div className="space-y-2 text-sm">
              {staleTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => navigate(`/staff/tickets/${ticket.id}`)}
                  className="w-full text-left rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="font-medium text-gray-900">#{ticket.id.slice(0, 8)}</div>
                  <div className="text-xs text-gray-500">
                    Updated {ticket.updated_at ? format(new Date(ticket.updated_at), 'MMM d, HH:mm') : 'N/A'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-500" />
              Handoff Conversations
            </div>
            <Badge variant="warning" size="sm">{handoffConversations.length}</Badge>
          </div>
          {handoffConversations.length === 0 ? (
            <div className="text-sm text-gray-500">No handoff conversations</div>
          ) : (
            <div className="space-y-2 text-sm">
              {handoffConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => navigate(`/staff/conversations/${conversation.id}`)}
                  className="w-full text-left rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="font-medium text-gray-900">
                    {conversation.participant?.name || 'Guest'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {conversation.room?.room_number ? `Room ${conversation.room.room_number}` : 'Room N/A'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <BellIcon className="h-4 w-4 text-red-500" />
              Delivery Issues
            </div>
            <Badge variant="danger" size="sm">{notificationIssues.length}</Badge>
          </div>
          {notificationIssues.length === 0 ? (
            <div className="text-sm text-gray-500">No failed notifications</div>
          ) : (
            <div className="space-y-2 text-sm">
              {notificationIssues.map((log) => (
                <div
                  key={log.id}
                  className="rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2"
                >
                  <div className="font-medium text-gray-900">{log.message_type || 'Notification'}</div>
                  <div className="text-xs text-gray-500">
                    {log.channel_type || 'N/A'} · {log.created_at ? format(new Date(log.created_at), 'MMM d, HH:mm') : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-500" />
            Open Conversations Needing Response
          </div>
          <Badge variant="info" size="sm">{openConversations.length}</Badge>
        </div>
        {openConversations.length === 0 ? (
          <div className="text-sm text-gray-500">No open conversations</div>
        ) : (
          <div className="space-y-2 text-sm">
            {openConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => navigate(`/staff/conversations/${conversation.id}`)}
                className="w-full text-left rounded-md border border-gray-200 dark:border-gray-800 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">
                    {conversation.participant?.name || 'Guest'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {conversation.updated_at ? format(new Date(conversation.updated_at), 'MMM d, HH:mm') : 'N/A'}
                  </div>
                </div>
                <div className="text-xs text-gray-500 line-clamp-1">
                  {conversation.last_message?.body || 'No recent message'}
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-sm font-semibold text-gray-900 mb-3">Performance Snapshot</div>
          <div className="grid grid-cols-2 gap-3">
            {kpiCards.map((card) => (
              <div key={card.label} className="rounded-md border border-gray-200 dark:border-gray-800 p-3">
                <div className="text-xs text-gray-500">{card.label}</div>
                <div className="text-xl font-semibold text-gray-900">{card.value}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-900">Recent Ticket Feedback</div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowRatings((prev) => !prev)}
            >
              {showRatings ? 'Hide' : 'Load'}
            </Button>
          </div>
          {!showRatings ? (
            <div className="text-sm text-gray-500">Load latest ratings from completed tickets.</div>
          ) : isFeedbackLoading ? (
            <div className="text-sm text-gray-500">Loading feedback…</div>
          ) : feedbackItems.length === 0 ? (
            <div className="text-sm text-gray-500">No recent feedback</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 text-sm">
              {feedbackItems.map(({ ticket, rating }) => (
                <div
                  key={ticket.id}
                  className="rounded-md border border-gray-200 dark:border-gray-800 p-3"
                >
                  <div className="font-medium text-gray-900">#{ticket.id.slice(0, 8)}</div>
                  <div className="text-xs text-gray-500">
                    {ticket.room?.number ? `Room ${ticket.room.number}` : 'Room N/A'}
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    {rating?.stars ? `${rating.stars}★` : 'No rating'}
                  </div>
                  {rating?.comment && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{rating.comment}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
