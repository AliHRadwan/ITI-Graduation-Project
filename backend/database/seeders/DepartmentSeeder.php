<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            ['name' => 'Housekeeping', 'is_active' => true],
            ['name' => 'Maintenance', 'is_active' => true],
            ['name' => 'Reception', 'is_active' => true],
            ['name' => 'Room Service', 'is_active' => true],
            ['name' => 'Concierge', 'is_active' => true],
            ['name' => 'Management', 'is_active' => true]
        ];

        foreach ($departments as $department) {
            Department::firstOrCreate(
                ['name' => $department['name']],
                ['is_active' => $department['is_active']]
            );
        }

        $this->command->info('Departments seeded successfully!');
    }
}
