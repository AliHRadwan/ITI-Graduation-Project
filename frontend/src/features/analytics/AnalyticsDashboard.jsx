import { useMemo, useState } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { analyticsAPI, departmentsAPI, ticketsAPI } from '@/api';
import { Card, CardHeader, CardTitle, CardContent, Spinner, Input } from '@/components/ui';
import MetricCard from './MetricCard';
import TicketTrendChart from './TicketTrendChart';
import CategoryPieChart from './CategoryPieChart';
import SLAComplianceChart from './SLAComplianceChart';
import {
  TicketIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('7days');
  const [departmentId, setDepartmentId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: metrics, isLoading, isError: metricsError } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: analyticsAPI.getDashboardMetrics,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsAPI.getDepartments,
  });

  const departments = departmentsData?.items || [];

  const dateParams = useMemo(() => {
    const now = new Date();
    const endDate = now.toISOString().slice(0, 10);
    const start = new Date(now);

    if (dateRange === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (dateRange === '7days') {
      start.setDate(now.getDate() - 7);
    } else if (dateRange === '30days') {
      start.setDate(now.getDate() - 30);
    }

    const startDate = start.toISOString().slice(0, 10);
    return { startDate, endDate };
  }, [dateRange]);

  const { data: ticketReports, isError: ticketReportsError } = useQuery({
    queryKey: ['ticket-reports', dateRange, departmentId, statusFilter, priorityFilter],
    queryFn: () =>
      analyticsAPI.getTicketReports({
        startDate: dateParams.startDate,
        endDate: dateParams.endDate,
        department_id: departmentId || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      }),
    enabled: !!dateRange,
  });

  const { data: slaReports, isError: slaReportsError } = useQuery({
    queryKey: ['sla-reports', dateRange, departmentId],
    queryFn: () =>
      analyticsAPI.getSlaReports({
        startDate: dateParams.startDate,
        endDate: dateParams.endDate,
        department_id: departmentId || undefined,
        mode: 'demo',
      }),
    enabled: !!dateRange,
  });

  const tickets = ticketReports?.tickets || [];
  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort((a, b) => {
        const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
        const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [tickets]);

  const { data: slaBreaches } = useQuery({
    queryKey: ['sla-breaches'],
    queryFn: ticketsAPI.getSlaBreaches,
  });

  const eventQueries = useQueries({
    queries: recentTickets.map((ticket) => ({
      queryKey: ['ticket-events', ticket.id],
      queryFn: () => ticketsAPI.getTicketEvents(ticket.id),
      enabled: recentTickets.length > 0,
    })),
  });

  const ratingQueries = useQueries({
    queries: recentTickets.map((ticket) => ({
      queryKey: ['ticket-rating', ticket.id],
      queryFn: () => ticketsAPI.getTicketRating(ticket.id),
      enabled: recentTickets.length > 0,
    })),
  });

  const filteredTickets = useMemo(() => {
    if (!categoryFilter) return tickets;
    return tickets.filter((ticket) => ticket.category === categoryFilter);
  }, [tickets, categoryFilter]);

  const ticketTrends = useMemo(() => {
    const buckets = new Map();
    filteredTickets.forEach((ticket) => {
      const dateKey = ticket.created_at ? ticket.created_at.slice(0, 10) : null;
      if (!dateKey) return;
      if (!buckets.has(dateKey)) {
        buckets.set(dateKey, { date: dateKey, new: 0, resolved: 0 });
      }
      const bucket = buckets.get(dateKey);
      if (ticket.status === 'new') bucket.new += 1;
      if (ticket.status === 'done') bucket.resolved += 1;
    });
    return Array.from(buckets.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTickets]);

  const categoryBreakdown = useMemo(() => {
    const counts = new Map();
    filteredTickets.forEach((ticket) => {
      const key = ticket.category || 'unknown';
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredTickets]);

  const ticketStatusBreakdown = useMemo(() => {
    const counts = { new: 0, doing: 0, done: 0, canceled: 0 };
    filteredTickets.forEach((ticket) => {
      if (counts[ticket.status] !== undefined) {
        counts[ticket.status] += 1;
      }
    });
    return counts;
  }, [filteredTickets]);

  const topDepartments = useMemo(() => {
    const counts = new Map();
    filteredTickets.forEach((ticket) => {
      const name = ticket.department?.name || 'Unknown';
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [filteredTickets]);

  const topCategories = useMemo(() => {
    return categoryBreakdown
      .map((item) => ({ name: item.name, count: item.value }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [categoryBreakdown]);

  const slaCompliance = useMemo(() => {
    if (!slaReports) return [];
    const total = slaReports.totalTickets || 0;
    const breaches = slaReports.breaches || 0;
    return [
      {
        department: 'All',
        compliant: Math.max(total - breaches, 0),
        breached: breaches,
      },
    ];
  }, [slaReports]);

  const activityFeed = useMemo(() => {
    const items = [];
    recentTickets.forEach((ticket, index) => {
      const payload = eventQueries[index]?.data;
      const events = payload?.data || payload?.events?.data || [];
      events.forEach((event) => {
        items.push({
          id: event.id || `${ticket.id}-${event.created_at}`,
          ticketId: ticket.id,
          type: event.event_type,
          note: event.note,
          created_at: event.created_at,
          actor: event.staff_user?.name || 'System',
        });
      });
    });
    return items
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 8);
  }, [recentTickets, eventQueries]);

  const ratingsSummary = useMemo(() => {
    const ratings = [];
    ratingQueries.forEach((query, index) => {
      const rating = query.data;
      if (rating && rating.stars) {
        ratings.push({
          ticketId: recentTickets[index]?.id,
          stars: rating.stars,
          comment: rating.comment,
          created_at: rating.created_at,
        });
      }
    });
    const avg =
      ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + Number(r.stars || 0), 0) / ratings.length).toFixed(1)
        : '0.0';
    return {
      avg,
      count: ratings.length,
      list: ratings
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5),
    };
  }, [ratingQueries, recentTickets]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (metricsError || ticketReportsError || slaReportsError) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load analytics data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Overview of hotel operations</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
            <option value="canceled">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="med">Med</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <Input
            placeholder="Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Tickets"
          value={metrics?.openTickets || 0}
          change={metrics?.tickets_change || 0}
          icon={TicketIcon}
          color="blue"
        />
        <MetricCard
          title="Active Conversations"
          value={metrics?.activeConversations || 0}
          change={metrics?.conversations_change || 0}
          icon={ChatBubbleLeftRightIcon}
          color="green"
        />
        <MetricCard
          title="Overdue Tickets"
          value={metrics?.overdue || 0}
          change={metrics?.overdue_change || 0}
          icon={ClockIcon}
          color="yellow"
          inverse
        />
        <MetricCard
          title="Guest Satisfaction"
          value={metrics?.avgRating ? `${(metrics.avgRating * 20).toFixed(0)}%` : '0%'}
          change={metrics?.rating_change || 0}
          icon={StarIcon}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketTrendChart data={ticketTrends} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={categoryBreakdown} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>SLA Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <SLAComplianceChart data={slaCompliance} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>New</span>
                <span className="font-semibold">{ticketStatusBreakdown.new}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Doing</span>
                <span className="font-semibold">{ticketStatusBreakdown.doing}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Done</span>
                <span className="font-semibold">{ticketStatusBreakdown.done}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cancelled</span>
                <span className="font-semibold">{ticketStatusBreakdown.canceled}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Departments</CardTitle>
          </CardHeader>
          <CardContent>
            {topDepartments.length === 0 ? (
              <div className="text-sm text-gray-500">No data available</div>
            ) : (
              <div className="space-y-2 text-sm text-gray-700">
                {topDepartments.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between">
                    <span>{dept.name}</span>
                    <span className="font-semibold">{dept.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories.length === 0 ? (
              <div className="text-sm text-gray-500">No data available</div>
            ) : (
              <div className="space-y-2 text-sm text-gray-700">
                {topCategories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <span className="font-semibold">{category.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SLA Summary (Demo)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>Compliant</span>
                <span className="font-semibold">{Math.max((slaReports?.totalTickets || 0) - (slaReports?.breaches || 0), 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Breached</span>
                <span className="font-semibold">{slaReports?.breaches || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Avg Response</span>
                <span className="font-semibold">
                  {slaReports?.avgResponseMinutes != null ? `${slaReports.avgResponseMinutes}m` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Avg Resolution</span>
                <span className="font-semibold">
                  {slaReports?.avgResolutionMinutes != null ? `${slaReports.avgResolutionMinutes}m` : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SLA Breaches Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>First Response Breaches</span>
                <span className="font-semibold">{slaBreaches?.first_response_breaches?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Resolution Breaches</span>
                <span className="font-semibold">{slaBreaches?.resolution_breaches?.length || 0}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-2">
                {[...(slaBreaches?.first_response_breaches || []), ...(slaBreaches?.resolution_breaches || [])]
                  .slice(0, 5)
                  .map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between">
                      <span>#{ticket.id?.substring(0, 8)}</span>
                      <span className="text-xs text-gray-500">
                        {ticket.department?.name || 'N/A'}
                      </span>
                    </div>
                  ))}
                {(!slaBreaches?.first_response_breaches?.length && !slaBreaches?.resolution_breaches?.length) && (
                  <div className="text-xs text-gray-500">No breaches found</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Events Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activityFeed.length === 0 ? (
              <div className="text-sm text-gray-500">No recent activity</div>
            ) : (
              <div className="space-y-3 text-sm text-gray-700">
                {activityFeed.map((event) => (
                  <div key={event.id} className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">
                        #{event.ticketId?.substring(0, 8)} · {event.type?.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-gray-500">{event.note}</div>
                      <div className="text-xs text-gray-400">{event.actor}</div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {event.created_at ? event.created_at.slice(0, 16).replace('T', ' ') : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Ratings Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>Average Rating</span>
                <span className="font-semibold">{ratingsSummary.avg}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ratings Count</span>
                <span className="font-semibold">{ratingsSummary.count}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-2">
                {ratingsSummary.list.length === 0 ? (
                  <div className="text-xs text-gray-500">No ratings available</div>
                ) : (
                  ratingsSummary.list.map((rating) => (
                    <div key={`${rating.ticketId}-${rating.created_at}`} className="flex items-center justify-between">
                      <span>#{rating.ticketId?.substring(0, 8)}</span>
                      <span className="text-xs text-gray-500">
                        {rating.stars}★ {rating.comment ? `· ${rating.comment}` : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
