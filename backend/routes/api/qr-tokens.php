<?php

use App\Http\Controllers\Api\QrRoomTokenController;
use Illuminate\Support\Facades\Route;

// Temporarily removed auth:sanctum for testing
Route::post('/qr/rooms/{roomId}/tokens', [QrRoomTokenController::class, 'issueToken']);
Route::get('/qr/rooms/{roomId}/tokens', [QrRoomTokenController::class, 'listRoomTokens']);
Route::post('/qr/tokens/{id}/revoke', [QrRoomTokenController::class, 'revokeToken']);

// Public route for resolving QR tokens (used by web widget / n8n)
Route::get('/qr/resolve/{token}', [QrRoomTokenController::class, 'resolveToken']);
