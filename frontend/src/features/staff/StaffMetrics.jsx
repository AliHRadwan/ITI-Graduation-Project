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

  const tickets = data?.items || [];

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
  const safeCompletionRate = Number.isFinite(completionRate) ? completionRate : 0;

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
            <div className="flex items-center justify-center">
              <div className="relative h-36 w-36">
                <svg viewBox="0 0 36 36" className="h-36 w-36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="3.5"
                    strokeDasharray={`${safeCompletionRate.toFixed(1)}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-gray-700">
                  {safeCompletionRate.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
