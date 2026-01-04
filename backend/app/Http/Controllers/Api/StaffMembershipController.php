<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StaffMembership;
class StaffMembershipController extends Controller
{
    //
public function index()
{
    return StaffMembership::with([
        'staffUser',
        'department',
        'role'
    ])->get();
}

public function store(Request $request)
{
    $data = $request->validate([
        'department_id' => 'required|uuid|exists:departments,id',
        'staff_user_id' => 'required|exists:staff_users,id',
        'staff_role_id' => 'required|exists:staff_roles,id',
    ]);

    $membership = StaffMembership::create($data);

    return response()->json($membership, 201);
}
public function update(Request $request, $id)
{
    $membership = StaffMembership::findOrFail($id);

    $data = $request->validate([
        'department_id' => 'required|uuid|exists:departments,id',
        'staff_role_id' => 'sometimes|exists:staff_roles,id',
    ]);

    $membership->update($data);

    return response()->json($membership);
}
public function destroy($id)
{
    StaffMembership::findOrFail($id)->delete();

    return response()->json(['message' => 'Membership removed']);
}


}
