import { useQuery } from '@tanstack/react-query';
import { ticketsAPI } from '@/api';
import { Card, CardHeader, CardTitle, CardContent, Spinner } from '@/components/ui';
import useAuthStore from '@/store/authStore';
import MetricCard from '../analytics/MetricCard';
import { TicketIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function StaffMetrics() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ['my-tickets-all', user?.id],
    queryFn: () => ticketsAPI.getTickets({ assigned_to: user?.id }),
  });

  const tickets = Array.isArray(data) ? data : data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalTickets = tickets?.length || 0;
  const completedTickets = tickets?.filter((t) => t.status === 'done').length || 0;
  const activeTickets = tickets?.filter((t) => t.status === 'doing').length || 0;
  const completionRate = totalTickets > 0 ? (completedTickets / totalTickets) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Performance</h1>
        <p className="text-gray-600">Your personal metrics and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Tickets"
          value={totalTickets}
          icon={TicketIcon}
          color="blue"
        />
        <MetricCard
          title="Completed"
          value={completedTickets}
          icon={CheckCircleIcon}
          color="green"
        />
        <MetricCard
          title="Active"
          value={activeTickets}
          icon={ClockIcon}
          color="yellow"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Completion Rate
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {completionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

