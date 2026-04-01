<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ticket>
 */
class TicketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'department_id' => \App\Models\Department::factory(),
            'room_id' => \App\Models\Room::factory(),
            'conversation_id' => \App\Models\Conversation::factory(),
            'category' => $this->faker->word(),
            'status' => $this->faker->randomElement(['new', 'doing', 'done', 'canceled']),
            'priority' => $this->faker->randomElement(['low', 'med', 'high', 'urgent']),
            'description' => $this->faker->paragraph(),
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
