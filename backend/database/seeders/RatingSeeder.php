<?php

namespace Database\Seeders;

use App\Models\Rating;
use App\Models\Ticket;
use Illuminate\Database\Seeder;

class RatingSeeder extends Seeder
{
    public function run(): void
    {
        // Rate the tickets that actually exist
        Rating::factory()
            ->count(20)
            ->recycle(Ticket::all())
            ->create();
    }
}