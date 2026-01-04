<?php

namespace Database\Seeders;

use App\Models\NotificationLog;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NotificationLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        NotificationLog::factory()->count(50)->create();
    }
}
