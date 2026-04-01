<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NotificationLog>
 */
class NotificationLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ticket_id' => \App\Models\Ticket::factory(),
            'conversation_id' => \App\Models\Conversation::factory(),
            'channel_type' => $this->faker->randomElement(['web', 'telegram', 'whatsapp']),
            'message_type' => $this->faker->randomElement(['confirm', 'eta', 'delay', 'status', 'rating']),
            'payload' => $this->faker->text(200),
            'sent_at' => $this->faker->dateTimeBetween('now', '+1 day'),
            'status' => $this->faker->randomElement(['sent', 'failed']),
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
