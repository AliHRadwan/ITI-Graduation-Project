<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\StaffRole;
class StaffRoleController extends Controller
{
    //
    public function index()
{
    return StaffRole::all();
}
public function store(Request $request)
{
    $data = $request->validate([
        'name' => 'required|string|unique:staff_roles'
    ]);

    return StaffRole::create($data);
}
public function update(Request $request, $id)
{
    $role = StaffRole::findOrFail($id);

    $data = $request->validate([
        'name' => 'required|string|unique:staff_roles,name,' . $role->id
    ]);

    $role->update($data);

    return $role;
}
public function destroy($id)
{
    $role = StaffRole::findOrFail($id);

    if ($role->memberships()->exists()) {
        return response()->json([
            'error' => 'Role is in use'
        ], 422);
    }

    $role->delete();

    return response()->json(['message' => 'Role deleted']);
}

}
