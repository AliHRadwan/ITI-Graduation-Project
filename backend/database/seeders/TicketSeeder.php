<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ticket;
use App\Models\Room;
use App\Models\Department;
use App\Models\Conversation;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        // Safety Check
        if (Room::count() == 0 || Department::count() == 0) {
            $this->command->warn('Skipping Tickets: No Rooms or Departments found.');
            return;
        }

        Ticket::factory()
            ->count(50) // Create 50 tickets
            ->recycle(Room::all())       // Use EXISTING rooms
            ->recycle(Department::all()) // Use EXISTING departments
            ->recycle(Conversation::all()) // Link to EXISTING conversations (optional)
            ->create();
    }
}
