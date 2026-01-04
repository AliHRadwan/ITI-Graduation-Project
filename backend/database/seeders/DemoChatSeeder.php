<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;
use App\Models\GuestIdentity;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Attachment;

class DemoChatSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Rooms
        $rooms = Room::factory()->count(20)->create();

        // 2) Guests
        $guests = GuestIdentity::factory()->count(15)->create();

        foreach ($guests as $guest) {
            // 3) Conversations لكل Guest
            $convs = Conversation::factory()
                ->count(rand(1, 3))
                ->create([
                    'guest_identity_id' => $guest->id,
                    'room_id' => $rooms->random()->id,
                    'status' => 'open',
                ]);

            foreach ($convs as $conv) {
                // 4) Messages لكل Conversation
                $messages = Message::factory()
                    ->count(6)
                    ->create([
                        'conversation_id' => $conv->id,
                    ]);

                // 5) Attachment واحد على أول message (اختياري)
                Attachment::factory()->create([
                    'message_id' => $messages->first()->id,
                ]);
            }
        }
    }
}
