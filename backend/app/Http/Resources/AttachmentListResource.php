<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttachmentListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $message = $this->whenLoaded('message');
        $conversation = $message?->conversation;
        $room = $conversation?->room;
        $guest = $conversation?->guestIdentity;

        $filename = null;
        if (!empty($this->storage_url)) {
            $path = parse_url($this->storage_url, PHP_URL_PATH) ?: $this->storage_url;
            $filename = basename($path);
        }

        return [
            'id' => $this->id,
            'file_name' => $filename,
            'type' => $this->type,
            'storage_url' => $this->storage_url,
            'mime_type' => $this->mime_type,
            'size_bytes' => $this->size_bytes,
            'created_at' => optional($message?->created_at)->toISOString(),
            'message' => $message ? [
                'id' => $message->id,
                'created_at' => optional($message->created_at)->toISOString(),
            ] : null,
            'conversation' => $conversation ? [
                'id' => $conversation->id,
                'status' => $conversation->status,
                'channel_user_id' => $guest?->channel_user_id,
            ] : null,
            'room' => $room ? [
                'id' => $room->id,
                'number' => $room->room_number,
            ] : null,
        ];
    }
}
