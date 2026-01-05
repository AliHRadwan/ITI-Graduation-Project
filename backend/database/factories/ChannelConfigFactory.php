<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ChannelConfig>
 */
class ChannelConfigFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'channel_type' => $this->faker->randomElements(['web', 'telegram', 'whatsapp']),
            'external_account_id' => $this->faker->phoneNumber(),
            'settings' => [
                'theme' => $this->faker->randomElement(['light', 'dark', 'system']),
                'notifications_enabled' => $this->faker->boolean(),
                'max_items' => $this->faker->numberBetween(10, 100),
                'api_key' => $this->faker->uuid(),
            ]
        ];
    }
}
