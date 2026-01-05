<?php

namespace Database\Seeders;

use App\Models\RoutingRule;
use App\Models\Department;
use Illuminate\Database\Seeder;

class RoutingRuleSeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::all();

        if ($departments->isEmpty()) return;

        // Use recycle() to pick existing Departments explicitly
        // This prevents the factory from trying to create "Maintenance" again and crashing
        RoutingRule::factory()
            ->count(10)
            ->recycle($departments)
            ->create();
    }
}