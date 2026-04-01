<?php

namespace Database\Factories;

use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Database\Eloquent\Factories\Factory;

class MessageFactory extends Factory
{
    protected $model = Message::class;

    public function definition(): array
    {
        return [
            'conversation_id' => Conversation::factory(),
            'role' => $this->faker->randomElement(['guest', 'staff', 'system']),
            'content' => $this->faker->sentence(10),
            'extracted_entities' => null,
        ];
    }
}
