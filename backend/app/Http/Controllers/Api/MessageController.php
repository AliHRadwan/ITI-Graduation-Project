<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    use ApiResponse;

    public function index(Request $request, Conversation $conversation)
    {
        $messages = Message::query()
            ->where('conversation_id', $conversation->id)
            ->with(['attachments'])
            ->orderBy('created_at', 'asc')
            ->paginate($request->integer('per_page', 50));

        $items = MessageResource::collection($messages->items())->resolve();

        return $this->paginated($messages, $items);
    }

    public function store(StoreMessageRequest $request, Conversation $conversation)
    {
        // (اختياري) امنع ارسال رسائل لو closed
        // if ($conversation->status === 'closed') {
        //     return response()->json(['message' => 'Conversation is closed'], 422);
        // }
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'role' => $request->validated('role') ?? 'staff',
            'content' => $request->validated('content'),
            'extracted_entities' => $request->validated('extracted_entities'),
            'created_at' => now(),
        ]);

        $conversation->update(['last_seen_at' => now()]);

        $message->load('attachments');
        $data = (new MessageResource($message))->resolve();

        return $this->success($data, 201);
    }
}
