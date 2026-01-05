<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attachment;
use App\Models\Message;

class AttachmentSeeder extends Seeder
{
    public function run(): void
    {
        // Attach files to the messages created above
        Attachment::factory()
            ->count(10)
            ->recycle(Message::all())
            ->create();
    }
}