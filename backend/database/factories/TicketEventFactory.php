<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketEvent>
 */
class TicketEventFactory extends Factory
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
            'actor_staff_user_id' => \App\Models\User::factory(),
            'event_type' => $this->faker->randomElement([
                'note',
                'created',
                'merged',
                'escalated',
                'closed',
                'reopened',
                'assigned',
                'status_changed',
                'priority_changed',
            ]),
            'note' => $this->faker->optional()->paragraph(),
        ];
    }
}
