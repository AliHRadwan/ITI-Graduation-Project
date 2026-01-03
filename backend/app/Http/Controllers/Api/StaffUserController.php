<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StaffUser;
use App\Http\Requests\StoreStaffUserRequest;
use App\Http\Requests\UpdateStaffUserRequest;

class StaffUserController extends Controller
{
    //
    public function index(Request $request)
    {
        $query = StaffUser::query();

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // Include trashed (soft deleted) users if requested
        if ($request->boolean('with_trashed')) {
            $query->withTrashed();
        }

        // Only trashed users
        if ($request->boolean('only_trashed')) {
            $query->onlyTrashed();
        }

        return response()->json($query->get());
    }

    public function show($id)
    {
        $user = StaffUser::withTrashed()
            ->with(['memberships.department', 'memberships.role'])
            ->findOrFail($id);
        return response()->json($user);
    }
    public function store(StoreStaffUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);

        $user = StaffUser::create($data);

        return response()->json($user, 201);
    }
    public function update(UpdateStaffUserRequest $request, $id)
    {
        $user = StaffUser::withTrashed()->findOrFail($id);
        $data = $request->validated();

        // Hash password if provided
        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        $user->update($data);

        return response()->json($user);
    }
    public function deactivate($id)
    {
        $user = StaffUser::findOrFail($id);
        $user->update(['is_active' => false]);

        return response()->json(['message' => 'User deactivated']);
    }

    public function activate($id)
    {
        $user = StaffUser::withTrashed()->findOrFail($id);
        $user->update(['is_active' => true]);

        return response()->json(['message' => 'User activated']);
    }

    /**
     * Soft delete a user
     */
    public function destroy($id)
    {
        $user = StaffUser::findOrFail($id);
        $user->delete(); // Soft delete

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Restore a soft deleted user
     */
    public function restore($id)
    {
        $user = StaffUser::onlyTrashed()->findOrFail($id);
        $user->restore();

        return response()->json(['message' => 'User restored successfully', 'user' => $user]);
    }

    /**
     * Permanently delete a user
     */
    public function forceDelete($id)
    {
        $user = StaffUser::onlyTrashed()->findOrFail($id);
        $user->forceDelete();

        return response()->json(['message' => 'User permanently deleted']);
    }

}
