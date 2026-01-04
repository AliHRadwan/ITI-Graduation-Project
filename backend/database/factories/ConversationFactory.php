<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Conversation>
 */
class ConversationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'guest_identity_id' => \App\Models\GuestIdentity::factory(),
            'room_id' => \App\Models\Room::factory(),
            'status' => $this->faker->randomElement(['open', 'handoff', 'closed']),
            'started_at' => $this->faker->dateTimeBetween('now', '+1 day'),
            'last_seen_at' => $this->faker->dateTimeBetween('now', '+1 day'),
        ];
    }
}
