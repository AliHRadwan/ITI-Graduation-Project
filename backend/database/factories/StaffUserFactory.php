<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StaffUser>
 */
class StaffUserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    
    // Optimization: Store the hashed password so we don't re-hash it for every single user
    protected static ?string $password;

    public function definition(): array
    {
        return [
            // Note: We don't need to define 'id' here if your Model uses the HasUuids trait
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'), // Default password is 'password'
            'is_active' => fake()->boolean(90), // 90% chance of being Active
        ];
    }
    
    /**
     * State: Create an Admin user specifically.
     */
    public function admin()
    {
        return $this->state(fn (array $attributes) => [
            'email' => 'admin@hotel.com',
            'is_active' => true,
        ]);
    }
}
