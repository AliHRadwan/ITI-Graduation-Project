import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/api';
import { Card, CardHeader, CardTitle, CardContent, Spinner } from '@/components/ui';
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

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: dashboardAPI.getMetrics,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: ticketReports } = useQuery({
    queryKey: ['ticket-reports', dateRange],
    queryFn: () => dashboardAPI.getTicketReports({ range: dateRange }),
    enabled: !!dateRange,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
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
          className="rounded-md border-gray-300"
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="custom">Custom Range</option>
        </select>
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
            <TicketTrendChart data={ticketReports?.trends || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={ticketReports?.by_category || []} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>SLA Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <SLAComplianceChart data={ticketReports?.sla_compliance || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

