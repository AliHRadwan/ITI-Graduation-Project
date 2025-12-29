<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// 1. Login Route: Issues the Token
Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    // Create a new token for the user
    // You can name the token anything, e.g., 'auth_token'
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'access_token' => $token,
        'token_type' => 'Bearer',
    ]);
});

// 2. Logout Route: Deletes the Token
Route::middleware('auth:sanctum')->post('/logout', function (Request $request) {
    // Revoke the token that was used to authenticate the current request
    $request->user()->tokens()->delete();

    return response()->json(['message' => 'Logged out successfully']);
});

// 3. User Route: Protected by Sanctum
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// ========================================
// Load modular route files
// ========================================

require __DIR__ . '/api/rooms.php';
require __DIR__ . '/api/departments.php';
require __DIR__ . '/api/channels.php';
require __DIR__ . '/api/qr-tokens.php';
require __DIR__ . '/api/proactive-rules.php';