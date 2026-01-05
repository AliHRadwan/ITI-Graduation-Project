<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Message;
use App\Models\Conversation;

class MessageSeeder extends Seeder
{
    public function run(): void
    {
        // Add these messages to the ACTUAL conversations created above
        Message::factory()
            ->count(10) // You might want to increase this to 50+ to see more data
            ->recycle(Conversation::all()) 
            ->create();
    }
}