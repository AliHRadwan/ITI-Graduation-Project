<?php

namespace App\Http\Controllers;

use App\Models\SlaPolicy;
use App\Models\Ticket;
use Illuminate\Http\Request;

class SlaController extends Controller
{
    public function getPolicies()
    {
        return response()->json([
            'data' => SlaPolicy::with('department')->paginate(10)
        ], 200);
    }

    public function createPolicy(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|uuid|exists:departments,id|unique:sla_policies,department_id',
            'first_response_minutes' => 'required|integer|min:1|max:120',
            'resolution_minutes' => 'required|integer|min:1|max:4320',
            'quiet_hours' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $policy = SlaPolicy::create($validated);
        return response()->json([
            'message' => 'Policy created successfully',
            'data' => $policy
        ], 201);
    }

    public function updatePolicy(Request $request, SlaPolicy $policy)
    {
        $validated = $request->validate([
            'department_id' => 'sometimes|uuid|exists:departments,id|unique:sla_policies,department_id,' . $policy->id,
            'first_response_minutes' => 'sometimes|integer|min:1|max:120',
            'resolution_minutes' => 'sometimes|integer|min:1|max:4320',
            'quiet_hours' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $policy->update($validated);
        return response()->json(['message' => 'Policy updated successfully', 'data' => $policy], 200);
    }

    public function deactivatePolicy(SlaPolicy $policy)
    {
        $policy->update(['is_active' => false]);
        return response()->json(['message' => 'Policy deactivated successfully.'], 200);
    }

    public function getBreaches()
    {
        $newTickets = Ticket::with('department.slaPolicy')
            ->where('status', 'new')
            ->get();

        $firstResponseBreaches = [];
        foreach ($newTickets as $ticket) {
            $policy = $ticket->department->slaPolicy ?? null;
            if ($policy && $ticket->checkSlaFirstResponseBreaches($policy)) {
                $firstResponseBreaches[] = $ticket;
            }
        }

        $unresolvedTickets = Ticket::with('department.slaPolicy')
            ->whereIn('status', ['new', 'doing'])
            ->get();

        $resolutionBreaches = [];
        foreach ($unresolvedTickets as $ticket) {
            $policy = $ticket->department->slaPolicy ?? null;
            if ($policy && $ticket->checkSlaResolutionBreaches($policy)) {
                $resolutionBreaches[] = $ticket;
            }
        }

        return response()->json([
            "first_response_breaches" => $firstResponseBreaches,
            "resolution_breaches" => $resolutionBreaches
        ]);
    }
}
