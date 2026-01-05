<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\QrRoomToken;
use App\Models\Room;

class QrRoomTokenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rooms = Room::all();

        foreach ($rooms as $room) {
            QrRoomToken::factory()->create([
                'room_id' => $room->id
            ]);
        }
    }
}
