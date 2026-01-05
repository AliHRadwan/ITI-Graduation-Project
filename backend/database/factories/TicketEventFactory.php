<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Ticket;
use App\Models\StaffUser;

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
            'ticket_id' => Ticket::factory(),
            'actor_staff_user_id' => StaffUser::factory(),
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
            'note' => $this->faker->sentence(),
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
