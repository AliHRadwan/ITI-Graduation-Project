<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoutingRule;

class RoutingRuleController extends Controller
{
    public function getRules()
    {
        $data = RoutingRule::with('department')->latest()->paginate(10);
        return response()->json(['data' => $data], 200);
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|uuid|exists:departments,id',
            'match_category' => 'required|string|max:255',
            'priority_default' => 'required|in:low,med,high,urgent',
            'is_active' => 'required|boolean',
        ]);

        $rule = RoutingRule::create($validated);

        return response()->json([
            'message' => 'Routing rule created successfully', 
            'data' => $rule
        ], 201);
    }   

    public function update(Request $request, RoutingRule $routingRule)
    {
        $validated = $request->validate([
            'department_id' => 'sometimes|uuid|exists:departments,id',
            'match_category' => 'sometimes|string|max:255',
            'priority_default' => 'sometimes|in:low,med,high,urgent',
            'is_active' => 'sometimes|boolean',
        ]);

        $routingRule->update($validated);

        return response()->json([
            'message' => 'Routing rule updated successfully',
            'data' => $routingRule
        ], 200);
    }

    public function deactivate(RoutingRule $routingRule)
    {
        $routingRule->update(['is_active' => false]);
        return response()->json(['message' => 'Routing rule deactivated successfully'], 200);
    }
}
