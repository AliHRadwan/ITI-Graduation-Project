<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\QrRoomToken\IssueTokenRequest;
use App\Http\Resources\QrRoomTokenResource;
use App\Models\QrRoomToken;
use App\Models\Room;
use App\Services\QrTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class QrRoomTokenController extends Controller
{
    protected QrTokenService $qrTokenService;

    public function __construct(QrTokenService $qrTokenService)
    {
        $this->qrTokenService = $qrTokenService;
    }

    /**
     * Issue a QR deep-link token for a room.
     * POST /qr/rooms/{roomId}/tokens
     */
    public function issueToken(IssueTokenRequest $request, string $roomId): JsonResponse
    {
        $room = Room::findOrFail($roomId);

        $result = $this->qrTokenService->generateToken(
            $room,
            $request->validated('expires_at')
        );

        return response()->json([
            'success' => true,
            'message' => 'QR token issued successfully',
            'data' => [
                'id' => $result['qr_token']->id,
                'token' => $result['plain_token'],
                'room_id' => $room->id,
                'room_number' => $room->room_number,
                'issued_at' => $result['qr_token']->issued_at->toISOString(),
                'expires_at' => $result['qr_token']->expires_at?->toISOString(),
                'deep_link' => $result['deep_link'],
            ],
        ], 201);
    }

    /**
     * Resolve QR token to room_id.
     * GET /qr/resolve/{token}
     */
    public function resolveToken(string $token): JsonResponse
    {
        $result = $this->qrTokenService->resolveToken($token);

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or inactive token',
            ], 404);
        }

        if ($result['expired']) {
            return response()->json([
                'success' => false,
                'message' => 'Token has expired',
            ], 410);
        }

        $room = $result['room'];

        return response()->json([
            'success' => true,
            'data' => [
                'room_id' => $room->id,
                'room_number' => $room->room_number,
                'room_status' => $room->status,
            ],
        ]);
    }

    /**
     * Revoke a token.
     * POST /qr/tokens/{id}/revoke
     */
    public function revokeToken(string $id): JsonResponse
    {
        $qrToken = QrRoomToken::findOrFail($id);
        $updated = $this->qrTokenService->revokeToken($qrToken);

        return response()->json([
            'success' => true,
            'message' => 'Token revoked successfully',
            'data' => new QrRoomTokenResource($updated),
        ]);
    }

    /**
     * List all tokens for a room.
     * GET /qr/rooms/{roomId}/tokens
     */
    public function listRoomTokens(string $roomId): AnonymousResourceCollection
    {
        $room = Room::findOrFail($roomId);
        
        $tokens = QrRoomToken::where('room_id', $roomId)
            ->orderBy('issued_at', 'desc')
            ->get();

        return QrRoomTokenResource::collection($tokens);
    }
}
