<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'role' => $this->role,
            'sender_type' => in_array($this->role, ['staff', 'agent', 'system'], true) ? 'staff' : 'user',
            'sender' => null,
            'body' => $this->content,
            'content' => $this->content,
            'extracted_entities' => $this->extracted_entities,
            'created_at' => optional($this->created_at)->toISOString(),
            'attachments' => AttachmentResource::collection($this->whenLoaded('attachments')),
        ];
    }
}
