<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\StaffUser;
use App\Models\Department;
use App\Models\StaffRole;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StaffMembership>
 */
class StaffMembershipFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // By default, create a NEW User, NEW Dept, and NEW Role for every membership.
            // This guarantees the unique constraint (user_id + dept_id) is never violated
            // when creating simple random data.
            'staff_user_id' => StaffUser::factory(),
            'department_id' => Department::factory(),
            'staff_role_id' => StaffRole::factory(),
        ];
    }
}
