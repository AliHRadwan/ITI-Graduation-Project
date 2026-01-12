import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useReducedMotion } from 'framer-motion';

export default function TicketTrendChart({ data }) {
  const shouldReduceMotion = useReducedMotion();
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="new"
          stroke="#3b82f6"
          strokeWidth={2}
          name="New"
          isAnimationActive={!shouldReduceMotion}
          animationDuration={400}
        />
        <Line
          type="monotone"
          dataKey="resolved"
          stroke="#10b981"
          strokeWidth={2}
          name="Resolved"
          isAnimationActive={!shouldReduceMotion}
          animationDuration={400}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
