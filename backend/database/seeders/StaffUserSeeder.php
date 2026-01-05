<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StaffUser;

class StaffUserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create one fixed Admin account (so you can always login)
        // Login: admin@hotel.com / password
        StaffUser::factory()->admin()->create();

        // 2. Create 10 random staff members
        StaffUser::factory()->count(10)->create();
    }
}