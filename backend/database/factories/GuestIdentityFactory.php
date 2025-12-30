<?php

namespace Database\Factories;

use App\Models\GuestIdentity;
use Illuminate\Database\Eloquent\Factories\Factory;

class GuestIdentityFactory extends Factory
{
    protected $model = GuestIdentity::class;

    public function definition(): array
    {
        $channelType = $this->faker->randomElement(['web', 'telegram']);

        return [
            'channel_type' => $channelType,
            'channel_user_id' => $channelType === 'telegram'
                ? $this->faker->unique()->e164PhoneNumber()
                : 'anon_'.$this->faker->unique()->numberBetween(1000, 9999),
            'preferred_language' => $this->faker->randomElement(['ar', 'en']),
            'first_seen_at' => now()->subDays($this->faker->numberBetween(0, 30)),
        ];
    }
}
