<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\GuestIdentity;
use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

class ConversationFactory extends Factory
{
    protected $model = Conversation::class;

    public function definition(): array
    {
        return [
            'guest_identity_id' => GuestIdentity::factory(),
            'room_id' => Room::factory(),
            'status' => $this->faker->randomElement(['open', 'handoff', 'closed']),
            'started_at' => now()->subHours($this->faker->numberBetween(1, 72)),
            'last_seen_at' => now()->subMinutes($this->faker->numberBetween(1, 120)),
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
