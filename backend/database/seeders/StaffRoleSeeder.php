<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\StaffRole;

class StaffRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $roles = ['Admin', 'Manager', 'Staff', 'ReadOnly'];
        foreach ($roles as $role) {
            StaffRole::firstOrCreate(['name' => $role]);
    }
}
}
