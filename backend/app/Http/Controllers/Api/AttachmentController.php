<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Requests\UploadAttachmentRequest;
use App\Http\Requests\AttachToMessageRequest;
use App\Http\Resources\AttachmentResource;
use App\Http\Resources\AttachmentListResource;
use App\Models\Attachment;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 6);
        $search = trim((string) $request->input('q', ''));

        $attachments = Attachment::query()
            ->leftJoin('messages', 'attachments.message_id', '=', 'messages.id')
            ->leftJoin('conversations', 'messages.conversation_id', '=', 'conversations.id')
            ->leftJoin('guest_identities', 'conversations.guest_identity_id', '=', 'guest_identities.id')
            ->leftJoin('rooms', 'conversations.room_id', '=', 'rooms.id')
            ->select('attachments.*')
            ->with(['message.conversation.room', 'message.conversation.guestIdentity'])
            ->when($search !== '', function ($query) use ($search) {
                $like = '%' . $search . '%';
                $query->where(function ($inner) use ($like) {
                    $inner->where('attachments.storage_url', 'like', $like)
                        ->orWhere('attachments.mime_type', 'like', $like)
                        ->orWhere('attachments.type', 'like', $like)
                        ->orWhere('messages.id', 'like', $like)
                        ->orWhere('conversations.id', 'like', $like)
                        ->orWhere('conversations.status', 'like', $like)
                        ->orWhere('guest_identities.channel_user_id', 'like', $like)
                        ->orWhere('rooms.room_number', 'like', $like);
                });
            })
            ->orderByDesc('messages.created_at')
            ->paginate($perPage);

        $items = AttachmentListResource::collection($attachments->items())->resolve();

        return $this->paginated($attachments, $items);
    }

    public function upload(UploadAttachmentRequest $request)
    {
        $file = $request->file('file');
        if (! $file) {
            return response()->json(['message' => 'The file is missing'], 400);
        }

        $disk = config('filesystems.default', 'public');
        $path = $file->store('attachments', ['disk' => $disk]);
        if (! $path) {
            return response()->json(['message' => 'Error in saving the file'], 500);
        }

        $mime = $file->getMimeType() ?: $file->getClientMimeType();
        $size = (int) $file->getSize();

        $type = match (true) {
            str_starts_with((string)$mime, 'image/') => 'image',
            str_starts_with((string)$mime, 'audio/') => 'audio',
            str_starts_with((string)$mime, 'video/') => 'video',
            default => 'file',
        };

        $url = Storage::disk($disk)->url($path);

        return $this->success([
            'type' => $type,
            'storage_url' => $url,
            'mime_type' => $mime,
            'size_bytes' => $size,
            'path' => $path,
            'disk' => $disk,
        ], 201);
    }

    public function attachToMessage(AttachToMessageRequest $request, Message $message)
    {
        $attachment = Attachment::create([
            'message_id' => $message->id,
            'type' => $request->validated('type'),
            'storage_url' => $request->validated('storage_url'),
            'mime_type' => $request->validated('mime_type'),
            'size_bytes' => $request->validated('size_bytes'),
            'transcript' => $request->validated('transcript'),
        ]);

        $data = (new AttachmentResource($attachment))->resolve();
        return $this->success($data, 201);
    }

    public function show(Attachment $attachment)
    {
        $data = (new AttachmentResource($attachment))->resolve();
        return $this->success($data);
    }
}
