<?php

namespace App\Services;

use App\Models\QrRoomToken;
use App\Models\Room;
use Illuminate\Support\Str;
use Carbon\Carbon;

class QrTokenService
{
    /**
     * Generate a unique QR token for a room.
     */
    public function generateToken(Room $room, ?string $expiresAt = null): array
    {
        $token = Str::random(64);
        $tokenHash = hash('sha256', $token);

        $qrToken = QrRoomToken::create([
            'room_id' => $room->id,
            'token_hash' => $tokenHash,
            'issued_at' => now(),
            'expires_at' => $expiresAt,
            'is_active' => true,
        ]);

        return [
            'qr_token' => $qrToken,
            'plain_token' => $token,
            'deep_link' => config('app.url') . '/api/qr/resolve/' . $token,
        ];
    }

    /**
     * Resolve a token to get the room information.
     */
    public function resolveToken(string $token): ?array
    {
        $tokenHash = hash('sha256', $token);

        $qrToken = QrRoomToken::where('token_hash', $tokenHash)
            ->where('is_active', true)
            ->with('room')
            ->first();

        if (!$qrToken) {
            return null;
        }

        // Check if token is expired
        if ($qrToken->expires_at && Carbon::parse($qrToken->expires_at)->isPast()) {
            return ['expired' => true];
        }

        return [
            'expired' => false,
            'room' => $qrToken->room,
        ];
    }

    /**
     * Revoke a token.
     */
    public function revokeToken(QrRoomToken $token): QrRoomToken
    {
        $token->update(['is_active' => false]);
        return $token->fresh();
    }
}
