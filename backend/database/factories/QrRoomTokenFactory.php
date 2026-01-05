<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\QrRoomToken>
 */
class QrRoomTokenFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // 1. Determine when it was issued (e.g., sometime in the last week)
        $issuedAt = $this->faker->dateTimeBetween('-7 days', 'now');

        // 2. Determine expiration (e.g., 48 hours after issue)
        // We clone the date so we don't modify the original $issuedAt object
        $expiresAt = (clone $issuedAt)->modify('+48 hours');

        return [
            // Automatically create a Room if one isn't passed in
            'room_id' => \App\Models\Room::factory(),

            // Generate a realistic looking SHA-256 hash
            'token_hash' => hash('sha256', Str::random(40)),

            'issued_at' => $issuedAt,
            'expires_at' => $expiresAt,
            
            // 90% chance of being active
            'is_active' => $this->faker->boolean(90),
        ];
    }

    /**
     * State: Create an expired token.
     */
    public function expired()
    {
        return $this->state(function (array $attributes) {
            return [
                'issued_at' => $this->faker->dateTimeBetween('-1 month', '-2 days'),
                'expires_at' => $this->faker->dateTimeBetween('-2 days', '-1 hour'), // Date in the past
                'is_active' => false,
            ];
        });
    }
}
