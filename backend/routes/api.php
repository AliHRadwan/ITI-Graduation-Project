<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\AttachmentController;

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


//==============ali gamal========================================================================

// Route::middleware('auth:sanctum')->group(function () {  // لو عندك auth

// 5) Guests
Route::get('/guests', [GuestController::class, 'index']);
Route::get('/guests/{guestIdentity}', [GuestController::class, 'show']);

// 5) Conversations
Route::get('/conversations', [ConversationController::class, 'index']);
Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
Route::post('/conversations/{conversation}/handoff', [ConversationController::class, 'handoff']);
Route::post('/conversations/{conversation}/close', [ConversationController::class, 'close']);

// 5) Messages
Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index']);
Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);

// 6) Attachments
Route::post('/attachments/upload', [AttachmentController::class, 'upload']);
Route::get('/attachments/{attachment}', [AttachmentController::class, 'show']);
Route::post('/messages/{message}/attachments', [AttachmentController::class, 'attachToMessage']);

// });

//=================================================================================================