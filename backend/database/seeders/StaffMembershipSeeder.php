<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\StaffMembership;
use App\Models\StaffUser;
use App\Models\Department;
use App\Models\StaffRole;

class StaffMembershipSeeder extends Seeder
{
    public function run(): void
    {
        $users = StaffUser::all();
        $departments = Department::all();
        $roles = StaffRole::all();

        // Safety check
        if ($users->isEmpty() || $departments->isEmpty() || $roles->isEmpty()) {
            $this->command->error('Missing users, departments, or roles.');
            return;
        }

        // 1. Capture the critical IDs
        $adminRole = $roles->firstWhere('name', 'Admin');
        $managementDept = $departments->firstWhere('name', 'Management');

        foreach ($users as $user) {
            // Skip if already has a membership
            if (StaffMembership::where('staff_user_id', $user->id)->exists()) {
                continue;
            }

            // --- LOGIC START ---

            if ($user->email === 'admin@hotel.com' && $adminRole && $managementDept) {
                // CASE 1: The Super Admin
                // Strictly enforce Admin Role + Management Dept
                $roleIdToAssign = $adminRole->id;
                $deptIdToAssign = $managementDept->id;
            } else {
                // CASE 2: Everyone Else
                // Logic: "Admin" role is forbidden for them.
                
                // Get a random role from the list EXCLUDING the Admin role
                $availableRoles = $roles->where('id', '!=', $adminRole->id);
                
                $roleIdToAssign = $availableRoles->random()->id;
                $deptIdToAssign = $departments->random()->id;
            }

            // --- LOGIC END ---

            StaffMembership::factory()->create([
                'staff_user_id' => $user->id,
                'department_id' => $deptIdToAssign,
                'staff_role_id' => $roleIdToAssign,
            ]);
        }
    }
}