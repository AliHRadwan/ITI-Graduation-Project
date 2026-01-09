<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StaffUser;
use App\Http\Requests\StoreStaffUserRequest;
use App\Http\Requests\UpdateStaffUserRequest;
use Illuminate\Support\Facades\DB;

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

        $users = $query
            ->with(['memberships.role', 'memberships.department'])
            ->paginate((int) $request->input('per_page', 5));

        $items = collect($users->items())->map(fn ($user) => $this->serializeStaffUser($user));

        return response()->json([
            'items' => $items,
            'pagination' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    public function show($id)
    {
        $user = StaffUser::withTrashed()
            ->with(['memberships.department', 'memberships.role'])
            ->findOrFail($id);

        return response()->json($this->serializeStaffUser($user));
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
        $membershipData = [
            'staff_role_id' => $data['staff_role_id'],
            'department_id' => $data['department_id'] ?? null,
        ];
        unset($data['staff_role_id'], $data['department_id']);

        // Hash password if provided
        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        DB::transaction(function () use ($user, $data, $membershipData) {
            $user->update($data);

            $membership = $user->memberships()->first();
            if ($membership) {
                $membership->update($membershipData);
            } else {
                $user->memberships()->create($membershipData);
            }
        });

        $user->load(['memberships.department', 'memberships.role']);

        return response()->json($this->serializeStaffUser($user));
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
        DB::transaction(function () use ($user) {
            $user->memberships()->delete();
            $user->delete(); // Soft delete
        });

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

    private function serializeStaffUser(StaffUser $user): array
    {
        $membership = $user->memberships->first();
        $role = $membership?->role;
        $department = $membership?->department;

        return [
            'id' => $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'is_active' => (bool) $user->is_active,
            'created_at' => $user->created_at?->toISOString(),
            'role' => $role ? [
                'id' => $role->id,
                'name' => $role->name,
            ] : null,
            'department' => $department ? [
                'id' => $department->id,
                'name' => $department->name,
            ] : null,
        ];
    }

}
