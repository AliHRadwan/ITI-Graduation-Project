<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TicketEvent;
use App\Models\Ticket;
use App\Models\StaffUser;

class TicketEventSeeder extends Seeder
{
    public function run(): void
    {
        // Load existing data
        $tickets = Ticket::all();
        $staff = StaffUser::all();

        // Safety check
        if ($tickets->isEmpty() || $staff->isEmpty()) {
            return; 
        }

        // Create events that belong to REAL tickets and REAL staff
        TicketEvent::factory()
            ->count(50)
            ->recycle($tickets) // Link to existing tickets
            ->recycle($staff)   // Link to existing staff (actors)
            ->create();
    }
}