<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SearchController;



//==============ali gamal========================================================================

Route::middleware('auth:sanctum')->group(function () {  
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

// Dashboard & Reporting
Route::get('/dashboard/metrics', [DashboardController::class, 'getMetrics']);
Route::get('/dashboard/reports/tickets', [DashboardController::class, 'getTicketReports']);
Route::get('/dashboard/reports/sla', [DashboardController::class, 'getSLAReports']);
Route::get('/search', [SearchController::class, 'search']);

});

//=================================================================================================

use App\Http\Controllers\TicketController;
use App\Http\Controllers\SlaController;
use App\Http\Controllers\NotificationLogController;
use App\Http\Controllers\RoutingRuleController;
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

Route::prefix('staff/memberships')->middleware(['auth:sanctum', 'manager.or.admin'])->group(function () {
    Route::get('/', [StaffMembershipController::class, 'index']);
    Route::post('/', [StaffMembershipController::class, 'store']);
    Route::patch('{id}', [StaffMembershipController::class, 'update']);
    Route::delete('{id}', [StaffMembershipController::class, 'destroy']);
});

Route::prefix('tickets')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [TicketController::class, 'getTickets']);
    Route::post('/', [TicketController::class, 'store']);
    Route::get('{ticket}', [TicketController::class, 'show']);
    Route::patch('{ticket}', [TicketController::class, 'update']);
    Route::post('{ticket}/status', [TicketController::class, 'updateStatus']);
    Route::post('{ticket}/assign', [TicketController::class, 'assignStaff']);
    Route::post('{ticket}/notes', [TicketController::class, 'addNote']);
    Route::post('{ticket}/escalate', [TicketController::class, 'escalate']);
    Route::get('{ticket}/events', [TicketController::class, 'getEvents']);
    Route::post('{ticket}/rating', [TicketController::class, 'rateTicket']);
    Route::get('{ticket}/rating', [TicketController::class, 'getRating']);
});

Route::prefix('sla/policies')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [SlaController::class, 'getPolicies']);
    Route::post('/', [SlaController::class, 'createPolicy']);
    Route::patch('{policy}', [SlaController::class, 'updatePolicy']);
    Route::post('{policy}/deactivate', [SlaController::class, 'deactivatePolicy']);
});
Route::middleware('auth:sanctum')->get('/sla/breaches', [SlaController::class, 'getBreaches']);

Route::prefix('notifications')->middleware('auth:sanctum')->group(function () {
    Route::post('/log', [NotificationLogController::class, 'createLog']);
    Route::get('/logs', [NotificationLogController::class, 'getLogs']);
    Route::post('/logs/{notificationLog}/mark-failed', [NotificationLogController::class, 'markFailed']);
    Route::post('/logs/{notificationLog}/mark-sent', [NotificationLogController::class, 'markSent']);
});


Route::prefix('routing-rules')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [RoutingRuleController::class, 'getRules']);
    Route::post('/', [RoutingRuleController::class, 'create']);
    Route::patch('{routingRule}', [RoutingRuleController::class, 'update']);
    Route::post('{routingRule}/deactivate', [RoutingRuleController::class, 'deactivate']);
});



