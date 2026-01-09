<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GuestIdentity;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Ticket;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class IntegrationController extends Controller
{
    /**
     * Upsert guest identity and get/create active conversation
     * Used by n8n to register guest and get conversation context
     */
    public function upsertConversation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'channel_type' => 'required|string',
            'channel_user_id' => 'required|string',
            'chat_id' => 'required|string',
            'room_id' => 'nullable|uuid|exists:rooms,id',
            'preferred_language' => 'nullable|string|max:10',
            'user_metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            // Find or create guest identity
            $guest = GuestIdentity::firstOrCreate(
                [
                    'channel_type' => $request->channel_type,
                    'channel_user_id' => $request->channel_user_id,
                ],
                [
                    'preferred_language' => $request->preferred_language ?? 'en',
                    'first_seen_at' => now(),
                ]
            );

            // Update preferred language if changed
            if ($request->preferred_language && $guest->preferred_language !== $request->preferred_language) {
                $guest->update(['preferred_language' => $request->preferred_language]);
            }

            // Find or create open conversation
            $conversation = Conversation::firstOrCreate(
                [
                    'guest_identity_id' => $guest->id,
                    'status' => 'open',
                ],
                [
                    'started_at' => now(),
                    'last_seen_at' => now(),
                ]
            );

            // Update last_seen_at and store chat_id
            $metadata = is_array($conversation->metadata) ? $conversation->metadata : [];
            $metadata['chat_id'] = $request->chat_id;
            if ($request->user_metadata) {
                $metadata['user_metadata'] = $request->user_metadata;
            }

            // Update conversation with room_id if provided (from QR scan)
            $updateData = [
                'last_seen_at' => now(),
                'metadata' => $metadata,
            ];

            if ($request->room_id && !$conversation->room_id) {
                $updateData['room_id'] = $request->room_id;
            }

            $conversation->update($updateData);

            // Get room info if conversation is linked to a room
            $room = $conversation->room;

            return response()->json([
                'guest_identity_id' => $guest->id,
                'conversation_id' => $conversation->id,
                'room_id' => $conversation->room_id,
                'room_number' => $room?->room_number,
                'status' => $conversation->status,
                'is_handoff' => $conversation->status === 'handoff',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to upsert conversation',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get conversation context for LLM
     * Returns recent messages, room info, and open tickets
     */
    public function getConversationContext(Request $request, $conversationId)
    {
        $limit = $request->query('limit', 5);
        $includeTickets = $request->query('include_tickets', 'true') === 'true';

        try {
            $conversation = Conversation::with('room')->findOrFail($conversationId);

            // Get recent messages
            $recentMessages = Message::where('conversation_id', $conversationId)
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->reverse()
                ->map(function ($msg) {
                    return [
                        'role' => $msg->role,
                        'content' => $msg->content,
                        'created_at' => $msg->created_at->toIso8601String(),
                    ];
                })
                ->values();

            // Get open tickets if requested
            $openTickets = [];
            $openTicketsCount = 0;

            if ($includeTickets) {
                $openTickets = Ticket::where('conversation_id', $conversationId)
                    ->whereIn('status', ['open', 'in_progress'])
                    ->get()
                    ->map(function ($ticket) {
                        return [
                            'id' => $ticket->id,
                            'category' => $ticket->category,
                            'priority' => $ticket->priority,
                            'description' => $ticket->description,
                            'status' => $ticket->status,
                        ];
                    });
                $openTicketsCount = $openTickets->count();
            }

            return response()->json([
                'conversation_id' => $conversation->id,
                'room' => $conversation->room ? [
                    'room_number' => $conversation->room->room_number,
                    'floor' => $conversation->room->floor,
                    'room_type' => $conversation->room->room_type,
                ] : null,
                'recent_messages' => $recentMessages,
                'open_tickets' => $openTickets,
                'open_tickets_count' => $openTicketsCount,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get conversation context',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Log a message to the conversation
     * Used by n8n to store both guest and assistant messages
     */
    public function logMessage(Request $request, $conversationId)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:guest,agent,staff,system',
            'content' => 'required|string',
            'extracted_entities' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            // 👇 Get only the valid data safely
            $data = $validator->validated();

            $message = Message::create([
                'conversation_id' => $conversationId,
                'role' => $data['role'],
                'content' => $data['content'], // This works now!
                'extracted_entities' => $data['extracted_entities'] ?? null,
                'created_at' => now(),
            ]);

            return response()->json([
                'message_id' => $message->id,
                'created_at' => $message->created_at->toIso8601String(),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to log message',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a ticket from n8n
     * Used for service requests, complaints, emergencies
     * Auto-assigns to department and least-busy staff using round-robin
     */
    public function createTicket(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'conversation_id' => 'required|uuid|exists:conversations,id',
            'room_id' => 'nullable|uuid|exists:rooms,id',
            'category' => 'required|in:housekeeping,food_and_drinks,maintenance,room_service,other',
            'priority' => 'required|in:low,medium,high,urgent',
            'description' => 'required|string',
            'source' => 'nullable|string',
            'is_emergency' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // 0️⃣ Validate and get room_id (explicit from request or fallback from conversation)
            $roomId = $request->room_id;

            // Fallback: Get room_id from conversation if not provided
            if (!$roomId) {
                $conversation = Conversation::findOrFail($request->conversation_id);
                $roomId = $conversation->room_id;
            }

            // Validate room_id exists (guest must scan QR code first)
            if (!$roomId) {
                DB::rollBack();
                return response()->json([
                    'error' => 'Room information required',
                    'message' => 'Cannot create ticket without room information. Guest must scan the room QR code first to link their conversation to a room.',
                    'hint' => 'Ask the guest to scan the QR code in their room.'
                ], 422);
            }

            // Verify room exists and is valid
            $room = Room::findOrFail($roomId);

            // 1️⃣ Find department based on category using routing rules
            $departmentId = null;
            $routingRule = \App\Models\RoutingRule::where('match_category', $request->category)
                ->where('is_active', true)
                ->first();

            if ($routingRule) {
                $departmentId = $routingRule->department_id;
            }

            // 2️⃣ Find least-busy staff in the department (Round-Robin)
            $staffUserId = null;

            if ($departmentId) {
                $leastBusyMembership = \App\Models\StaffMembership::where('department_id', $departmentId)
                    ->whereHas('staffUser', function ($q) {
                        $q->where('status', 'active'); // Only active staff
                    })
                    ->with('staffUser')
                    ->get()
                    ->map(function ($membership) {
                        // Count open tickets for each staff member
                        $openTickets = \App\Models\Ticket::where('actor_staff_user_id', $membership->staff_user_id)
                            ->whereIn('status', ['new', 'doing'])
                            ->count();

                        $membership->open_ticket_count = $openTickets;
                        return $membership;
                    })
                    ->sortBy('open_ticket_count')
                    ->first();

                if ($leastBusyMembership) {
                    $staffUserId = $leastBusyMembership->staff_user_id;
                }
            }

            // 3️⃣ Create ticket with auto-assignment
            $ticket = Ticket::create([
                'conversation_id' => $request->conversation_id,
                'room_id' => $roomId, // Validated room_id from request or conversation
                'department_id' => $departmentId,
                'actor_staff_user_id' => $staffUserId,
                'category' => $request->category,
                'priority' => $request->priority,
                'description' => $request->description,
                'status' => 'new',
            ]);

            // 4️⃣ Log ticket creation event
            $eventDescription = $request->is_emergency
                ? 'Emergency ticket created via AI agent'
                : 'Ticket created via AI agent';

            if ($staffUserId) {
                $eventDescription .= ' and auto-assigned via round-robin';
            }

            $ticket->events()->create([
                'event_type' => 'created',
                'description' => $eventDescription,
                'metadata' => [
                    'source' => $request->source ?? 'n8n_agent',
                    'is_emergency' => $request->is_emergency ?? false,
                    'auto_assigned' => $staffUserId !== null,
                    'assignment_method' => 'round_robin',
                ],
            ]);

            // 5️⃣ Log assignment event if staff was assigned
            if ($staffUserId) {
                $ticket->events()->create([
                    'event_type' => 'assigned',
                    'description' => 'Auto-assigned to staff member via round-robin algorithm',
                    'metadata' => [
                        'staff_user_id' => $staffUserId,
                        'department_id' => $departmentId,
                    ],
                ]);
            }

            DB::commit();

            return response()->json([
                'ticket_id' => $ticket->id,
                'status' => $ticket->status,
                'department_id' => $departmentId,
                'assigned_staff_id' => $staffUserId,
                'auto_assigned' => $staffUserId !== null,
                'notification_sent' => false, // Update when notification system is integrated
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Failed to create ticket',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark conversation as handoff
     * Notifies staff that human intervention is needed
     */
    public function handoffConversation(Request $request, $conversationId)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high,urgent',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $conversation = Conversation::findOrFail($conversationId);

            $conversation->update([
                'status' => 'handoff',
            ]);

            // Store handoff details in metadata
            $metadata = is_array($conversation->metadata) ? $conversation->metadata : [];
            $metadata['handoff'] = [
                'reason' => $request->reason,
                'priority' => $request->priority ?? 'medium',
                'requested_at' => now()->toIso8601String(),
            ];
            $conversation->update(['metadata' => $metadata]);

            // TODO: Notify staff about handoff request
            // This would integrate with your notification system

            return response()->json([
                'conversation_id' => $conversation->id,
                'status' => $conversation->status,
                'handoff_requested' => true,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to handoff conversation',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get chat_id for a conversation (for proactive notifications)
     */
    public function getChatId($conversationId)
    {
        try {
            $conversation = Conversation::findOrFail($conversationId);

            $metadata = is_array($conversation->metadata) ? $conversation->metadata : [];
            $chatId = $metadata['chat_id'] ?? null;

            if (!$chatId) {
                return response()->json([
                    'error' => 'Chat ID not found for this conversation'
                ], 404);
            }

            return response()->json([
                'chat_id' => $chatId,
                'channel_type' => $conversation->guestIdentity->channel_type ?? 'telegram',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get chat ID',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resolve QR token and return room information
     * Used by n8n when guest scans QR code from /start command
     */
    public function resolveQrToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            // Find the QR token by UUID (the token is the UUID itself from the deep link)
            $qrToken = \App\Models\QrRoomToken::with('room')
                ->where('id', $request->token)
                ->where('expires_at', '>', now())
                ->first();

            if (!$qrToken) {
                return response()->json([
                    'error' => 'Invalid or expired token',
                    'message' => 'The QR code has expired or is invalid. Please request a new QR code from the front desk.'
                ], 404);
            }

            // Mark token as used
            $qrToken->update(['last_used_at' => now()]);

            return response()->json([
                'room_id' => $qrToken->room_id,
                'room_number' => $qrToken->room->room_number,
                'floor' => $qrToken->room->floor,
                'room_type' => $qrToken->room->room_type,
                'token_id' => $qrToken->id,
                'success' => true,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to resolve QR token',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
