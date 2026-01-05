<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Conversation;
use App\Models\GuestIdentity;
use App\Models\Room;

class ConversationSeeder extends Seeder
{
    public function run(): void
    {
        // Link these conversations to the Guests and Rooms you already created
        Conversation::factory()
            ->count(10)
            ->recycle(GuestIdentity::all())
            ->recycle(Room::all())
            ->create();
    }
}