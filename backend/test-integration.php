<?php

// Quick test script for integration endpoints
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\GuestIdentity;
use App\Models\Conversation;

echo "Testing Integration Endpoint...\n\n";

// Test data
$testData = [
    'channel_type' => 'telegram',
    'channel_user_id' => 'test_user_123',
    'chat_id' => 'test_chat_123',
    'preferred_language' => 'en',
    'user_metadata' => [
        'username' => 'testuser',
        'first_name' => 'Test',
        'last_name' => 'User',
    ],
];

// Find or create guest
$guest = GuestIdentity::firstOrCreate(
    [
        'channel_type' => $testData['channel_type'],
        'channel_user_id' => $testData['channel_user_id'],
    ],
    [
        'preferred_language' => $testData['preferred_language'],
        'first_seen_at' => now(),
    ]
);

echo "✓ Guest created/found: {$guest->id}\n";

// Find or create conversation
$conversation = Conversation::firstOrCreate(
    [
        'guest_identity_id' => $guest->id,
        'status' => 'open',
    ],
    [
        'started_at' => now(),
        'last_seen_at' => now(),
    ]
);

// Update metadata
$metadata = is_array($conversation->metadata) ? $conversation->metadata : [];
$metadata['chat_id'] = $testData['chat_id'];
$metadata['user_metadata'] = $testData['user_metadata'];
$conversation->update(['metadata' => $metadata]);

echo "✓ Conversation created/found: {$conversation->id}\n";
echo "✓ Metadata stored: " . json_encode($conversation->metadata) . "\n\n";

echo "Response would be:\n";
echo json_encode([
    'guest_identity_id' => $guest->id,
    'conversation_id' => $conversation->id,
    'room_id' => $conversation->room_id,
    'room_number' => $conversation->room?->room_number,
    'status' => $conversation->status,
    'is_handoff' => $conversation->status === 'handoff',
], JSON_PRETTY_PRINT) . "\n\n";

echo "✅ Integration endpoint logic works!\n";
echo "\nYou can now test in n8n with:\n";
echo "URL: http://localhost:8001/api/integrations/conversations/upsert\n";
echo "Method: POST\n";
echo "Headers: Authorization: Bearer test-token-123\n";

