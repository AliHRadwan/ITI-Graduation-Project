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