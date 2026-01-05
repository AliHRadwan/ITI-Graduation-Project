<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call([
            // 1. Parents
            RoomSeeder::class,
            DepartmentSeeder::class,
            ChannelConfigSeeder::class,
            StaffRoleSeeder::class,
            StaffUserSeeder::class,
            GuestIdentitySeeder::class,
            ProactiveRuleSeeder::class,

            // 2. Direct Children
            QrRoomTokenSeeder::class,
            StaffMembershipSeeder::class,
            SlaPolicySeeder::class,
            RoutingRuleSeeder::class,
            ConversationSeeder::class,

            // 3. Operational Data
            MessageSeeder::class,
            TicketSeeder::class,

            // 4. Deep Children
            AttachmentSeeder::class,
            TicketEventSeeder::class,
            RatingSeeder::class,
            NotificationLogSeeder::class,
        ]);
    }
}
