<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SlaPolicy>
 */
class SlaPolicyFactory extends Factory
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
            'first_response_minutes' => $this->faker->numberBetween(15, 60),
            'resolution_minutes' => $this->faker->numberBetween(1440, 2160),
            'quiet_hours' => json_encode([
                'start' => '09:00',
                'end' => '18:00',
                'days' => ['Friday', 'Saturday'],
            ]),
            'is_active' => $this->faker->boolean(80),
        ];
    }
}
