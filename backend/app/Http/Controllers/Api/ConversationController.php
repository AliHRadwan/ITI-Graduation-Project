<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\ConversationDetailResource;
use App\Models\Conversation;
use Illuminate\Http\Request;
use App\Http\Requests\ListConversationsRequest;

class ConversationController extends Controller
{
    use ApiResponse;

    public function index(ListConversationsRequest $request)
    {
        $filters = $request->validated();
    
        $status  = $filters['status'] ?? null;
        $roomId  = $filters['room_id'] ?? null;
        $guestId = $filters['guest_id'] ?? null;
        $perPage = $filters['per_page'] ?? 3;

        $statusList = null;
        if ($status) {
            $statusList = is_array($status) ? $status : [$status];
            $statusList = array_map('strtolower', $statusList);
        }
    
        $conversations = Conversation::query()
            ->with(['guestIdentity', 'room', 'lastMessage'])
            ->when($statusList, fn($q) => $q->whereIn('status', $statusList))
            ->when($roomId, fn($q) => $q->where('room_id', $roomId))
            ->when($guestId, fn($q) => $q->where('guest_identity_id', $guestId))
            ->orderByDesc('last_seen_at')
            ->orderByDesc('started_at')
            ->paginate((int) $perPage);
    
        $items = ConversationResource::collection($conversations->items())->resolve();
    
        return $this->paginated($conversations, $items);
    }

    public function show(Conversation $conversation)
    {
        $conversation->load(['guestIdentity', 'room', 'lastMessage']);
        $data = (new ConversationDetailResource($conversation))->resolve();

        return $this->success($data);
    }

    public function handoff(Conversation $conversation)
    {
        $conversation->update([
            'status' => 'handoff',
            'last_seen_at' => now(),
        ]);

        $conversation->load(['guestIdentity', 'room', 'lastMessage']);
        $data = (new ConversationDetailResource($conversation))->resolve();

        return $this->success($data);
    }

    public function close(Conversation $conversation)
    {
        $conversation->update([
            'status' => 'closed',
            'last_seen_at' => now(),
        ]);

        $conversation->load(['guestIdentity', 'room', 'lastMessage']);
        $data = (new ConversationDetailResource($conversation))->resolve();

        return $this->success($data);
    }

    public function updateStatus(Request $request, Conversation $conversation)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:open,closed,handoff,OPEN,CLOSED,HANDOFF',
        ]);

        $status = strtolower($validated['status']);

        $conversation->update([
            'status' => $status,
            'last_seen_at' => now(),
        ]);

        $conversation->load(['guestIdentity', 'room', 'lastMessage']);
        $data = (new ConversationDetailResource($conversation))->resolve();

        return $this->success($data);
    }
}
