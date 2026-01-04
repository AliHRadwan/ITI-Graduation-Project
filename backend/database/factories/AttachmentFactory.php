<?php

namespace Database\Factories;

use App\Models\Attachment;
use App\Models\Message;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttachmentFactory extends Factory
{
    protected $model = Attachment::class;

    public function definition(): array
    {
        return [
            'message_id' => Message::factory(),
            'type' => $this->faker->randomElement(['image', 'audio', 'video', 'file']),
            'storage_url' => 'http://127.0.0.1:8000/storage/attachments/demo.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => 12345,
            'transcript' => null,
        ];
    }
}
