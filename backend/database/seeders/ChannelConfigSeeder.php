<?php

namespace Database\Seeders;

use App\Models\ChannelConfig;
use Illuminate\Database\Seeder;

class ChannelConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $channels = [
            [
                'channel_type' => 'web',
                'external_account_id' => 'web_widget_001',
                'settings' => [
                    'widget_id' => 'widget_123456',
                    'primary_color' => '#007bff',
                    'position' => 'bottom-right',
                    'welcome_message' => 'Welcome to our hotel! How can we help you today?',
                ],
            ],
            [
                'channel_type' => 'telegram',
                'external_account_id' => 'bot_telegram_001',
                'settings' => [
                    'bot_token' => '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
                    'bot_username' => '@HotelSupportBot',
                    'webhook_url' => 'https://api.telegram.org/bot',
                ],
            ],
            [
                'channel_type' => 'whatsapp',
                'external_account_id' => 'wa_business_001',
                'settings' => [
                    'phone_number_id' => '123456789012345',
                    'business_account_id' => '987654321098765',
                    'api_version' => 'v17.0',
                ],
            ],
        ];

        foreach ($channels as $channel) {
            ChannelConfig::firstOrCreate(
                ['external_account_id' => $channel['external_account_id']],
                [
                    'channel_type' => $channel['channel_type'],
                    'settings' => $channel['settings'],
                ]
            );
        }

        $this->command->info('Channel configurations seeded successfully!');
    }
}
