<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SlaPolicy;
use App\Models\Department;

class SlaPolicySeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::all();

        foreach ($departments as $dept) {
            // Check if policy exists to avoid duplicates
            if (SlaPolicy::where('department_id', $dept->id)->exists()) {
                continue;
            }

            SlaPolicy::factory()->create([
                'department_id' => $dept->id
            ]);
        }
    }
}
