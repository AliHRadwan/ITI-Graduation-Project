<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\Conversation;
use App\Models\Rating;
use Carbon\Carbon;
use App\Models\Department;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getMetrics(Request $request)
    {
        try {
            // Top-level numbers: open tickets, overdue, avg rating, active conversations, etc.
            $openTickets = Ticket::where('status', 'new')->count();
            $overdueTickets = Ticket::where('status', 'new')
                ->where('created_at', '<', now()->subDays(7)) // Assuming overdue if open for more than 7 days
                ->count();
            $avgRating = Rating::avg('stars') ?? 0;
            $activeConversations = Conversation::where('status', 'open')->count();

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

            if ($request->filled('department_id')) {
                $query->where('department_id', $request->department_id);
            }

            if ($request->filled('department')) {
                $deptId = Department::where('name', $request->department)->value('id');
                $query->where('department_id', $deptId ?? '__no_such_department__');
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
        $start  = $request->input('startDate');
        $end    = $request->input('endDate');
        $deptId = $request->input('department_id');

        $mode = $request->input('mode', 'strict');
        if (!in_array($mode, ['strict', 'demo'], true)) {
            $mode = 'strict';
        }

        $minCoverage = 0.30;

        // demo cap (default 24h). override: demo_cap_minutes (30..10080)
        $demoCapMinutes = 1440;
        if ($mode === 'demo' && $request->filled('demo_cap_minutes')) {
            $cap = (int) $request->input('demo_cap_minutes');
            if ($cap >= 30 && $cap <= 10080) {
                $demoCapMinutes = $cap;
            }
        }

        $closedStatuses = ['done', 'closed', 'resolved'];

        $firstResponseSub = DB::table('ticket_events')
            ->selectRaw('ticket_id, MIN(created_at) as first_response_at')
            ->whereNotNull('actor_staff_user_id')
            ->whereIn('event_type', ['assigned', 'note', 'escalated', 'status_changed', 'priority_changed'])
            ->groupBy('ticket_id');

        $resolvedSub = DB::table('ticket_events')
            ->selectRaw('ticket_id, MAX(created_at) as resolved_at')
            ->where('event_type', 'status_changed')
            ->where('note', 'like', '%-> done%')
            ->groupBy('ticket_id');

        $q = DB::table('tickets')
            ->leftJoinSub($firstResponseSub, 'fr', fn ($j) => $j->on('tickets.id', '=', 'fr.ticket_id'))
            ->leftJoinSub($resolvedSub, 'rs', fn ($j) => $j->on('tickets.id', '=', 'rs.ticket_id'))
            ->leftJoin('sla_policies', fn ($j) => $j->on('tickets.department_id', '=', 'sla_policies.department_id'));

        if ($start && $end) {
            $q->whereBetween('tickets.created_at', [$start, $end]);
        }
        if ($deptId) {
            $q->where('tickets.department_id', $deptId);
        }

        $rows = $q->select([
                'tickets.id',
                'tickets.status',
                'tickets.created_at',
                'tickets.updated_at',
                DB::raw('fr.first_response_at'),
                DB::raw('rs.resolved_at'),
                DB::raw('COALESCE(sla_policies.first_response_minutes, 30) as fr_mins'),
                DB::raw('COALESCE(sla_policies.resolution_minutes, 240) as res_mins'),
            ])
            ->get();

        $total = $rows->count();

        $firstBreaches = 0;
        $resBreaches   = 0;

        $responseTimes   = [];
        $resolutionTimes = [];

        $invalidResponseSamples = 0;
        $invalidResolutionSamples = 0;
        $estimatedResponseSamples = 0;
        $estimatedResolutionSamples = 0;

        foreach ($rows as $t) {
            $createdAt = Carbon::parse($t->created_at);

            // -------- First Response --------
            if ($t->first_response_at) {
                $frAt = Carbon::parse($t->first_response_at);
                $mins = $createdAt->diffInMinutes($frAt, false);

                if ($mins >= 0) {
                    $responseTimes[] = $mins;
                    if ($mins > (int) $t->fr_mins) $firstBreaches++;
                } else {
                    if ($mode === 'demo') {
                        // demo: estimate + clamp (winsorize)
                        $mins = abs($mins);
                        if ($mins > $demoCapMinutes) $mins = $demoCapMinutes;

                        $responseTimes[] = $mins;
                        $estimatedResponseSamples++;

                        if ($mins > (int) $t->fr_mins) $firstBreaches++;
                    } else {
                        $invalidResponseSamples++;
                    }
                }
            } else {
                if (now()->diffInMinutes($createdAt) > (int) $t->fr_mins) {
                    $firstBreaches++;
                }
            }

            // -------- Resolution --------
            $resolvedAt = null;

            if ($t->resolved_at) {
                $resolvedAt = Carbon::parse($t->resolved_at);
            } else {
                if (in_array($t->status, $closedStatuses, true)) {
                    $resolvedAt = Carbon::parse($t->updated_at);
                }
            }

            if ($resolvedAt) {
                $mins = $createdAt->diffInMinutes($resolvedAt, false);

                if ($mins >= 0) {
                    $resolutionTimes[] = $mins;
                    if ($mins > (int) $t->res_mins) $resBreaches++;
                } else {
                    if ($mode === 'demo') {
                        $mins = abs($mins);
                        if ($mins > $demoCapMinutes) $mins = $demoCapMinutes;

                        $resolutionTimes[] = $mins;
                        $estimatedResolutionSamples++;

                        if ($mins > (int) $t->res_mins) $resBreaches++;
                    } else {
                        $invalidResolutionSamples++;
                    }
                }
            }
        }

        $usedResponse   = count($responseTimes);
        $usedResolution = count($resolutionTimes);

        $responseCoverage   = $total > 0 ? $usedResponse / $total : 0;
        $resolutionCoverage = $total > 0 ? $usedResolution / $total : 0;

        $avgResponse = ($usedResponse > 0 && $responseCoverage >= $minCoverage)
            ? round(array_sum($responseTimes) / $usedResponse, 2)
            : null;

        $avgResolution = ($usedResolution > 0 && $resolutionCoverage >= $minCoverage)
            ? round(array_sum($resolutionTimes) / $usedResolution, 2)
            : null;

        $availability = [
            'avgResponse' => !is_null($avgResponse),
            'avgResolution' => !is_null($avgResolution),
        ];

        $quality = [
            'response' => ($responseCoverage >= $minCoverage) ? 'good' : 'low',
            'resolution' => ($resolutionCoverage >= $minCoverage) ? 'good' : 'low',
        ];

        $notes = [];

        if ($total === 0) {
            $notes[] = 'No tickets found for the selected filters.';
        } else {
            if ($responseCoverage < $minCoverage) {
                $notes[] = 'Average response time is not shown due to low data coverage.';
            }
            if ($resolutionCoverage < $minCoverage) {
                $notes[] = 'Average resolution time is not shown due to low data coverage.';
            }

            if ($mode === 'strict' && ($invalidResponseSamples > 0 || $invalidResolutionSamples > 0)) {
                $notes[] = 'Some events were ignored due to inconsistent timestamps (event time earlier than ticket creation).';
            }

            if ($mode === 'demo') {
                $notes[] = "Demo mode: estimated times are clamped to {$demoCapMinutes} minutes to avoid noisy seed data.";
                if ($estimatedResponseSamples > 0 || $estimatedResolutionSamples > 0) {
                    $notes[] = 'Demo mode: some SLA times are estimated due to inconsistent timestamps in seed data.';
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'SLA reports retrieved successfully',
            'data' => [
                'totalTickets' => $total,
                'breaches' => $firstBreaches + $resBreaches,
                'firstResponseBreaches' => $firstBreaches,
                'resolutionBreaches' => $resBreaches,

                'avgResponseMinutes' => $avgResponse,
                'avgResolutionMinutes' => $avgResolution,

                'coverage' => [
                    'response' => round($responseCoverage, 4),
                    'resolution' => round($resolutionCoverage, 4),
                ],
                'availability' => $availability,
                'quality' => $quality,
                'notes' => $notes,

                'meta' => [
                    'mode' => $mode,
                    'minCoverage' => $minCoverage,
                    'demoCapMinutes' => ($mode === 'demo') ? $demoCapMinutes : null,
                ],
            ],
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