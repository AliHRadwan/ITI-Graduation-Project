<?php

namespace App\Http\Controllers;

use App\Models\SlaPolicy;
use App\Models\Ticket;
use Illuminate\Http\Request;

class SlaController extends Controller
{
    public function getPolicies()
    {
        return SlaPolicy::orderBy('department_id')->paginate(10);
    }

    public function createPolicy(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'first_response_minutes' => 'required|integer|min:0',
            'resolution_minutes' => 'required|integer|min:0',
            'quiet_hours' => 'nullable|array',
            'is_active' => 'boolean',
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
            'department_id' => 'sometimes|exists:departments,id',
            'first_response_minutes' => 'sometimes|integer|min:0',
            'resolution_minutes' => 'sometimes|integer|min:0',
            'quiet_hours' => 'sometimes|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $policy->update($validated);
        return response()->json('Policy updated successfully: ' . $policy, 200);
    }

    public function deactivatePolicy(SlaPolicy $policy)
    {
        $policy->is_active = false;
        $policy->save();
        return response()->json('Policy deactivated successfully.', 200);
    }

    public function getBreaches()
    {
        $newTickets = Ticket::with('department.slaPolicy')->where('status', 'new')->get();
        $firstResponseBreaches = [];
        foreach ($newTickets as $ticket) {
            if ($ticket->checkSlaFirstResponseBreaches($ticket->department->slaPolicy ?? null)) {
                $firstResponseBreaches[] = $ticket;
            }
        }

        $unresolvedTickets = Ticket::with('department.slaPolicy')
            ->whereIn('status', ['new', 'doing'])
            ->get();
        $resolutionBreaches = [];
        foreach ($unresolvedTickets as $ticket) {
            if ($ticket->checkSlaResolutionBreaches($ticket->department->slaPolicy ?? null)) {
                $resolutionBreaches[] = $ticket;
            }
        }

        return response()->json([
            "first_response_breaches" => $firstResponseBreaches,
            "resolution_breaches" => $resolutionBreaches
        ]);
    }
}
