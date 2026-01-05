<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NotificationLog;
use App\Models\Ticket;
use App\Models\Conversation;

class NotificationLogSeeder extends Seeder
{
    public function run(): void
    {
        $tickets = Ticket::all();
        $conversations = Conversation::all();

        if ($conversations->isEmpty()) return;

        NotificationLog::factory()
            ->count(50)
            ->recycle($conversations) // Attach to real conversations
            ->recycle($tickets)       // Attach to real tickets (if the factory sets ticket_id)
            ->create();
    }
}