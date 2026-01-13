<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\SlaController;
use App\Http\Controllers\NotificationLogController;
use App\Http\Controllers\RoutingRuleController;
use App\Http\Controllers\Api\StaffUserController;
use App\Http\Controllers\Api\StaffRoleController;
use App\Http\Controllers\Api\StaffMembershipController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\IntegrationController;
use Illuminate\Support\Facades\Response;


//==============ali gamal========================================================================

// ========================================
// Integration endpoints for n8n/external automation
// ========================================
Route::prefix('integrations')->group(function () {
    // Guest & Conversation management
    Route::post('/conversations/upsert', [IntegrationController::class, 'upsertConversation']);
    Route::get('/conversations/{conversation}/context', [IntegrationController::class, 'getConversationContext']);
    Route::get('/conversations/{conversation}/chat-id', [IntegrationController::class, 'getChatId']);
    
    // Message logging
    Route::post('/conversations/{conversation}/messages', [IntegrationController::class, 'logMessage']);
    
    // Ticket management
    Route::post('/tickets', [IntegrationController::class, 'createTicket']);
    
    // Handoff management
    Route::post('/conversations/{conversation}/handoff', [IntegrationController::class, 'handoffConversation']);
    
    // QR Code resolution
    Route::post('/qr/resolve', [IntegrationController::class, 'resolveQrToken']);
});

// ========================================
// Webhook endpoints (for n8n callbacks)
// ========================================
Route::prefix('webhooks/n8n')->group(function () {
    // Ticket status updates will be sent here (configured in TicketObserver)
    Route::post('/ticket-updated', function () {
        return response()->json(['received' => true]);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    // 5) Guests
    Route::get('/guests', [GuestController::class, 'index']);
    Route::get('/guests/{guestIdentity}', [GuestController::class, 'show']);

    // 5) Conversations
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::patch('/conversations/{conversation}/status', [ConversationController::class, 'updateStatus']);
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

    // Knowledge Base Management (Admin/Manager only)
    Route::prefix('knowledge-documents')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\KnowledgeDocumentController::class, 'index']);
        Route::get('/{id}', [App\Http\Controllers\Api\KnowledgeDocumentController::class, 'show']);
        Route::post('/', [App\Http\Controllers\Api\KnowledgeDocumentController::class, 'store']);
        Route::delete('/{id}', [App\Http\Controllers\Api\KnowledgeDocumentController::class, 'destroy']);
        Route::post('/{id}/reprocess', [App\Http\Controllers\Api\KnowledgeDocumentController::class, 'reprocess']);
        Route::get('/test/connection', [App\Http\Controllers\Api\KnowledgeDocumentController::class, 'testConnection']);
    });
});



//=================================================================================================


Route::post('/auth/login', [LoginController::class, 'login'])->middleware('throttle:10,1');
Route::post('/auth/forgot-password', [LoginController::class, 'forgotPassword'])->middleware('throttle:10,1');
Route::post('/auth/reset-password', [LoginController::class, 'resetPassword'])->middleware('throttle:10,1');
Route::post('/auth/invite/accept', [LoginController::class, 'acceptInvite'])->middleware('throttle:10,1');
Route::post('/auth/invite', [LoginController::class, 'invite'])->middleware('admin')->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function (): void {
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


// ========================================
// Load modular route files
// ========================================

require __DIR__ . '/api/rooms.php';
require __DIR__ . '/api/departments.php';
require __DIR__ . '/api/channels.php';
require __DIR__ . '/api/qr-tokens.php';
require __DIR__ . '/api/proactive-rules.php';

// ========================================
Route::prefix('staff/memberships')->middleware(['auth:sanctum', 'manager.or.admin'])->group(function () {
    Route::get('/', [StaffMembershipController::class, 'index']);
    Route::post('/', [StaffMembershipController::class, 'store']);
    Route::patch('{id}', [StaffMembershipController::class, 'update']);
    Route::delete('{id}', [StaffMembershipController::class, 'destroy']);
});

Route::prefix('tickets')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [TicketController::class, 'getTickets']);
    Route::post('/', [TicketController::class, 'store'])->middleware('manager.or.admin');
    Route::get('{ticket}', [TicketController::class, 'show']);
    Route::patch('{ticket}', [TicketController::class, 'update'])->middleware('manager.or.admin');
    Route::post('{ticket}/status', [TicketController::class, 'updateStatus']);
    Route::post('{ticket}/assign', [TicketController::class, 'assignStaff'])->middleware('manager.or.admin');
    Route::post('{ticket}/notes', [TicketController::class, 'addNote']);
    Route::post('{ticket}/escalate', [TicketController::class, 'escalate'])->middleware('manager.or.admin');
    Route::get('{ticket}/events', [TicketController::class, 'getEvents']);
    Route::post('{ticket}/rating', [TicketController::class, 'rateTicket']);
    Route::get('{ticket}/rating', [TicketController::class, 'getRating']);
});

Route::prefix('sla/policies')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [SlaController::class, 'getPolicies']);
    Route::post('/', [SlaController::class, 'createPolicy'])->middleware('manager.or.admin');
    Route::patch('{policy}', [SlaController::class, 'updatePolicy'])->middleware('manager.or.admin');
    Route::post('{policy}/deactivate', [SlaController::class, 'deactivatePolicy'])->middleware('manager.or.admin');
});
Route::middleware('auth:sanctum')->get('/sla/breaches', [SlaController::class, 'getBreaches']);

Route::prefix('notifications')->middleware('auth:sanctum')->group(function () {
    Route::post('/logs', [NotificationLogController::class, 'createLog'])->middleware('manager.or.admin');
    Route::get('/logs', [NotificationLogController::class, 'getLogs']);
    Route::post('/logs/{notificationLog}/mark-failed', [NotificationLogController::class, 'markFailed'])->middleware('manager.or.admin');
    Route::post('/logs/{notificationLog}/mark-sent', [NotificationLogController::class, 'markSent'])->middleware('manager.or.admin');
});


Route::prefix('routing-rules')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [RoutingRuleController::class, 'getRules']);
    Route::post('/', [RoutingRuleController::class, 'create'])->middleware('manager.or.admin');
    Route::patch('{routingRule}', [RoutingRuleController::class, 'update'])->middleware('manager.or.admin');
    Route::post('{routingRule}/deactivate', [RoutingRuleController::class, 'deactivate'])->middleware('manager.or.admin');
});


if (app()->environment('local')) { 
    Route::get('/docs', function () {
        $path = base_path('swagger.yaml');

        if (!file_exists($path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Response::file($path, [
            'Content-Type' => 'text/yaml',
        ]);
    });
}