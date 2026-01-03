<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\SlaController;
use App\Http\Controllers\NotificationLogController;
use App\Http\Controllers\Api\StaffUserController;
use App\Http\Controllers\Api\StaffRoleController;
use App\Http\Controllers\Api\StaffMembershipController;
use App\Http\Controllers\Api\LoginController;


Route::post('/auth/login', [LoginController::class, 'login'])->middleware('throttle:10,1');
Route::post('/auth/forgot-password', [LoginController::class, 'forgotPassword'])->middleware('throttle:10,1');
Route::post('/auth/reset-password', [LoginController::class, 'resetPassword'])->middleware('throttle:10,1');
Route::post('/auth/invite/accept', [LoginController::class, 'acceptInvite'])->middleware('throttle:10,1');
Route::post('/auth/invite', [LoginController::class, 'invite'])->middleware('admin')->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () :void {
    Route::post('/auth/logout', [LoginController::class, 'logout']);
    Route::get('/auth/me', [LoginController::class, 'me']);
    Route::post('/auth/invite', [LoginController::class, 'invite'])->middleware('admin');
});
Route::prefix('staff/users')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [StaffUserController::class, 'index'])->middleware('manager.or.admin');
    Route::post('/', [StaffUserController::class, 'store'])->middleware('admin');
    Route::get('{id}', [StaffUserController::class, 'show'])->middleware('manager.or.admin');
    Route::patch('{id}', [StaffUserController::class, 'update'])->middleware('manager.or.admin');
    Route::post('{id}/deactivate', [StaffUserController::class, 'deactivate'])->middleware('admin');
    Route::post('{id}/activate', [StaffUserController::class, 'activate'])->middleware('admin');
    Route::delete('{id}', [StaffUserController::class, 'destroy'])->middleware('admin'); // Soft delete
    Route::post('{id}/restore', [StaffUserController::class, 'restore'])->middleware('admin'); // Restore soft deleted
    Route::delete('{id}/force', [StaffUserController::class, 'forceDelete'])->middleware('admin'); // Permanent delete
});

Route::prefix('staff/roles')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/', [StaffRoleController::class, 'index']);
    Route::post('/', [StaffRoleController::class, 'store']);     // optional
    Route::patch('{id}', [StaffRoleController::class, 'update']); // optional
    Route::delete('{id}', [StaffRoleController::class, 'destroy']); // optional
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
Route::prefix('staff/memberships')->middleware(['auth:sanctum', 'manager.or.admin'])->group(function () {

    Route::get('/', [StaffMembershipController::class, 'index']);
    Route::post('/', [StaffMembershipController::class, 'store']);
    Route::patch('{id}', [StaffMembershipController::class, 'update']);
    Route::delete('{id}', [StaffMembershipController::class, 'destroy']);
});
