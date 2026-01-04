<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\Conversation;
use App\Models\Rating;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getMetrics(Request $request)
    {
        try {
            // Top-level numbers: open tickets, overdue, avg rating, active conversations, etc.
            $openTickets = Ticket::where('status', 'open')->count();
            $overdueTickets = Ticket::where('status', 'open')
                ->where('created_at', '<', now()->subDays(7)) // Assuming overdue if open for more than 7 days
                ->count();
            $avgRating = Rating::avg('stars') ?? 0;
            $activeConversations = Conversation::where('status', 'active')->count();

            return response()->json([
                'success' => true,
                'message' => 'Metrics retrieved successfully',
                'data' => [
                    'openTickets' => $openTickets,
                    'overdue' => $overdueTickets,
                    'avgRating' => round($avgRating, 2),
                    'activeConversations' => $activeConversations,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve metrics: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    public function getTicketReports(Request $request)
    {
        try {
            // Ticket report (date range, by department/status/priority)
            $query = Ticket::query();

            if ($request->has('startDate') && $request->has('endDate')) {
                $query->whereBetween('created_at', [$request->startDate, $request->endDate]);
            }

            if ($request->has('department')) {
                $query->where('department_id', $request->department);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('priority')) {
                $query->where('priority', $request->priority);
            }

            $tickets = $query->with(['department', 'staffUser'])->get();

            return response()->json([
                'success' => true,
                'message' => 'Ticket reports retrieved successfully',
                'data' => [
                    'tickets' => $tickets,
                    'filters' => $request->only(['startDate', 'endDate', 'department', 'status', 'priority'])
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve ticket reports: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    public function getSLAReports(Request $request)
    {
        try {
            // SLA report (breaches, avg response/resolution times)
            // Note: SLA breach calculation requires additional columns or logic
            $breaches = 0; // Placeholder, as 'sla_breached' column doesn't exist

            // Placeholder for avg times, as 'first_response_at' and 'resolved_at' columns don't exist
            $avgResponseTime = 'N/A';
            $avgResolutionTime = 'N/A';

            return response()->json([
                'success' => true,
                'message' => 'SLA reports retrieved successfully',
                'data' => [
                    'breaches' => $breaches,
                    'avgResponseTime' => $avgResponseTime,
                    'avgResolutionTime' => $avgResolutionTime,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve SLA reports: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}