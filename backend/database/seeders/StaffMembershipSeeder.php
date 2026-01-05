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
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Get the existing data we created in previous steps
        $users = StaffUser::all();
        $departments = Department::all();
        $roles = StaffRole::all();

        // Safety check: ensure we actually have data to work with
        if ($users->isEmpty() || $departments->isEmpty() || $roles->isEmpty()) {
            $this->command->error('Missing users, departments, or roles. Did you run those seeders first?');
            return;
        }

        // 2. Loop through every existing user and assign them to a random department
        foreach ($users as $user) {
            
            // Check if this user already has a membership (to avoid duplicates if you run seed twice)
            if (StaffMembership::where('staff_user_id', $user->id)->exists()) {
                continue;
            }

            StaffMembership::factory()->create([
                'staff_user_id' => $user->id,                  // Use the EXISTING user
                'department_id' => $departments->random()->id, // Use a RANDOM EXISTING department
                'staff_role_id' => $roles->random()->id,       // Use a RANDOM EXISTING role
            ]);
        }
    }
}
