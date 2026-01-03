<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RoutingRule;
use Symfony\Component\Routing\Route;

class RoutingRuleController extends Controller
{
    public function getRules()
    {
        $data = RoutingRule::latest()->paginate(10);
        return response()->json(['data' => $data], 200);
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|uuid|exists:departments,id',
            'match_category' => 'required|string',
            'priority_default' => 'required|enum:low,med,high,urgent',
            'is_active' => 'required|boolean',
        ]);

        RoutingRule::create($validated);

        return response()->json(['message' => 'Routing rule created successfully'], 201);
    }   

    public function update(Request $request, $routingRule)
    {
        $validated = $request->validate([
            'department_id' => 'sometimes|uuid|exists:departments,id',
            'match_category' => 'sometimes|string',
            'priority_default' => 'sometimes|enum:low,med,high,urgent',
            'is_active' => 'sometimes|boolean',
        ]);

        $routingRule->update($validated);

        return response()->json(['message' => 'Routing rule updated successfully'], 200);
    }

    public function deactivate($routingRule)
    {
        $routingRule->is_active = false;
        $routingRule->save();
        
        return response()->json(['message' => 'Routing rule deactivated successfully'], 200);
    }
}
