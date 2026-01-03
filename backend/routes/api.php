<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\SlaController;
use App\Http\Controllers\NotificationLogController;

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

Route::middleware('auth:sanctum')->get('/tickets', [TicketController::class, 'getTickets'])->name('tickets.getTickets');
Route::middleware('auth:sanctum')->post('/tickets', [TicketController::class, 'store'])->name('tickets.store');
Route::middleware('auth:sanctum')->get('/tickets/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
Route::middleware('auth:sanctum')->patch('/tickets/{ticket}', [TicketController::class, 'update'])->name('tickets.update');
Route::middleware('auth:sanctum')->post('/tickets/{ticket}/status', [TicketController::class, 'updateStatus'])->name('tickets.updateStatus');
Route::middleware('auth:sanctum')->post('/tickets/{ticket}/assign', [TicketController::class, 'assignStaff'])->name('tickets.assignStaff');
Route::middleware('auth:sanctum')->post('/tickets/{ticket}/notes', [TicketController::class, 'addNote'])->name('tickets.addNote');
Route::middleware('auth:sanctum')->post('/tickets/{ticket}/escalate', [TicketController::class, 'escalate'])->name('tickets.escalate');
Route::middleware('auth:sanctum')->get('/tickets/{ticket}/events', [TicketController::class, 'getEvents'])->name('tickets.getEvents');
Route::middleware('auth:sanctum')->post('/tickets/{ticket}/rating', [TicketController::class, 'rateTicket'])->name('tickets.rateTicket');
Route::middleware('auth:sanctum')->get('/tickets/{ticket}/rating', [TicketController::class, 'getRating'])->name('tickets.getRating');

Route::middleware('auth:sanctum')->get('/sla/policies', [SlaController::class, 'getPolicies'])->name('sla.getPolicies');
Route::middleware('auth:sanctum')->post('/sla/policies', [SlaController::class, 'createPolicy'])->name('sla.createPolicy');
Route::middleware('auth:sanctum')->patch('/sla/policies/{policy}', [SlaController::class, 'updatePolicy'])->name('sla.updatePolicy');
Route::middleware('auth:sanctum')->post('/sla/policies/{policy}/deactivate', [SlaController::class, 'deactivatePolicy'])->name('sla.deactivatePolicy');
Route::middleware('auth:sanctum')->get('/sla/breaches', [SlaController::class, 'getBreaches'])->name('sla.getBreaches');

Route::middleware('auth:sanctum')->post('/notifications/log', [NotificationLogController::class, 'createLog'])->name('logs.createLog');
Route::middleware('auth:sanctum')->get('/notifications/logs', [NotificationLogController::class, 'getLogs'])->name('logs.getLogs');
Route::middleware('auth:sanctum')->post('/notifications/logs/{notificationLog}/mark-failed', [NotificationLogController::class, 'markFailed'])->name('logs.markFailed');
Route::middleware('auth:sanctum')->post('/notifications/logs/{notificationLog}/mark-sent', [NotificationLogController::class, 'markSent'])->name('logs.markSent');